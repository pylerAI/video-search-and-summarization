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

import base64
import os
import sys

import numpy
import torch


from via_logger import TimeMeasure, logger

OPENAI_RECONNECT_ATTEMPTS = 3


def jpeg_single_tensor_to_array_of_numpys(tensor):
    """
    Takes a PyTorch tensor of shape (1, 10, N) and returns an array of 10 numpy arrays.
    (1,10) are example lengths - could be any
    1: number of chunks
    10: n_frms in each chunk
    """
    # Unstack the tensor into 10 PyTorch tensors
    unstacked_tensors = tensor.squeeze(0).unbind(0)

    # Convert the PyTorch tensors to numpy arrays
    numpy_arrays = [t.cpu().numpy() for t in unstacked_tensors]

    return numpy_arrays


def tensor_to_base64_jpeg(tensor, idx=0):
    """
    Selects one JPEG at index=idx from a PyTorch tensor containing N X NumPy arrays
    representing N JPEG images and converts to a base64 encoded string.

    Args:
        tensor (torch.Tensor): The PyTorch tensor containing the NumPy arrays.

    Returns:
        str: The base64 encoded string representing the JPEG image at idx.
    """

    numpy_arrays = jpeg_single_tensor_to_array_of_numpys(tensor)
    # Convert the tensor to a NumPy array
    numpy_array = numpy_arrays[idx]

    # Convert the encoded image to bytes
    encoded_image_bytes = numpy_array.tobytes()

    # Encode the bytes as base64
    base64_encoded = base64.b64encode(encoded_image_bytes)

    # Decode the base64 bytes to a string
    base64_string = base64_encoded.decode("utf-8")

    return base64_string


