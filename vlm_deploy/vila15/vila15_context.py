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

import os
import sys

import torch
from loguru import logger

sys.path.append(os.path.dirname(__file__) + "/VILA")

# Configure context-specific logging
os.makedirs("logs", exist_ok=True)

# VILA Context Logger
ctx_logger = logger.bind(component="vila_context")
logger.add("logs/vila_context.log",
          level="DEBUG",
          rotation="10 MB",
          retention="7 days",
          format="{time:YYYY-MM-DD HH:mm:ss} | VILA_CONTEXT | {function}:{line} | {message}",
          filter=lambda record: record["extra"].get("component") == "vila_context")


class Vila15Context:
    """VILA 1.5 VLM Model Conversation context.

    This helps maintain conversation context for different chunks/files while
    not having to reload the actual model."""

    def __init__(self, model) -> None:
        """Vila15Context constructor

        Args:
            model: Vila15Model instance
        """
        ctx_logger.info("🔧 INITIALIZING VILA15 CONTEXT")
        
        # Get the conversation object
        self._conv = model.get_conv()
        self._model = model
        
        ctx_logger.debug(f"Model name: {model.model_name}")
        ctx_logger.debug(f"Conversation object type: {type(self._conv)}")
        ctx_logger.debug(f"Initial conversation system: '{self._conv.system}'")
        ctx_logger.debug(f"Initial conversation roles: {self._conv.roles}")
        ctx_logger.debug(f"Conversation separator style: {self._conv.sep_style}")
        ctx_logger.debug(f"Conversation version: {self._conv.version}")
        
        if "mpt" in model.model_name.lower():
            self._roles = ("user", "assistant")
            ctx_logger.info("Using MPT roles: (user, assistant)")
        else:
            self._roles = self._conv.roles
            ctx_logger.info(f"Using conversation roles: {self._roles}")
            
        self.messages = []
        self._video_frames_times = None
        self._video_embeds = None
        
        ctx_logger.info("✅ VILA15 CONTEXT INITIALIZED SUCCESSFULLY")

    def set_system_message(self, system_message: str):
        """Set the system message for the conversation.
        
        Args:
            system_message: The system message text to use
        """
        ctx_logger.info("📝 SETTING SYSTEM MESSAGE")
        ctx_logger.info(f"Current conversation system before: '{self._conv.system}'")
        ctx_logger.info(f"New system message: '{system_message}'")
        ctx_logger.info(f"Conversation version: '{self._conv.version}'")
        
        if system_message:
            ctx_logger.debug(f"Setting system message: {system_message[:100]}...")
            
            # Store original system message for comparison
            original_system = self._conv.system
            
            # For hermes-2 format, we need to format the system message properly
            if "hermes" in self._conv.version:
                formatted_system = f"<|im_start|>system\n{system_message}"
                self._conv.system = formatted_system
                ctx_logger.info("Applied HERMES-2 formatting to system message")
            else:
                self._conv.system = system_message
                ctx_logger.info("Applied direct system message (non-hermes format)")
                
            ctx_logger.info(f"System message updated from: '{original_system}' -> '{self._conv.system}'")
        else:
            ctx_logger.warning("⚠️  Empty system message provided, keeping default")
            ctx_logger.info(f"Keeping default system: '{self._conv.system}'")

    def set_video_embeds(self, video_embeds=None, video_frames_times=None,):
        """Set the chunks, and corresponding video embeddings and frame times.
        Accepts batched inputs (lists)"""
        ctx_logger.info("🖼️  SETTING VIDEO EMBEDDINGS")
        ctx_logger.info(f"Number of video embeds: {len(video_embeds) if video_embeds else 0}")
        ctx_logger.info(f"Video frames times: {video_frames_times}")
        
        if video_embeds:
            ctx_logger.debug("Processing video embeddings:")
            for i, embed in enumerate(video_embeds):
                ctx_logger.debug(f"  Embedding {i}: shape={embed.shape}, dtype={embed.dtype}")
                
        self._video_frames_times = video_frames_times
        self._video_embeds = video_embeds
        
        if self._video_embeds:
            self._video_embeds = torch.stack([v.half().cuda() for v in self._video_embeds])
            ctx_logger.info(f"✅ Stacked video embeds: final shape={self._video_embeds.shape}")
        else:
            ctx_logger.warning("⚠️  No video embeddings to stack")

    def ask(self, query, respond=True, skip_time_tokens=False, generation_config=None, chunk=None, system_message=None):
        """Ask a query to the model with comprehensive logging

        Args:
            query: Prompt for the VLM model
            respond: If true, generate response. If false, only add to the conversation context.
                     Defaults to True.
            skip_time_tokens: Skip decoding time tokens in the response. Defaults to False.
            generation_config: Dictionary of VLM output parameters (top-k, seed etc).
                               Defaults to None.
            system_message: Optional system message to set before processing

        Returns:
            List of VLM responses per chunk for the batched input
        """
        ctx_logger.info("🎯 ASK METHOD CALLED")
        ctx_logger.info(f"Query: '{query}'")
        ctx_logger.info(f"Respond: {respond}")
        ctx_logger.info(f"System message provided: {system_message is not None}")
        ctx_logger.info(f"Current conversation system: '{self._conv.system}'")
        ctx_logger.info(f"Current conversation messages count: {len(self._conv.messages)}")

        # Set system message if provided
        if system_message:
            ctx_logger.info("📝 Setting system message from ask() method")
            self.set_system_message(system_message)

        ctx_logger.debug(f"Conversation state before processing:")
        ctx_logger.debug(f"  - System: '{self._conv.system}'")
        ctx_logger.debug(f"  - Roles: {self._conv.roles}")
        ctx_logger.debug(f"  - Messages: {self._conv.messages}")
        ctx_logger.debug(f"  - Sep style: {self._conv.sep_style}")

        if "<image>" in query:
            ctx_logger.info("🔄 Found <image> tag in query, clearing conversation messages")
            ctx_logger.debug(f"Messages before clear: {self._conv.messages}")
            self._conv.messages = []
            ctx_logger.debug(f"Messages after clear: {self._conv.messages}")

        # Add the <image> tag to the prompt, to mark where the video embeddings should be inserted
        if self._video_frames_times is not None and len(self._video_frames_times) > 0:
            image_count = len(self._video_frames_times[0])
            inp = "<image>\n" * image_count
            ctx_logger.info(f"🖼️  Adding {image_count} <image> tags based on video_frames_times")
        else:
            inp = "<image>\n"
            ctx_logger.info("🖼️  Adding single <image> tag (no video_frames_times)")

        ctx_logger.debug(f"Image prefix: '{inp}'")
        final_user_input = inp + query
        ctx_logger.info(f"Final user input: '{final_user_input}'")

        # Add the user prompt to the conversation context
        ctx_logger.info("➕ Adding messages to conversation")
        ctx_logger.debug(f"Adding user message - Role: '{self._conv.roles[0]}', Content: '{final_user_input}'")
        self._conv.append_message(self._conv.roles[0], final_user_input)
        
        ctx_logger.debug(f"Adding assistant message - Role: '{self._conv.roles[1]}', Content: None")
        self._conv.append_message(self._conv.roles[1], None)
        
        ctx_logger.debug(f"Conversation messages after adding: {self._conv.messages}")

        if not respond:
            ctx_logger.info("⏸️  Not generating response (respond=False)")
            return

        # Convert the conversation to a string prompt
        ctx_logger.info("🔄 Converting conversation to prompt")
        ctx_logger.debug("Calling self._conv.get_prompt()...")
        
        prompt = self._conv.get_prompt()
        
        ctx_logger.info("✅ GENERATED FINAL PROMPT")
        ctx_logger.info(f"Final prompt length: {len(prompt)} characters")
        ctx_logger.debug(f"Full final prompt: '{prompt}'")
        
        # Log prompt structure analysis
        lines = prompt.split('\n')
        ctx_logger.debug(f"Prompt structure ({len(lines)} lines):")
        for i, line in enumerate(lines[:10]):  # First 10 lines
            ctx_logger.debug(f"  Line {i+1}: '{line}'")
        if len(lines) > 10:
            ctx_logger.debug(f"  ... ({len(lines)-10} more lines)")

        # Generate a response from the VLM model
        ctx_logger.info("🚀 Calling model.generate()")
        ctx_logger.debug(f"Video embeds shape: {self._video_embeds.shape if self._video_embeds is not None else None}")
        ctx_logger.debug(f"Video frames times: {self._video_frames_times}")
        
        return self._model.generate(
            prompt, self._video_embeds, self._video_frames_times, generation_config, chunk=chunk
        )
