######################################################################################################
# SPDX-FileCopyrightText: Copyright (c) 2024-2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: LicenseRef-NvidiaProprietary
#
# NVIDIA CORPORATION, its affiliates and licensors retain all intellectual
# property and proprietary rights in and to this material, related
# documentation and any modifications thereto. Any use, reproduction,
# disclosure or distribution of this material and related documentation
# without an express license agreement from NVIDIA CORPORATION or
# its affiliates is strictly prohibited.
######################################################################################################

import concurrent.futures
import json
import os
import random
import subprocess
import sys

import numpy
import torch
from filelock import FileLock
from transformers import AutoConfig, AutoTokenizer, GenerationConfig

from vila_logger import logger

# Add detailed logging for VILA model operations
from loguru import logger as log

# Configure specialized loggers for model operations
import logging
logging.getLogger("transformers").setLevel(logging.WARNING)
logging.getLogger("torch").setLevel(logging.WARNING)

# Setup VILA model logger
vila_model_logger = log.bind(component="vila_model")
vila_model_logger.add("logs/vila_model.log", 
                      format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | VILA_MODEL | {message}",
                      level="DEBUG", rotation="10 MB", compression="zip")

sys.path.append(os.path.dirname(__file__) + "/VILA")

import llava.model.language_model.llava_llama  # noqa: E402, F401
from llava.conversation import conv_templates  # noqa: E402
from llava.mm_utils import get_model_name_from_path  # noqa: E402
from llava.utils import disable_torch_init  # noqa: E402

