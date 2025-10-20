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
import os
import sys

import tensorrt as trt
import torch
from transformers import AutoConfig, AutoModel

from loguru import logger

# Configure specialized logger for embedding generation
embed_logger = logger.bind(component="embedding_generator")
embed_logger.add("logs/image_processing.log", 
                 format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | EMBED_GEN | {message}",
                 level="DEBUG", rotation="10 MB", compression="zip")

sys.path.append(os.path.dirname(__file__) + "/VILA")

import llava.model.language_model.llava_llama  # noqa: F401, E402


def trt_dtype_to_torch(dtype):
    """Translate TRT datatype to torch data type"""
    if dtype == trt.float16:
        return torch.float16
    elif dtype == trt.float32:
        return torch.float32
    elif dtype == trt.int32:
        return torch.int32
    else:
        raise TypeError("%s is not supported" % dtype)


class Vila15EmbeddingGenerator:
    """Visual Embedding Generator for the VILA 1.5 model"""

    def __init__(
        self, model_path: str, use_trt=True, trt_engine_dir="", async_output=False
    ) -> None:
        """Vila15EmbeddingGenerator initializer

        Args:
            model_path: Path where the model is located
            trt_engine_dir: Path to the directory where the TRT engines for the model are located.
                            Defaults to "".
        """
        embed_logger.info("🔧 EMBEDDING GENERATOR INITIALIZATION STARTED")
        embed_logger.info(f"Model path: {model_path}")
        embed_logger.info(f"Use TRT: {use_trt}")
        embed_logger.info(f"TRT engine dir: {trt_engine_dir}")
        embed_logger.info(f"Async output: {async_output}")
        
        from tensorrt_llm.runtime import Session

        self._use_trt = use_trt
        embed_logger.debug("Loading model configuration...")
        self._config = AutoConfig.from_pretrained(model_path)
        embed_logger.debug(f"Model config loaded: {self._config}")

        # Load TRT model from serialized engine
        embed_logger.info("🚀 LOADING TRT VISUAL ENCODER ENGINE")
        vision_encoder_path = os.path.join(
            trt_engine_dir, "visual_engines", "visual_encoder.engine"
        )
        embed_logger.info(f"Vision encoder engine path: {vision_encoder_path}")
        logger.info(f"Loading engine from {vision_encoder_path}")
        
        embed_logger.debug("Reading engine buffer...")
        with open(vision_encoder_path, "rb") as f:
            engine_buffer = f.read()
        embed_logger.debug(f"Engine buffer size: {len(engine_buffer)} bytes")
        
        logger.info(f"Creating session from engine {vision_encoder_path}")
        embed_logger.debug("Creating TRT session from engine...")
        self.visual_encoder_session = Session.from_serialized_engine(engine_buffer)
        embed_logger.info("✅ TRT visual encoder session created successfully")

        # Load layers that are required for additional processing after
        # passing the frames through TRT engine
        device_map = {
            "model.vision_tower": "meta",
            "model.embed_tokens": "cuda",
            "model.layers": "meta",
            "model.norm": "meta",
            "lm_head": "meta",
            "model.mm_projector": "meta",
        }
        self._model = AutoModel.from_pretrained(
            model_path,
            low_cpu_mem_usage=True,
            device_map=device_map,
            # torch_dtype=torch.float16,
        )
        self.stream = torch.cuda.Stream(torch.cuda.current_device())
        torch.cuda.set_stream(self.stream)
        self._output_tpool = (
            concurrent.futures.ThreadPoolExecutor(max_workers=2) if async_output else None
        )

    def warmup(self):
        input_dims = self.visual_encoder_session._engine.get_tensor_profile_shape("input", 0)[-1]
        input_dims = [int(d) for d in input_dims[:4]]
        frame_input = torch.zeros(size=input_dims, dtype=torch.float16, device="cuda")
        self.get_embeddings(frame_input.unsqueeze(0))

    def get_embeddings(self, frames_tensor_batch: list):
        """Get embeddings for a batch of chunks. For each chunk a list of frames is needed.

        Args:
            frames_list_batch (list): List of list of frames per chunk

        Returns:
            List of embeddings tensor for all input chunks
        """
        embed_logger.info("🖼️ STARTING VISUAL EMBEDDING GENERATION")
        embed_logger.info(f"Processing {len(frames_tensor_batch)} frame tensor chunks")
        
        visual_outputs_batch = []
        for i, frames_tensor in enumerate(frames_tensor_batch):
            embed_logger.info(f"📹 PROCESSING CHUNK {i+1}/{len(frames_tensor_batch)}")
            embed_logger.debug(f"Frames tensor shape: {frames_tensor.shape}")
            embed_logger.debug(f"Frames tensor dtype: {frames_tensor.dtype}")
            embed_logger.debug(f"Frames tensor device: {frames_tensor.device}")
            
            # TRT mode
            from tensorrt_llm.runtime import TensorInfo

            embed_logger.debug("Inferring output shapes from TRT engine...")
            visual_output_info = self.visual_encoder_session.infer_shapes(
                [TensorInfo("input", trt.DataType.HALF, frames_tensor.shape)]
            )
            embed_logger.debug(f"Visual output info: {[(t.name, t.shape, t.dtype) for t in visual_output_info]}")
            
            embed_logger.debug("Preparing output tensors...")
            visual_outputs = {
                t.name: torch.empty(
                    tuple(t.shape[:3]),
                    dtype=trt_dtype_to_torch(t.dtype),
                    device=frames_tensor.device,
                )
                for t in visual_output_info
            }
            embed_logger.debug(f"Output tensor shapes: {[(k, v.shape) for k, v in visual_outputs.items()]}")
            
            embed_logger.info("🚀 RUNNING TRT VISUAL ENCODER INFERENCE")
            ok = self.visual_encoder_session.run(
                {"input": frames_tensor}, visual_outputs, self.stream.cuda_stream
            )
            assert ok, "Runtime execution failed for vision encoder session"
            embed_logger.debug("TRT inference completed successfully")
            
            embed_logger.debug(f"Output embedding shape: {visual_outputs['output'].shape}")
            visual_outputs_batch.append(visual_outputs["output"])
            embed_logger.info(f"✅ Chunk {i+1} processed - embedding shape: {visual_outputs['output'].shape}")
            
        embed_logger.debug("Synchronizing CUDA stream...")
        self.stream.synchronize()
        embed_logger.info("🎯 VISUAL EMBEDDING GENERATION COMPLETE")
        embed_logger.info(f"Generated {len(visual_outputs_batch)} embeddings")

        return visual_outputs_batch
