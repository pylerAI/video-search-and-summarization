######################################################################################################
# SPDX-FileCopyrightText: Copyright (c) 2023-2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: LicenseRef-NvidiaProprietary
#
# NVIDIA CORPORATION, its affiliates and licensors retain all intellectual
# property and proprietary rights in and to this material, related
# documentation and any modifications thereto. Any use, reproduction,
# disclosure or distribution of this material and related documentation
# without an express license agreement from NVIDIA CORPORATION or
# its affiliates is strictly prohibited.
######################################################################################################
"""Common utility methods."""

import asyncio
import json
import logging
import os
import re
import subprocess
import textwrap

import gi
import numpy as np
import yaml
from pymediainfo import MediaInfo

# from json_minify import json_minify

gi.require_version("Gst", "1.0")
gi.require_version("GstPbutils", "1.0")

from gi.repository import Gst, GstPbutils  # noqa: E402

Gst.init(None)

logger = logging.getLogger(__name__)


class MediaFileInfo:
    is_image = False
    video_codec = ""
    video_duration_nsec = 0
    video_fps = 0.0
    video_resolution = (0, 0)

    @staticmethod
    def _get_info_gst(uri_or_file: str, username="", password=""):
        uri_or_file = str(uri_or_file)
        media_file_info = MediaFileInfo()

        if uri_or_file.startswith("file://"):
            uri = uri_or_file
        else:
            uri = "file://" + os.path.abspath(str(uri_or_file))

        discoverer = GstPbutils.Discoverer()

        try:
            file_info = discoverer.discover_uri(uri)
        except gi.repository.GLib.GError as e:
            raise Exception("Unsupported file type - " + uri + " Error:" + str(e))
        for stream_info in file_info.get_stream_list():
            if isinstance(stream_info, GstPbutils.DiscovererVideoInfo):
                media_file_info.video_duration_nsec = int(file_info.get_duration())
                media_file_info.video_codec = str(
                    GstPbutils.pb_utils_get_codec_description(stream_info.get_caps())
                )
                media_file_info.video_resolution = (
                    int(stream_info.get_width()),
                    int(stream_info.get_height()),
                )
                media_file_info.video_fps = float(
                    stream_info.get_framerate_num() / stream_info.get_framerate_denom()
                )
                media_file_info.is_image = bool(stream_info.is_image())
                break
        return media_file_info

    @staticmethod
    def _get_info_mediainfo(uri_or_file: str):
        if uri_or_file.startswith("file://"):
            file = uri_or_file[7:]
        else:
            file = uri_or_file

        media_file_info = MediaFileInfo()
        media_info = MediaInfo.parse(file)
        have_image_or_video = False
        for track in media_info.tracks:
            if track.track_type == "Video":
                media_file_info.is_image = False
                media_file_info.video_codec = track.format
                media_file_info.video_duration_nsec = float(track.duration) * 1000000
                media_file_info.video_fps = track.frame_rate
                media_file_info.video_resolution = (track.width, track.height)
                have_image_or_video = True
            if track.track_type == "Image":
                media_file_info.is_image = True
                media_file_info.video_codec = track.format
                media_file_info.video_duration_nsec = 0
                media_file_info.video_fps = 0
                media_file_info.video_resolution = (track.width, track.height)
                have_image_or_video = True

        if not have_image_or_video:
            raise Exception("Unsupported file type - " + file)
        return media_file_info

    @staticmethod
    def get_info(uri_or_file: str, username="", password=""):
        return MediaFileInfo._get_info_mediainfo(str(uri_or_file))

    @staticmethod
    async def get_info_async(uri_or_file: str, username="", password=""):
        return await asyncio.get_event_loop().run_in_executor(
            None, MediaFileInfo.get_info, uri_or_file, username, password
        )