class Vila15:
    TRTLLM_EXECUTOR_INFLIGHT_BATCHING = True

    def __init__(
        self, model_path, use_trt=True, trt_engine_dir="", async_output=False, max_batch_size=None
    ) -> None:
        vila_model_logger.info("🚀 VILA 1.5 MODEL INITIALIZATION STARTED")
        vila_model_logger.info(f"Model path: {model_path}")
        vila_model_logger.info(f"Use TRT: {use_trt}")
        vila_model_logger.info(f"TRT engine dir: {trt_engine_dir}")
        vila_model_logger.info(f"Async output: {async_output}")
        vila_model_logger.info(f"Max batch size: {max_batch_size}")
        
        disable_torch_init()
        self._model = None
        
        vila_model_logger.debug("Loading model configuration...")
        self._model_config = AutoConfig.from_pretrained(model_path).llm_cfg
        vila_model_logger.debug(f"Model config loaded: {self._model_config}")
        
        vila_model_logger.debug("Loading generation configuration...")
        self._generation_config = GenerationConfig.from_pretrained(model_path + "/llm")
        vila_model_logger.debug(f"Generation config: {self._generation_config}")
        
        self._max_batch_size = max_batch_size
        self._inflight_req_ids = []
        self._next_extra_id = 1
        
        vila_model_logger.debug("Basic initialization complete")

        self._lora_config = None
        self._lora_weights = None
        self._lora_config_id = 10

        lora_model_path = os.environ.get("VILA_LORA_PATH", "")
        if lora_model_path:
            logger.info("LoRA model path is set: %s", lora_model_path)
            lock_file_path = os.path.join(lora_model_path, ".lock")
            lora_trt_weights_path = os.path.join(lora_model_path, "trt_weights")
            with FileLock(lock_file_path):
                if not os.path.isfile(
                    os.path.join(lora_trt_weights_path, "model.lora_config.npy")
                ) or not os.path.isfile(
                    os.path.join(lora_trt_weights_path, "model.lora_weights.npy")
                ):
                    logger.info("Converting LoRA weights ...")
                    result = subprocess.run(
                        [
                            "python3",
                            os.path.join(
                                os.path.dirname(__file__), "trt_helper/hf_lora_convert.py"
                            ),
                            "-i",
                            lora_model_path,
                            "-o",
                            lora_trt_weights_path,
                            "--storage-type",
                            "float16",
                        ]
                    )
                    if result.returncode:
                        logger.error("Failed to convert LoRA weights")
                        raise Exception("Failed to convert LoRA weights")

            self._lora_config = torch.from_numpy(
                numpy.load(os.path.join(lora_trt_weights_path, "model.lora_config.npy"))
            ).squeeze(0)
            self._lora_weights = torch.from_numpy(
                numpy.load(os.path.join(lora_trt_weights_path, "model.lora_weights.npy"))
            ).squeeze(0)
            logger.info(f"LoRA weights loaded from {lora_trt_weights_path}")

        # Load the TRT model
        import tensorrt_llm.bindings.executor as trtllm

        if self._lora_weights is not None:
            self._trt_lora_config = trtllm.LoraConfig(
                self._lora_config_id, self._lora_weights, self._lora_config
            )
        else:
            self._trt_lora_config = None

        with open(os.path.join(trt_engine_dir, "config.json")) as f:
            logger.debug("Loading config from %s", os.path.join(trt_engine_dir, "config.json"))
            config = json.load(f)
            if config["build_config"]["plugin_config"]["lora_plugin"]:
                peft_config = trtllm.PeftCacheConfig(
                    device_cache_percent=float(
                        os.environ.get("TRT_LLM_LORA_CACHE_DEVICE_MEM_USAGE_FRACTION", "")
                        or 0.1
                    ),
                    host_cache_size=int(
                        os.environ.get("TRT_LLM_LORA_CACHE_HOST_MEM_USAGE_BYTES", "")
                        or 10 * 1024 * 1024 * 1024
                    ),
                )
            else:
                peft_config = trtllm.PeftCacheConfig()

        executor_config = trtllm.ExecutorConfig(
            kv_cache_config=trtllm.KvCacheConfig(
                free_gpu_memory_fraction=float(
                    os.environ.get("TRT_LLM_MEM_USAGE_FRACTION", "") or 0.4
                )
            ),
            peft_cache_config=peft_config,
        )
        self._executor = trtllm.Executor(
            trt_engine_dir, trtllm.ModelType.DECODER_ONLY, executor_config
        )
        self._output_tpool = (
            concurrent.futures.ThreadPoolExecutor(
                max_workers=max_batch_size if self.TRTLLM_EXECUTOR_INFLIGHT_BATCHING else 2
            )
            if async_output
            else None
        )

        self._model_name = get_model_name_from_path(model_path)

        # Load the tokenizer
        self._tokenizer = AutoTokenizer.from_pretrained(model_path + "/llm", use_fast=True)

        # Conversation template from the model name
        model_name = get_model_name_from_path(model_path)

        # Create a copy of the conversation template
        self._conv = conv_templates["hermes-2"].copy()
        if "mpt" in model_name.lower():
            self._roles = ("user", "assistant")
        else:
            self._roles = self._conv.roles

    @property
    def model_name(self):
        return self._model_name

    @property
    def model_config(self):
        return self._model_config

    def get_conv(self):
        return self._conv.copy()

    def can_enqueue_requests(self):
        return (
            not self.TRTLLM_EXECUTOR_INFLIGHT_BATCHING
            or len(self._inflight_req_ids) < self._max_batch_size
        )

    def _postprocess(self, req_id, output_ids, input_token_length):
        if req_id:
            responses = self._executor.await_responses(req_id)
            self._inflight_req_ids.remove(req_id)
            output_ids = torch.tensor([responses[0].result.output_token_ids[0]])
            output_token_length = output_ids.shape[-1]

        # Decode the output_ids to get the output string
        outputs = self._tokenizer.batch_decode(output_ids, skip_special_tokens=True)
        outputs = [output.strip() for output in outputs]
        return outputs, [
            {"input_tokens": input_token_length, "output_tokens": output_token_length},
        ] * len(outputs)

    def _get_input_ids_from_prompt(self, prompt, image_embeds):
        """
        Tokenize the input prompt. Replace <image> tag with pointer to the
        image embeddings
        """
        # Split the input into chunks.
        prompt_chunks = prompt.split("<image>")
        logger.debug(f"Prompt split into {len(prompt_chunks)} chunks by <image> tag")
        logger.debug(f"Image embeds shape: {image_embeds.shape}")
        input_ids = []
        extra_input_ids = []
        extra_input_id = self._next_extra_id
        self._next_extra_id = 1 + (self._next_extra_id % 10000)

        # Tokenize the prompt chunk by chunk
        for idx, prompt_chunk in enumerate(prompt_chunks):
            if idx > 0:
                # Replace <image> tag with pointer to the image embedding
                image_embed_input_ids = torch.arange(
                    self.model_config["vocab_size"] + image_embeds.shape[1] * (idx - 1),
                    self.model_config["vocab_size"] + image_embeds.shape[1] * idx,
                )
                image_embed_input_ids = image_embed_input_ids.reshape(1, image_embeds.shape[1])

                # Insert pointer to image embedding in input_ids
                input_ids.extend(image_embed_input_ids)
                extra_input_ids.extend(
                    [
                        extra_input_id,
                    ]
                    * image_embed_input_ids.shape[1]
                )
            # Insert tokenized prompt chunk in input_ids
            text_token_ids = self._tokenizer(
                prompt_chunk, return_tensors="pt", padding=True
            ).input_ids
            input_ids.extend(text_token_ids)
            extra_input_ids.extend(
                [
                    0,
                ]
                * len(text_token_ids[0])
            )
        # Convert list of input ids to a single tensor
        input_ids = torch.cat(input_ids)
        return input_ids, extra_input_ids

    def warmup(self):
        result = self.generate("Say Hi", [torch.zeros(size=(0, 0, 0))], [])
        if isinstance(result, concurrent.futures.Future):
            result.result()

    def generate(
        self, prompt, video_embeds, video_frames_times, generation_config=None, chunk=None
    ):
        """Generate a response for prompt using the video embeddings

        Args:
            prompt: Conversation prompt
            video_embeds: Batch of video embeddings
            video_frames_times: Batch of video frame times used for embeddings for each chunk
            generation_config: VLM generation config. Defaults to None.

        Returns:
            List of responses for the batch of chunks
        """
        vila_model_logger.info("🎯 VILA MODEL GENERATION STARTED")
        vila_model_logger.info(f"Prompt length: {len(prompt)} characters")
        vila_model_logger.debug(f"Full prompt: '{prompt}'")
        
        # Safely log video embeds shape
        try:
            if video_embeds is not None and len(video_embeds) > 0:
                embed_shapes = [embed.shape for embed in video_embeds]
                vila_model_logger.info(f"Video embeds shape: {embed_shapes}")
            else:
                vila_model_logger.info("Video embeds shape: None")
        except Exception as e:
            vila_model_logger.warning(f"Could not log video embeds shape: {e}")
            
        vila_model_logger.info(f"Video frames times: {video_frames_times}")
        vila_model_logger.info(f"Generation config received: {generation_config}")
        vila_model_logger.info(f"Chunk info: {chunk}")
        
        import tensorrt_llm.bindings.executor as trtllm

        # Populate default values for the VLM generation parameters
        vila_model_logger.debug("🔧 CONFIGURING GENERATION PARAMETERS")
        if not generation_config:
            generation_config = {}
            vila_model_logger.debug("Using empty generation config")

        if "temperature" not in generation_config:
            generation_config["temperature"] = 0.4
            vila_model_logger.debug("Set default temperature: 0.4")

        if generation_config["temperature"] == 0:
            generation_config.pop("temperature")
            vila_model_logger.debug("Removed temperature=0 (greedy sampling)")

        if "max_new_tokens" not in generation_config:
            generation_config["max_new_tokens"] = 512
            vila_model_logger.debug("Set default max_new_tokens: 512")

        if "top_p" not in generation_config:
            generation_config["top_p"] = 1
            vila_model_logger.debug("Set default top_p: 1")

        if "top_k" not in generation_config:
            generation_config["top_k"] = 100
            vila_model_logger.debug("Set default top_k: 100")
        generation_config["top_k"] = int(generation_config["top_k"])

        if "seed" in generation_config:
            seed = generation_config["seed"]
            generation_config.pop("seed")
            vila_model_logger.debug(f"Using provided seed: {seed}")
        else:
            seed = 1
            vila_model_logger.debug("Using default seed: 1")
            
        vila_model_logger.info(f"Final generation config: {generation_config}")
        vila_model_logger.info(f"Using seed: {seed}")

        # Set the seed
        vila_model_logger.debug("🎲 SETTING RANDOM SEEDS")
        random.seed(seed)
        numpy.random.seed(seed)
        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        vila_model_logger.debug(f"All random seeds set to: {seed}")

        logger.debug(f"Prompt: {prompt}")
        vila_model_logger.info("🔤 TOKENIZING PROMPT")
        vila_model_logger.debug(f"Tokenizing prompt: '{prompt}'")
        # Tokenize the prompt, create a batched input_ids of the same size as video_embeds
        input_ids, extra_input_ids = self._get_input_ids_from_prompt(prompt, video_embeds[0])
        vila_model_logger.debug(f"Input IDs shape: {input_ids.shape}")
        vila_model_logger.debug(f"Extra input IDs: {extra_input_ids}")
        vila_model_logger.info(f"Tokenization complete - input tokens: {input_ids.shape[-1]}")

        vila_model_logger.info("🖼️ PREPARING VIDEO EMBEDDINGS")
        vila_model_logger.debug(f"Video embeds original shape: {video_embeds[0].shape}")
        prompt_table = video_embeds[0].view(
            (
                video_embeds[0].shape[0] * video_embeds[0].shape[1],
                video_embeds[0].shape[2],
            )
        )
        vila_model_logger.debug(f"Prompt table reshaped: {prompt_table.shape}")
        prompt_table = prompt_table.cuda().to(dtype=torch.float16).unsqueeze(0)
        vila_model_logger.debug(f"Prompt table final shape: {prompt_table.shape}")
        vila_model_logger.info("Video embeddings prepared and moved to GPU")

        # Populate TRT-LLM SamplingConfig
        vila_model_logger.info("⚙️ CONFIGURING TRT-LLM SAMPLING")
        req_id = None
        output_ids = None

        output_config = trtllm.OutputConfig(exclude_input_from_output=True)
        max_new_tokens = generation_config.pop("max_new_tokens")
        vila_model_logger.debug(f"Max new tokens: {max_new_tokens}")
        sampling_config = trtllm.SamplingConfig(**generation_config, seed=seed)
        vila_model_logger.debug(f"Sampling config created: {sampling_config}")
        vila_model_logger.info("TRT-LLM sampling configuration complete")
        output_ids = []
        vila_model_logger.info("🚀 STARTING MODEL INFERENCE")
        with torch.no_grad():
            vila_model_logger.debug("Creating prompt tuning config...")
            prompt_tuning_config = trtllm.PromptTuningConfig(
                embedding_table=prompt_table[0].detach(),
                input_token_extra_ids=extra_input_ids,
            )
            vila_model_logger.debug("Prompt tuning config created")
            
            vila_model_logger.debug("Creating TRT-LLM request...")
            request = trtllm.Request(
                input_token_ids=input_ids.tolist(),
                max_tokens=max_new_tokens,
                sampling_config=sampling_config,
                output_config=output_config,
                prompt_tuning_config=prompt_tuning_config,
                end_id=self._tokenizer.eos_token_id,
                pad_id=self._tokenizer.pad_token_id,
                lora_config=self._trt_lora_config,
            )
            vila_model_logger.debug(f"Request created - input tokens: {len(input_ids.tolist())}, max_tokens: {max_new_tokens}")
            
            # Recreate TRT Lora Config with just the ID. Sending a 2nd request
            # with the same ID and weights in the config results in an error
            if self._trt_lora_config:
                self._trt_lora_config = trtllm.LoraConfig(self._lora_config_id)
                vila_model_logger.debug(f"LoRA config recreated with ID: {self._lora_config_id}")
            
            vila_model_logger.info("📤 ENQUEUEING REQUEST TO TRT-LLM EXECUTOR")
            req_id = self._executor.enqueue_request(request)
            vila_model_logger.info(f"Request enqueued with ID: {req_id}")
            self._inflight_req_ids.append(req_id)
            vila_model_logger.debug(f"Inflight requests: {len(self._inflight_req_ids)}")

        vila_model_logger.info("🔄 PROCESSING MODEL OUTPUT")
        if self._output_tpool:
            vila_model_logger.debug("Using async output processing")
            result = self._output_tpool.submit(
                self._postprocess, req_id, output_ids, input_ids.shape[-1]
            )
            vila_model_logger.info("Async processing task submitted")
            return result
        else:
            vila_model_logger.debug("Using sync output processing")
            result = self._postprocess(req_id, output_ids, input_ids.shape[-1])
            vila_model_logger.info("✅ MODEL GENERATION COMPLETE")
            return result

    @staticmethod
    def get_model_info():
        return "vila-1.5", "internal", "NVIDIA"