class CompOpenAIModel:






    def init_with_dynamic_config(self, model_config):
        """Initialize with dynamic model configuration from model registry"""
        self._key = model_config.get('api_key')
        self._model_name = model_config.get('deployment_name')
        self._endpoint = model_config.get('endpoint')
        
        logger.info(f"Dynamic config - Model: {self._model_name}, Endpoint: {self._endpoint}")
        
        # Validate required fields
        if not self._key:
            raise Exception(f"Invalid dynamic model configuration: missing api_key")
        if not self._endpoint:
            raise Exception(f"Invalid dynamic model configuration: missing endpoint")
        if not self._model_name:
            raise Exception(f"Invalid dynamic model configuration: missing deployment_name")
        
        # Configure client with dynamic settings
        from openai import OpenAI
        
        self._client = OpenAI(
            base_url=self._endpoint,
            api_key=self._key,
            max_retries=OPENAI_RECONNECT_ATTEMPTS
        )
        logger.info(f"Initialized OpenAI client with dynamic config for {self._model_name}")
        
        # Perform a validation call to ensure the model configuration works
        # This will catch invalid model names early
        logger.info(f"Validating model configuration for {self._model_name}...")
        try:
            # Make a minimal test call to validate the model exists
            response = self._client.chat.completions.create(
                model=self._model_name,
                messages=[{"role": "user", "content": "test"}],
                max_tokens=1
            )
            logger.info(f"Model validation successful for {self._model_name}")
        except Exception as e:
            # Extract more specific error information from OpenAI API
            error_msg = str(e)
            if "does not exist" in error_msg.lower() or "not found" in error_msg.lower():
                raise Exception(f"Invalid model name '{self._model_name}': Model does not exist or is not accessible")
            elif "invalid api key" in error_msg.lower() or "unauthorized" in error_msg.lower():
                raise Exception(f"Invalid API key for model '{self._model_name}': Authentication failed")
            elif "rate limit" in error_msg.lower() or "quota" in error_msg.lower():
                raise Exception(f"Rate limit exceeded for model '{self._model_name}': {error_msg}")
            else:
                logger.error(f"Model validation failed for {self._model_name}: {e}")
                raise Exception(f"Invalid model configuration for '{self._model_name}': {error_msg}")
    

    def __init__(self, test_api_call=False, model_config=None) -> None:
        self._model_name = None
        self._model = None
        self._client = None
        self._endpoint = ""
        self._key = None
        self._model_config = model_config  # Store dynamic model configuration
        
        # Initialize Azure and NV Secret attributes (needed for compatibility if kept)
        self._azureEndpointConfigured = False
        self._nvSecretConfigured = False
        
        if model_config:
            # Use dynamic configuration
            model_id = model_config.get('model_id', 'unknown')
            deployment_name = model_config.get('deployment_name', 'None')
            logger.info(f"Using dynamic model configuration for {model_id}")
            logger.info(f"Dynamic model details: deployment_name='{deployment_name}', endpoint='{model_config.get('endpoint', 'None')}'")
            
            try:
                self.init_with_dynamic_config(model_config)
                logger.info(f"Successfully initialized with dynamic config: model_name='{self._model_name}'")
            except Exception as e:
                logger.error(f"Failed to initialize with dynamic config for {model_id}: {e}")
                raise
        else:
            # Legacy fallback removed - enforce model config
            logger.warning("No model configuration provided to CompOpenAIModel. Model is uninitialized.")
            # We allow uninitialized state because VlmProcess checks for dynamic config later
            # But we log a warning as it shouldn't really happen in the new flow
        
        if self._endpoint:
             os.environ["VIA_VLM_ENDPOINT"] = self._endpoint
             
        if test_api_call and self._client:
            self.generate("", [[]], [[]], None, None)



    @property
    def model_name(self):
        return self._model_name

    @property
    def model_config(self):
        return None

    def get_conv(self):
        return self._conv.copy()

    @staticmethod
    def get_model_info():
        # Updated to remove legacy env var usage.
        # This might need to rely on dynamic instances, but since it's static,
        # it probably was used for some global info. Returning placeholders.
        api_type = "openai"
        id = "ConfiguredDynamically"
        owned_by = "ExternalEndpoint"
        return id, api_type, owned_by

    def generate(
        self, prompt, video_embeds, video_frames_times, generation_config=None, chunk=None
    ):
        responses = []
        token_usages = []

        if not generation_config:
            generation_config = {}

        if "temperature" not in generation_config:
            generation_config["temperature"] = 0.2

        if "max_new_tokens" not in generation_config:
            generation_config["max_new_tokens"] = 1024

        if "top_p" not in generation_config:
            generation_config["top_p"] = 1

        if "seed" in generation_config:
            seed = generation_config["seed"]
            generation_config.pop("seed")
        else:
            seed = 1
        numpy.random.seed(seed)
        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)

        if chunk:
            if len(video_frames_times) != len(chunk):
                logger.error("chunk size not matching in openai-compat generate")

        for tidx, video_frames_times_ in enumerate(video_frames_times):
            num_of_embeds_in_one_chunk = int(len(video_frames_times_))
            image_list = [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": (
                            "data:image/jpeg;base64," + tensor_to_base64_jpeg(video_embeds[tidx], j)
                        ),
                        "detail": "auto",
                    },
                }
                for j in range(num_of_embeds_in_one_chunk)
            ]
            string_of_times = ""
            string_timestamp = ""
            time_format_str = ""

            for j in range(num_of_embeds_in_one_chunk):
                if chunk:
                    if tidx <= len(chunk):
                        string_timestamp = chunk[tidx].get_timestamp(video_frames_times_[j])
                        if not time_format_str:
                            time_format_str = " at timestamps in seconds"
                    else:
                        logger.error("Chunk ID going out of chunk size")
                        string_timestamp = str(video_frames_times_[j])
                        time_format_str = " at timestamps in seconds"

                else:
                    string_timestamp = str(video_frames_times_[j])
                    time_format_str = " at timestamps in seconds"

                string_of_times += "<" + string_timestamp + "> "

            PROMPT = (
                "These are images sampled from a video "
                + time_format_str
                + " : "
                + string_of_times
                + "."
                + prompt
                + "Make sure the answer contain correct timestamps."
            )

            logger.debug(f"PROMPT is  {PROMPT}")
            messages = [
                {
                    "role": "user",
                    "content": [
                        *image_list,
                        {"type": "text", "text": PROMPT},
                    ],
                }
            ]
            # Override system prompt in environment variable with reasoning prompt if enable_reasoning is True
            if generation_config.get("enable_reasoning") and "<think>" not in generation_config.get("system_prompt", ""):
                generation_config["system_prompt"] += (
                    " Answer the question in the following format: "
                    "<think>\nyour reasoning\n</think>\n\n<answer>\nyour answer\n</answer>.\n"
                )
            if "system_prompt" in generation_config and generation_config["system_prompt"]:
                messages.insert(
                    0, {"role": "system", "content": generation_config["system_prompt"]}
                )



            with TimeMeasure("OpenAI model inference"):
                logger.debug("Invoke call")
                try:
                    token_usage = {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}
                    
                    if self._model:
                        response_obj = self._model.invoke(
                            messages,
                            max_tokens=generation_config["max_new_tokens"],
                            temperature=generation_config["temperature"],
                            seed=seed,
                            top_p=generation_config["top_p"],
                        )
                        content = response_obj.content
                        
                        # Extract token usage information from AzureChatOpenAI response
                        if hasattr(response_obj, 'usage_metadata') and response_obj.usage_metadata:
                            token_usage = {
                                "input_tokens": response_obj.usage_metadata.get('input_tokens', 0),
                                "output_tokens": response_obj.usage_metadata.get('output_tokens', 0),
                                "total_tokens": response_obj.usage_metadata.get('total_tokens', 0),
                            }
                        elif hasattr(response_obj, 'response_metadata') and 'token_usage' in response_obj.response_metadata:
                            usage = response_obj.response_metadata['token_usage']
                            token_usage = {
                                "input_tokens": usage.get('prompt_tokens', 0),
                                "output_tokens": usage.get('completion_tokens', 0),
                                "total_tokens": usage.get('total_tokens', 0),
                            }
                        logger.debug(f"Token usage from AzureChatOpenAI: {token_usage}")
                    elif self._client:
                        resp = self._client.chat.completions.create(
                            model=self._model_name,
                            messages=messages,
                            max_tokens=generation_config["max_new_tokens"],
                            temperature=generation_config["temperature"],
                            seed=seed,
                            top_p=generation_config["top_p"],
                        )
                        content = ""
                        for choice in resp.choices:
                            content += str(choice.message.content)
                        
                        # Extract token usage information
                        token_usage = {
                            "input_tokens": resp.usage.prompt_tokens if resp.usage else 0,
                            "output_tokens": resp.usage.completion_tokens if resp.usage else 0,
                            "total_tokens": resp.usage.total_tokens if resp.usage else 0,
                        }
                        logger.debug(f"Token usage from OpenAI API: {token_usage}")
                    logger.debug("Invoke call done")
                    logger.debug(f"content is {str(content)}")
                    response = content
                    token_usages.append(token_usage)
                except Exception as ex:
                    import traceback
                    import sys

                    # Extract more specific error information from OpenAI API errors
                    error_message = str(ex)
                    if hasattr(ex, 'response') and hasattr(ex.response, 'json'):
                        try:
                            error_details = ex.response.json()
                            if 'error' in error_details and 'message' in error_details['error']:
                                error_message = f"OpenAI API Error: {error_details['error']['message']}"
                        except:
                            pass  # Fall back to string representation
                    elif "model" in error_message.lower() and "not found" in error_message.lower():
                        error_message = f"Model Configuration Error: {error_message}"
                    
                    exc_type, exc_value, exc_traceback = sys.exc_info()
                    error_string = "".join(
                        traceback.format_exception(exc_type, exc_value, exc_traceback)
                    )
                    logger.error(f"VLM Model Error: {error_message}")
                    logger.debug(error_string)
                    response = error_message  # Use the specific error message
                    # Add default token usage for error case
                    token_usages.append({"input_tokens": 0, "output_tokens": 0, "total_tokens": 0})
                    raise Exception(error_message) from ex
                finally:
                    responses.append(response)
        return responses, token_usages


if __name__ == "__main__":
    # To test and debug, please use harness:
    # PYTHONPATH=src pytest tests/model/gpt4/test_gpt4v_jpeg_tensor_gen.py -s
    # Please add new test case for each bug
    pass