def round_up(s):
    """
    Rounds up a string representation of a number to an integer.

    Example:
    >>> round_up("7.9s")
    8
    """
    # Strip any non-numeric characters from the string
    num_str = re.sub(r"[a-zA-Z]+", "", s)

    # Convert the string to a float and round up to the nearest integer
    num = float(num_str)
    return -(-num // 1)  # equivalent to math.ceil(num) in Python 3.x


def get_avg_time_per_chunk(GPU_in_use, Model_ID, yaml_file_path):
    """
    Returns the average time per query for a given GPU and Model ID
    from a VIA_runtime_stats YAML file.

    Args:
        GPU_in_use (str): The GPU in use (e.g. A100, H100)
        Model_ID (str): The Model ID (e.g. VILA)
        yaml_file_path (str): The path to the VIA_runtime_stats YAML file

    Returns:
        str: The average time per chunk (e.g. 2.5s, 1.8s)
    """

    def is_subset_s1_in_s2(string1, string2):
        # Returns True if string1 is a subset of string2, ignoring case
        pattern = re.compile(re.escape(string1), re.IGNORECASE)
        return bool(pattern.search(string2))

    def is_subset(string1, string2):
        return is_subset_s1_in_s2(string1, string2) or is_subset_s1_in_s2(string2, string1)

    with open(yaml_file_path, "r") as f:
        yaml_data = yaml.safe_load(f)

    max_atpc = 0.0
    max_atpc_as_is = "0"

    for entry in yaml_data["VIA_runtime_stats"]:
        if round_up(entry["average_time_per_chunk"]) > max_atpc:
            max_atpc = round_up(entry["average_time_per_chunk"])
            max_atpc_as_is = entry["average_time_per_chunk"]
        if is_subset(GPU_in_use, entry["GPU_in_use"]) and is_subset(Model_ID, entry["Model_ID"]):
            return entry["average_time_per_chunk"]

    # If no matching entry is found, return max of all
    return max_atpc_as_is


def get_available_gpus():
    """
    Returns an array of available NVIDIA GPUs with their names and memory sizes.

    Example output:
    [
        {"name": "GeForce RTX 3080", "memory": "12288 MiB"},
        {"name": "Quadro RTX 4000", "memory": "16384 MiB"}
    ]
    """
    try:
        # Run nvidia-smi command and capture output
        output = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader,nounits"]
        )

        # Split output into lines
        lines = output.decode("utf-8").strip().split("\n")

        # Initialize empty list to store GPU info
        gpus = []

        # Iterate over lines and extract GPU info
        for line in lines:
            cols = line.split(",")
            gpu_name = cols[0].strip()
            gpu_memory = cols[1].strip()
            gpus.append({"name": gpu_name, "memory": gpu_memory})

        return gpus

    except subprocess.CalledProcessError as e:
        print(f"Error running nvidia-smi: {e}")
        return []


# Convert the matrix to bit strings
def matrix_to_bit_strings(matrix):
    return ["".join(map(str, row)) for row in matrix]


# Run-length encoding function
def rle_encode(matrix):
    encoded = []
    for row in matrix:
        row_encoded = []
        current_value = row[0]
        count = 1
        for i in range(1, len(row)):
            if row[i] == current_value:
                count += 1
            else:
                row_encoded.append((int(current_value), count))
                current_value = row[i]
                count = 1
        row_encoded.append((int(current_value), count))
        encoded.append(row_encoded)
    return encoded


def find_object_with_key_value(json_array, target_key, target_value):
    # Loop through each object in the JSON array (list of dicts)
    for obj in json_array:
        if isinstance(obj, dict):
            # Check if the key-value pair exists in the current object
            if obj.get(target_key) == target_value:
                return obj  # Return the entire object if a match is found
    return None  # Return None if no match is found


def get_json_file_name(request_id, chunk_idx):
    filename = str(request_id) + "_" + str(chunk_idx) + ".json"
    return filename


def process_highlight_request(messages):
    # Extract scenario from the request if present
    scenarios = None
    message_lower = ""
    if messages is not None:
        message_lower = messages.lower()

    if message_lower != "" and message_lower != "generate video highlight":
        # Split the message by dots and clean up each word
        scenarios = [word.strip() for word in message_lower.split(",") if word.strip()]

    # Define the base highlight_query prompt template
    highlight_query = textwrap.dedent(
        """
        Analyze the video content and generate whole video highlights.

        IMPORTANT:
        - If analyzing a specific scenario, focus ONLY on timestamps and
          segments containing that scenario.
        - If no specific scenario is mentioned, provide a comprehensive overview
          of key moments.
        - If no matching scenarios are found, return ONLY the string
          "No matching scenarios found"

        If matching scenarios ARE found, Generate the response in the following
        JSON format:
        {
            "type": "highlight",
            "highlightResponse": {
                "timestamps": [<time_points>],
                "marker_labels": [<short_descriptive_titles>],
                "start_times": [<section_start_times>],
                "end_times": [<section_end_times>],
                "descriptions": [<detailed_section_summaries>]
            }
        }

        Guidelines when scenarios are found:
        - Each timestamp marks when the requested scenario or significant event
          occurs and timestamps should be sorted in increasing order.
        - Marker_labels should clearly indicate what happens
        - Start_times and end_times should capture the full duration of each
          event
        - Descriptions should detail what happens in each highlighted section
        - All time values must be in seconds
        - For scenario-specific requests:
          * Only include segments that match the requested scenario
          * Label and describe the specific events clearly
        - For general highlight requests:
          * Include diverse important moments
          * Cover the key events throughout the video
        - Maintain chronological order in all arrays
        IMPORTANT: Return either:
        1. The string "No matching scenarios found" if no matches exist
        2. The JSON object if matches are found
        Do not mix these formats or add additional text.
        """
    )

    # Add scenario if specified
    if scenarios:
        highlight_query += f'\nREQUESTED SCENARIO: "{scenarios}"\n'

    return highlight_query


