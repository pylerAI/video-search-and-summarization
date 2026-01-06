######################################################################################################
# SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: LicenseRef-NvidiaProprietary
#
# NVIDIA CORPORATION, its affiliates and licensors retain all intellectual
# property and proprietary rights in and to this material, related
# documentation and any modifications thereto. Any use, reproduction,
# disclosure or distribution of this material and related documentation
# without an express license agreement from NVIDIA CORPORATION or
# its affiliates is strictly prohibited.
######################################################################################################

import logging
import os
import re
import time
from logging import Logger

import gradio as gr

from utils import MediaFileInfo, StreamSettingsCache



class RetrieveCache:
    def __init__(self, logger: Logger = None):
        self.stream_settings_cache = StreamSettingsCache(logger=logger)
        self.logger = logger

    def retreive_UI_updates(self, video_id: str, stream_settings: dict = {}):
        """Retreive UI updates based on stream settings"""

        if not stream_settings:
            self.logger.info(f"Getting stream settings for {video_id}.")
            stream_settings = self.stream_settings_cache.load_stream_settings(video_id=video_id)
            self.logger.info(f"Stream settings: {stream_settings}")

        id_settings = stream_settings if stream_settings else {}

        if not id_settings:
            self.logger.debug(f"No stream settings found for {video_id}.")
            return [gr.update(interactive=True)] * 30

        # Map settings to Gradio updates
        updates = [
            gr.update(value=id_settings.get("summarize", True), interactive=True),  # summarize
            gr.update(value=id_settings.get("enable_chat", False), interactive=True),  # enable_chat
            gr.update(value=id_settings.get("chunk_duration", 10), interactive=True),  # chunk_size
            gr.update(value=id_settings.get("prompt", ""), interactive=True),  # summary_prompt
            gr.update(
                value=id_settings.get("caption_summarization_prompt", ""), interactive=True
            ),  # caption_summarization_prompt
            gr.update(
                value=id_settings.get("summary_aggregation_prompt", ""), interactive=True
            ),  # summary_aggregation_prompt
            gr.update(value=id_settings.get("temperature", 0.4), interactive=True),  # temperature
            gr.update(value=id_settings.get("top_p", 1), interactive=True),  # top_p
            gr.update(value=id_settings.get("top_k", 100), interactive=True),  # top_k
            gr.update(value=id_settings.get("max_tokens", 512), interactive=True),  # max_new_tokens
            gr.update(value=id_settings.get("seed", 1), interactive=True),  # seed
            gr.update(
                value=id_settings.get("num_frames_per_chunk", 0), interactive=True
            ),  # num_frames_per_chunk
            gr.update(
                value=id_settings.get("vlm_input_width", 0), interactive=True
            ),  # vlm_input_width
            gr.update(
                value=id_settings.get("vlm_input_height", 0), interactive=True
            ),  # vlm_input_height
            gr.update(
                value=id_settings.get("summarize_top_p", 1), interactive=True
            ),  # summarize_top_p
            gr.update(
                value=id_settings.get("summarize_temperature", 0.5), interactive=True
            ),  # summarize_temperature
            gr.update(
                value=id_settings.get("summarize_max_tokens", 512), interactive=True
            ),  # summarize_max_tokens
            gr.update(value=id_settings.get("chat_top_p", 0.5), interactive=True),  # chat_top_p
            gr.update(
                value=id_settings.get("chat_temperature", 0.5), interactive=True
            ),  # chat_temperature
            gr.update(
                value=id_settings.get("chat_max_tokens", 512), interactive=True
            ),  # chat_max_tokens
            gr.update(
                value=id_settings.get("notification_top_p", 0.5), interactive=True
            ),  # notification_top_p
            gr.update(
                value=id_settings.get("notification_temperature", 0.5), interactive=True
            ),  # notification_temperature
            gr.update(
                value=id_settings.get("notification_max_tokens", 512), interactive=True
            ),  # notification_max_tokens
            gr.update(
                value=id_settings.get("summarize_batch_size", 100), interactive=True
            ),  # summarize_batch_size
            gr.update(
                value=id_settings.get("rag_batch_size", 100), interactive=True
            ),  # rag_batch_size
            gr.update(value=id_settings.get("rag_top_k", 10), interactive=True),  # rag_top_k
            gr.update(
                value=id_settings.get("enable_audio", False), interactive=True
            ),  # enable_audio
        ]

        return updates



def validate_question(question_textbox, logger: Logger = None):
    """Validate question textbox"""
    if not question_textbox.strip():
        if not logger:
            logger = logging.getLogger(__name__)
        logger.error("Question must be a valid string.")
        raise gr.Error("Question must be a valid string.", print_exception=False)
    return