class StreamSettingsCache:
    def __init__(
        self,
        stream_settings_fp: str = "/tmp/.stream_settings_cache.json",
        logger: logging.Logger = None,
    ):
        self.stream_settings_fp = stream_settings_fp
        self.logger = logger

    def update_stream_settings(self, video_id: str, stream_settings: dict):
        """
        Save/Update stream settings to a json file
        """
        try:
            existing_settings = self.load_stream_settings()
            # Update with new settings
            existing_settings.update({video_id: stream_settings})

            # Save updated settings
            with open(self.stream_settings_fp, "w") as f:
                json.dump(existing_settings, f, indent=4)
            self.logger.debug(f"Stream settings updated: {self.stream_settings_fp}")
        except Exception as e:
            self.logger.error(f"Failed to save stream settings: {str(e)}")

    def load_stream_settings(self, video_id: str = None):
        """
        Load stream settings from a json file
        """
        if os.path.exists(self.stream_settings_fp):
            with open(self.stream_settings_fp, "r") as f:
                existing_settings = json.load(f)
        else:
            existing_settings = {}

        if video_id:
            existing_stream_settings = existing_settings.get(video_id, {})
            self.logger.debug(f"Stream settings for {video_id}: {existing_stream_settings}")
            return existing_stream_settings
        else:
            self.logger.debug(f"ALL Streams settings: {existing_settings}")
            return existing_settings

    def transform_query(self, query_dict: dict) -> dict:
        """
        Transform the query string into a dictionary
        """
        if not query_dict:
            self.logger.error("Empty Query params!")
            return {}

        # Define the fields we want to keep
        required_fields = {
            "id",
            "model",
            "chunk_duration",
            "temperature",
            "seed",
            "max_tokens",
            "top_p",
            "top_k",
            "stream",
            "enable_chat",
            "stream_options",
            "num_frames_per_chunk",
            "vlm_input_width",
            "vlm_input_height",
            "enable_audio",
            "prompt",
            "caption_summarization_prompt",
            "summary_aggregation_prompt",
            "tools",
            "summarize",
        }

        # Extract only the required fields and remove None values
        filtered_dict = {
            k: v for k, v in query_dict.items() if k in required_fields and v is not None
        }

        return filtered_dict


def validate_required_prompts(
    summary_prompt, caption_summarization_prompt, summary_aggregation_prompt, pipeline_args
):
    """
    Validate that required prompts are provided based on CA-RAG configuration.

    Args:
        summary_prompt: The main prompt for video analysis
        caption_summarization_prompt: The caption summarization prompt
        summary_aggregation_prompt: The summary aggregation prompt
        pipeline_args: Pipeline arguments containing CA-RAG configuration

    Returns:
        list: List of validation error messages (empty if validation passes)
    """
    validation_errors = []

    # Main prompt is always required
    if not summary_prompt or summary_prompt.strip() == "":
        validation_errors.append("VLM prompt is required")

    # Check if CA-RAG is enabled and validate CA-RAG specific prompts
    ca_rag_enabled = not getattr(pipeline_args, "disable_ca_rag", False)
    if ca_rag_enabled:
        if not caption_summarization_prompt or caption_summarization_prompt.strip() == "":
            validation_errors.append(
                "Caption summarization prompt is required when CA-RAG is enabled"
            )
        if not summary_aggregation_prompt or summary_aggregation_prompt.strip() == "":
            validation_errors.append(
                "Summary aggregation prompt is required when CA-RAG is enabled"
            )

    return validation_errors