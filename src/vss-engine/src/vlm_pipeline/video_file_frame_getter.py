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
"""Video File Frame Getter

This module supports getting frames from a video file either as raw frame tensors or
JPEG encoded images. Supports decoding of a part of file using start/end timestamps,
picking N frames from the segment as well as pre-processing the decoded frames
as required by the VLM model.
"""

import ctypes
import glob
import io
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import uuid
from datetime import datetime, timezone
from threading import Condition, Lock
from typing import Callable, Optional

import cupy as cp
import cv2
import gi
import grpc

try:
    import gst_video_sei_meta

    HAVE_SEI_META_LIB = True
except ImportError:
    gst_video_sei_meta = None
    HAVE_SEI_META_LIB = False
import multiprocessing as mp

import numpy as np
import pyds
import riva.client
import torch
import torch.nn.functional as F
import yaml
from chunk_info import ChunkInfo
from torchvision.transforms import v2
from utils import MediaFileInfo, get_json_file_name
from via_logger import TimeMeasure, logger

gi.require_version("Gst", "1.0")

import platform  # noqa: E402

from gi.repository import GLib, Gst  # noqa: E402

Gst.init(None)

if os.environ.get("FORCE_SW_AV1_DECODER", "false") == "true":
    av1dec = Gst.ElementFactory.find("av1dec")
    if av1dec:
        current_rank = av1dec.get_rank()
        # Update av1dec rank above nvv4l2decoder
        new_rank = 276
        av1dec.set_rank(new_rank)
        logger.info("Updated rank of %s from %d to %d", av1dec.get_name(), current_rank, new_rank)

UNTRACKED_OBJECT_ID = 0xFFFFFFFFFFFFFFFF
np.random.seed(1000)
rgb_array = np.random.random((1000, 3))


def get_timestamp_str(ts):
    """Get RFC3339 string timestamp"""
    return (
        datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
        + f".{(int(ts * 1000) % 1000):03d}Z"
    )


class ToCHW:
    """
    Converts tensor from HWC (interleaved) to CHW (planar)
    """

    def __init__(self):
        pass

    def __call__(self, clip):
        return clip.permute(2, 0, 1)

    def __repr__(self) -> str:
        return self.__class__.__name__


class Rescale:
    """
    Convert tensor data type from uint8 to float, divide value by 255.0
    """

    def __init__(self, factor):
        self._factor = factor
        pass

    def __call__(self, clip):
        return clip.float().mul(self._factor)

    def __repr__(self) -> str:
        return self.__class__.__name__


class BaseFrameSelector:
    """Base Frame Selector

    Base class for implementing a frame selector."""

    def __init__(self):
        self._chunk = None

    def set_chunk(self, chunk: ChunkInfo):
        """Set Chunk to select frames from"""
        self._chunk = chunk

    def choose_frame(self, buffer, pts: int):
        """Choose a frame for processing.

        Implementations should return a boolean indicating if the frame should
        be chosen for processing.

        Args:
            buffer: GstBuffer
            pts: Frame timestamp in nanoseconds.

        Returns:
            bool: Boolean indicating if the frame should be chosen for processing.
        """
        return False


class DefaultFrameSelector:
    """Default Frame Selector.

    Selects N equally spaced frames from a chunk.
    """

    def __init__(self, num_frames=8):
        """Default initializer.

        Args:
            num_frames (int, optional): Number of frames to select from a chunk. Defaults to 8.
        """
        self._num_frames = num_frames
        self._selected_pts_array = []

    def set_chunk(self, chunk: ChunkInfo):
        self._chunk = chunk
        self._selected_pts_array = []
        start_pts = chunk.start_pts
        end_pts = chunk.end_pts

        if start_pts == -1 or end_pts == -1:
            # If start or end PTS is not set (=-1), set it to 0 and file duration
            # to decode the entire file
            start_pts = 0
            end_pts = MediaFileInfo.get_info(chunk.file).video_duration_nsec

        # Adjust for the PTS offset (in case of split files)
        start_pts -= chunk.pts_offset_ns
        end_pts -= chunk.pts_offset_ns

        if self._chunk.end_pts < 0:
            self._chunk.end_pts = end_pts

        # Calculate PTS for N equally spaced frames
        pts_diff = (end_pts - start_pts) / self._num_frames
        for i in range(self._num_frames):
            self._selected_pts_array.append(start_pts + i * pts_diff)
        logger.debug("Selected PTS = %s for %s", self._selected_pts_array, chunk)
        logger.debug(
            "chunk.end_pts=%d, len(self._selected_pts_array)=%d",
            end_pts,
            len(self._selected_pts_array),
        )

    def choose_frame(self, buffer, pts):
        # Choose the frame if it's PTS is more than the next sampled PTS in the
        # list.
        if (
            len(self._selected_pts_array)
            and pts >= self._selected_pts_array[0]
            and pts <= self._chunk.end_pts
        ):
            while len(self._selected_pts_array) and pts >= self._selected_pts_array[0]:
                self._selected_pts_array.pop(0)
            return True
        if pts >= self._chunk.end_pts:
            self._selected_pts_array.clear()
        return False


class AudioChunkIterator:
    """Iterator that yields audio chunks from queue.

    Provides iteration over audio frames with thread-safe access to the underlying cache.
    Implements context manager protocol for proper resource cleanup.
    """

    def __init__(
        self,
        audio_frames_queue: mp.Queue,
        audio_stop: mp.Event,
    ) -> None:
        """Initialize the iterator.

        Args:
            audio_frames_queue: Queue of audio frame dictionaries
            audio_stop: Event to signal when to stop iteration
        """
        self._audio_frames_queue = audio_frames_queue
        self._audio_stop = audio_stop

    def close(self) -> None:
        """Clean up resources."""
        pass

    def __enter__(self):
        return self

    def __exit__(self, type_, value, traceback) -> None:
        self.close()

    def __iter__(self):
        return self

    def __next__(self) -> bytes:
        """Get next audio chunk as bytes.

        Returns:
            Audio data as bytes

        Raises:
            StopIteration: When audio_stop is set and no more frames
        """
        if not self._audio_frames_queue.empty():
            audio_frame = self._audio_frames_queue.get()
            if audio_frame is not None and audio_frame["audio"] is not None:
                return audio_frame["audio"].tobytes()

        if self._audio_stop.is_set():
            logger.debug("Stopping audio chunk iterator")
            raise StopIteration

        # No frames available, wait briefly and retry
        time.sleep(0.03)
        return self.__next__()


def streaming_audio_asr(
    asr_input_queue,
    asr_output_queue,
    asr_config_file,
    audio_stop,
    audio_error,
    asr_process_finished,
):
    """Send audio frames and receive text from ASR"""
    logger.info("Starting audio streaming process")

    # Load ASR configuration from file and create ASR service
    try:
        with open(asr_config_file, mode="r", encoding="utf8") as c:
            config_docs = yaml.safe_load_all(c)
            for doc in config_docs:
                if doc["name"] == "riva_server":
                    server_config = doc["detail"]
                    server_uri = server_config["server_uri"]
                if doc["name"] == "riva_model":
                    model_name = doc["detail"]["model_name"]
                if doc["name"] == "riva_asr_stream":
                    asr_config = doc["detail"]
    except Exception as e:
        raise ValueError(f"{asr_config_file} is not a valid YAML file") from e

    if asr_config is None or server_uri is None:
        raise Exception("RIVA ASR configuration is not valid.")

    ssl_cert = server_config.get("ssl_cert", None)
    use_ssl = server_config.get("use_ssl", False)
    riva_nim_server = server_config.get("is_nim", False)
    metadata_args = []
    if use_ssl:
        metadata = server_config.get("metadata", None)
        if metadata is not None:
            for k, v in metadata.items():
                metadata_args.append([k, v])

    # Create ASR service channel
    auth = riva.client.Auth(
        use_ssl=use_ssl, ssl_cert=ssl_cert, uri=server_uri, metadata_args=metadata_args
    )
    asr_service = riva.client.ASRService(auth)

    language_code = asr_config.get("language_code", "en-US")
    enable_automatic_punctuation = asr_config.get("enable_automatic_punctuation", True)
    profanity_filter = asr_config.get("profanity_filter", True)

    if riva_nim_server:
        # Do not pass model name for NIM
        riva_asr_config = riva.client.RecognitionConfig(
            encoding=riva.client.AudioEncoding.LINEAR_PCM,
            sample_rate_hertz=16000,
            language_code=language_code,
            max_alternatives=1,
            enable_automatic_punctuation=enable_automatic_punctuation,
            profanity_filter=profanity_filter,
            verbatim_transcripts=False,
        )
    else:
        riva_asr_config = riva.client.RecognitionConfig(
            encoding=riva.client.AudioEncoding.LINEAR_PCM,
            sample_rate_hertz=16000,
            language_code=language_code,
            max_alternatives=1,
            enable_automatic_punctuation=enable_automatic_punctuation,
            model=model_name,
            profanity_filter=profanity_filter,
            verbatim_transcripts=False,
        )

    streaming_config = riva.client.StreamingRecognitionConfig(
        config=riva_asr_config, interim_results=False
    )

    audio_chunk_iterator = AudioChunkIterator(asr_input_queue, audio_stop)

    try:
        response_generator = asr_service.streaming_response_generator(
            audio_chunk_iterator, streaming_config
        )

        for response in response_generator:
            try:
                start_time = None
                end_time = None
                transcript = ""
                for result in response.results:
                    transcript += result.alternatives[0].transcript
                    for word in result.alternatives[0].words:
                        if start_time is None or start_time > word.start_time:
                            start_time = word.start_time
                        if end_time is None or end_time < word.end_time:
                            end_time = word.end_time

                asr_output_queue.put(
                    {"transcript": transcript, "start": start_time, "end": end_time}
                )

            except AttributeError as e:
                logger.error(f"Invalid response format from ASR service: {e}")
                audio_error.set()
            except Exception as e:
                logger.error(f"Error processing ASR response: {e}")
                audio_error.set()

    except grpc.RpcError as e:
        logger.error(f"gRPC error during ASR streaming: {e}")
        audio_error.set()
    except Exception as e:
        logger.error(f"Unexpected error during ASR streaming: {e}")
        audio_error.set()
    finally:
        audio_chunk_iterator.close()

    logger.info("Exiting ASR streaming process")


class VideoFileFrameGetter:
    """Get frames from a video file as a list of tensors."""

    def __init__(
        self,
        frame_selector: BaseFrameSelector,
        frame_width=0,
        frame_height=0,
        gpu_id=0,
        do_preprocess=False,
        image_mean=[],
        rescale_factor=0,
        image_std=0,
        crop_height=0,
        crop_width=0,
        shortest_edge: int | None = None,
        enable_jpeg_output=False,
        image_aspect_ratio="",
        data_type_int8=False,
        audio_support=False,
    ) -> None:
        self._selected_pts_array = []
        self._last_gst_buffer = None
        self._loop = None
        self._frame_selector = frame_selector
        self._chunk = None
        self._gpu_id = gpu_id
        self._sei_base_time = None
        self._frame_width = self._frame_width_orig = frame_width
        self._frame_height = self._frame_height_orig = frame_height
        self._uridecodebin = None
        self._image_mean = image_mean
        self._rescale_factor = rescale_factor
        self._image_std = image_std
        self._crop_height = crop_height
        self._crop_width = crop_width
        self._shortest_edge = shortest_edge
        self._do_preprocess = do_preprocess
        self._image_aspect_ratio = image_aspect_ratio
        self._enable_jpeg_output = enable_jpeg_output
        self._data_type_int8 = data_type_int8
        self._audio_support = audio_support
        self._enable_audio = False
        self._pipeline = None
        self._last_file = ""
        self._audio_start_cv = Condition()
        self._audio_end_cv = Condition()
        self._audio_present_cv = Condition()
        self._audio_current_pts = 0
        self._dump_cached_frames = False
        self._last_video_codec = None
        self._first_frame_width = 0
        self._first_frame_height = 0
        self._err_msg = None
        self._err_msg_lock = threading.Lock()
        self._previous_frame_width = 0
        self._previous_frame_height = 0
        self._last_frame_pts = 0
        self._uridecodebin = None
        self._adecodebin = None
        self._idecodebin = None
        self._vdecodebin = None
        self._vdecodebin_h264 = None
        self._vdecodebin_h265 = None
        self._audio_eos = False
        self._audio_stop = mp.Event()
        self._audio_error = mp.Event()
        self._asr_process_finished = mp.Event()
        self._audio_start_pts = None
        self._audio_frames_lock = threading.Lock()
        self._audio_present = False
        self._eos_sent = False
        self._end_pts = None
        self._start_pts = None
        self._chunk_duration = None
        self._audio_convert = None
        self._audio_resampler = None
        self._audio_capsfilter1 = None
        self._audio_capsfilter2 = None
        self._audio_appsink = None
        self._audio_q1 = None
        self._model_name = None
        self._server_uri = None
        self._riva_nim_server = True
        self._asr_config_file = "/tmp/via/riva_asr_grpc_conf.yaml"
        self._server_config = None
        self._asr_config = None
        self._auth = None
        self._tee = None
        self._cached_transcripts = []
        self._cached_audio_frames = []
        self._asr_input_queue = None
        self._asr_output_queue = None
        self._asr_process = None
        self._pipeline_width = 0
        self._pipeline_height = 0
        self._splitmuxsink = None
        self._inference_interval = 1
        
    def _preprocess(self, frames):
        if frames and not self._enable_jpeg_output:
            # Handle multi-image scenario where frames may have different dimensions
            if len(frames) > 1:
                # Use configured frame resolution if available, otherwise use first frame's dimensions
                if self._frame_width and self._frame_height:
                    first_frame = frames[0]
                    target_height, target_width = first_frame.shape[:2]
                else:
                    # Get the first frame's dimensions as target size
                    first_frame = frames[0]
                    target_height, target_width = first_frame.shape[:2]

                    # Resize all frames to the same dimensions
                # Determine if we need to resize and get target dimensions
                need_resize = False
                for frame in frames:
                    frame_height, frame_width = frame.shape[:2]
                    if (frame_height, frame_width) != (target_height, target_width):
                        need_resize = True
                        break

                if need_resize:
                    # Use torch.nn.functional.interpolate for GPU-accelerated resizing
                    # Prepare frames for stacking - ensure they're all the same size
                    processed_frames = []
                    for frame in frames:
                        frame_height, frame_width = frame.shape[:2]

                        if (frame_height, frame_width) != (target_height, target_width):
                            # Determine if frame is HWC or CHW based on shape
                            if frame.shape[-1] == 3:  # HWC format
                                # Convert to CHW for interpolation
                                frame_chw = frame.permute(2, 0, 1).contiguous()
                                # Convert to float for interpolation
                                # (interpolate doesn't support Byte tensors)
                                frame_chw = frame_chw.float()
                                # Resize using GPU-accelerated interpolation
                                resized_chw = F.interpolate(
                                    frame_chw.unsqueeze(0),  # Add batch dimension
                                    size=(target_height, target_width),
                                    mode="bilinear",
                                    align_corners=False,
                                ).squeeze(
                                    0
                                )  # Remove batch dimension
                                # Convert back to HWC and uint8
                                resized_frame = resized_chw.permute(1, 2, 0).clamp(0, 255).byte()
                            else:  # Already CHW format
                                frame_chw = frame.contiguous()
                                # Convert to float for interpolation
                                # (interpolate doesn't support Byte tensors)
                                frame_chw = frame_chw.float()
                                resized_frame = (
                                    F.interpolate(
                                        frame_chw.unsqueeze(0),
                                        size=(target_height, target_width),
                                        mode="bilinear",
                                        align_corners=False,
                                    )
                                    .squeeze(0)
                                    .clamp(0, 255)
                                    .byte()
                                )
                            processed_frames.append(resized_frame)
                        else:
                            processed_frames.append(frame)
                    frames = processed_frames

            frames = torch.stack(frames)
            if not self._data_type_int8:
                frames = frames.half()
            if self._do_preprocess:
                if self._crop_height and self._crop_width:
                    frames = v2.functional.center_crop(
                        frames, [self._crop_height, self._crop_width]
                    )
                frames = v2.functional.normalize(
                    frames,
                    [x / (self._rescale_factor) for x in self._image_mean],
                    [x / (self._rescale_factor) for x in self._image_std],
                ).half()
        return frames

    def _upload_frame_to_minio(self, data_bytes):
        try:
            if not hasattr(self, "_minio_client") or self._minio_client is None:
                logger.debug("Initializing MinIO client")
                from urllib.parse import urlparse

                from minio import Minio

                minio_host = os.environ.get("MINIO_HOST")
                minio_port = os.environ.get("MINIO_PORT")
                minio_username = os.environ.get("MINIO_USERNAME")
                minio_password = os.environ.get("MINIO_PASSWORD")
                minio_uri = os.environ.get("MINIO_URI")

                if not minio_uri and minio_host and minio_port:
                    minio_uri = f"http://{minio_host}:{minio_port}"

                if not (minio_uri and minio_username and minio_password):
                    logger.debug("Minio URI or username or password not found")
                    return

                parsed_uri = urlparse(minio_uri)
                secure = parsed_uri.scheme == "https"
                endpoint = parsed_uri.netloc or parsed_uri.path
                try:
                    self._minio_client = Minio(
                        endpoint,
                        access_key=minio_username,
                        secret_key=minio_password,
                        secure=secure,
                    )
                except Exception:
                    self._minio_client = None
                    logger.debug("Minio client not found")
                    return

            # Upload buffer to MinIO using put_object
            try:
                # Determine bucket and prefix
                self._minio_bucket = self._current_asset_id

                # Ensure bucket exists
                try:
                    if not self._minio_client.bucket_exists(self._minio_bucket):
                        self._minio_client.make_bucket(self._minio_bucket)
                except Exception:
                    pass
                if not hasattr(self, "_minio_frame_idx"):
                    self._minio_frame_idx = 0
                chunk_idx = getattr(self, "_chunkIdx", 0)
                key = f"chunk_{int(chunk_idx)}/frame_{int(self._minio_frame_idx)}.jpg"
                bio = io.BytesIO(data_bytes)
                self._minio_client.put_object(
                    self._minio_bucket,
                    key,
                    bio,
                    length=len(data_bytes),
                )
                logger.info(
                    f"Frame {self._minio_frame_idx} uploaded to MinIO bucket {self._minio_bucket} at path {key}"  # noqa: E501
                )
                self._minio_frame_idx += 1
            except Exception:
                pass
        except Exception:
            pass

    @staticmethod
    def _image_enc_probe(pad, info, user_data):
        self = user_data
        if self._is_warmup:
            return Gst.PadProbeReturn.OK
        try:
            buf = info.get_buffer()
            if buf is None:
                return Gst.PadProbeReturn.OK
            success, mapinfo = buf.map(Gst.MapFlags.READ)
            if not success:
                return Gst.PadProbeReturn.OK
            try:
                data_bytes = bytes(mapinfo.data)
            finally:
                buf.unmap(mapinfo)
            self._upload_frame_to_minio(data_bytes)
        except Exception:
            pass
        return Gst.PadProbeReturn.OK

    def _asr_input_thread(self):
        """Thread that reads audio frames from the cached frames and sends them to the ASR service"""
        while not self._audio_stop.is_set() or len(self._cached_audio_frames) > 0:
            with self._audio_frames_lock:
                while len(self._cached_audio_frames) > 0:
                    audio_frame = self._cached_audio_frames.pop(0)
                    self._asr_input_queue.put(audio_frame)
            time.sleep(0.03)

    def _asr_output_thread(self):
        """Thread that reads ASR output from the queue and sends it to the cached frames"""
        while not self._asr_process_finished.is_set() or not self._asr_output_queue.empty():
            if not self._asr_output_queue.empty():
                asr_output = self._asr_output_queue.get()
                if len(asr_output["transcript"]) > 0:
                    start_time = asr_output["start"]
                    end_time = asr_output["end"]
                    transcript = asr_output["transcript"]
                    start_time *= 1e6
                    end_time *= 1e6
                    start_time += self._audio_start_pts
                    end_time += self._audio_start_pts

                    with self._audio_end_cv:
                        self._audio_current_pts = start_time
                        self._audio_end_cv.notify()

                    self._cached_transcripts.append(
                        {
                            "transcript": transcript,
                            "start": start_time,
                            "end": end_time,
                        }
                    )
                    logger.debug(
                        "Audio transcript: %s, buffer.pts: %d, duration: %d",
                        transcript,
                        start_time,
                        end_time - start_time,
                    )

                    with self._audio_end_cv:
                        self._audio_current_pts = end_time
                        self._audio_end_cv.notify()

            with self._err_msg_lock:
                if self._audio_error.is_set() and self._err_msg is None:
                    self._err_msg = "Error in ASR transcript generation."
                    self._audio_stop.set()
                    logger.error(self._err_msg)
                    break
            time.sleep(0.03)

        with self._audio_end_cv:
            self._audio_end_cv.notify()

    def _create_pipeline(
        self, file_path: str, username="", password="", create_source_elems_only=False
    ):
        # Construct DeepStream pipeline for decoding
        # For raw frames as tensor:
        # uridecodebin -> probe (frame selector) -> nvvideconvert -> appsink
        #     -> frame pre-processing -> add to cache
        # For jpeg images:
        # uridecodebin -> probe (frame selector) -> nvjpegenc -> appsink -> add to cache
        # For audio: uridecodebin -> probe -> audioconvert ->
        # resample -> asr -> appsink -> add text_to cache
        pipeline = self._pipeline if create_source_elems_only else Gst.Pipeline()

        def cb_elem_added(elem, username, password, selff):
            if "nvv4l2decoder" in elem.get_factory().get_name():
                elem.set_property("gpu-id", self._gpu_id)
                elem.set_property("extract-sei-type5-data", True)
                elem.set_property("sei-uuid", "NVDS_CUSTOMMETA")
            if "mpeg4videoparse" in elem.get_factory().get_name():
                elem.set_property("config-interval", -1)

        def cb_newpad_decodebin(uridecodebin, uridecodebin_pad, self):
            caps = uridecodebin_pad.get_current_caps()
            gststruct = caps.get_structure(0)
            gstname = gststruct.get_name()
            if gstname.find("video") != -1:
                uridecodebin_pad.link(self._q1.get_static_pad("sink"))
                logger.info("Video stream found.")
            if gstname.find("audio") != -1 and self._enable_audio and self._audio_q1:
                self._audio_present = True
                with self._audio_present_cv:
                    self._audio_present_cv.notify()
                self._audio_eos = False
                uridecodebin_pad.link(self._audio_q1.get_static_pad("sink"))
                logger.info("Audio stream found.")

        uridecodebin = None

        filesrc = Gst.ElementFactory.make("filesrc")
        filesrc.set_property("location", file_path)
        pipeline.add(filesrc)
        self._filesrc = filesrc

        self._parsebin = Gst.ElementFactory.make("parsebin")
        pipeline.add(self._parsebin)

        filesrc.link(self._parsebin)

        def cb_newpad_parsebin(parsebin, parsebin_pad, self):
            caps = parsebin_pad.query_caps(None)
            if not caps:
                return
            gststruct = caps.get_structure(0)
            gstname = gststruct.get_name()

            if gstname.find("video") != -1:
                if (
                    gstname.find("h264") != -1
                    and os.environ.get("VSS_DISABLE_DECODER_REUSE", "true") == "false"
                ):
                    if not self._vdecodebin_h264:
                        self._vdecodebin_h264 = Gst.ElementFactory.make("decodebin")
                        pipeline.add(self._vdecodebin_h264)
                        self._vdecodebin_h264.set_state(Gst.State.PLAYING)
                        self._vdecodebin_h264.connect("pad-added", cb_newpad_decodebin, self)
                        self._vdecodebin_h264.connect(
                            "deep-element-added",
                            lambda bin, subbin, elem, username=username, password=password, selff=self: cb_elem_added(  # noqa: E501
                                elem, username, password, selff
                            ),
                        )
                    else:
                        pipeline.add(self._vdecodebin_h264)
                        self._vdecodebin_h264.link(self._q1)
                    self._vdecodebin = self._vdecodebin_h264
                elif (
                    gstname.find("h265") != -1
                    and os.environ.get("VSS_DISABLE_DECODER_REUSE", "true") == "false"
                ):
                    if not self._vdecodebin_h265:
                        self._vdecodebin_h265 = Gst.ElementFactory.make("decodebin")
                        pipeline.add(self._vdecodebin_h265)
                        self._vdecodebin_h265.set_state(Gst.State.PLAYING)
                        self._vdecodebin_h265.connect("pad-added", cb_newpad_decodebin, self)
                        self._vdecodebin_h265.connect(
                            "deep-element-added",
                            lambda bin, subbin, elem, username=username, password=password, selff=self: cb_elem_added(  # noqa: E501
                                elem, username, password, selff
                            ),
                        )
                    else:
                        pipeline.add(self._vdecodebin_h265)
                        self._vdecodebin_h265.link(self._q1)
                    self._vdecodebin = self._vdecodebin_h265
                elif not self._vdecodebin:
                    self._vdecodebin = Gst.ElementFactory.make("decodebin")
                    pipeline.add(self._vdecodebin)
                    self._vdecodebin.set_state(Gst.State.PLAYING)
                    self._vdecodebin.connect("pad-added", cb_newpad_decodebin, self)
                    self._vdecodebin.connect(
                        "deep-element-added",
                        lambda bin, subbin, elem, username=username, password=password, selff=self: cb_elem_added(  # noqa: E501
                            elem, username, password, selff
                        ),
                    )
                parsebin_pad.link(self._vdecodebin.get_static_pad("sink"))

            if gstname.find("image") != -1:
                self._idecodebin = Gst.ElementFactory.make("decodebin")
                pipeline.add(self._idecodebin)
                self._idecodebin.set_state(Gst.State.PLAYING)
                parsebin_pad.link(self._idecodebin.get_static_pad("sink"))
                self._idecodebin.connect("pad-added", cb_newpad_decodebin, self)

            if gstname.find("audio") != -1 and self._audio_support and self._enable_audio:
                self._adecodebin = Gst.ElementFactory.make("decodebin")
                pipeline.add(self._adecodebin)
                self._adecodebin.set_state(Gst.State.PLAYING)
                parsebin_pad.link(self._adecodebin.get_static_pad("sink"))
                self._adecodebin.connect("pad-added", cb_newpad_decodebin, self)

        self._parsebin.connect("pad-added", cb_newpad_parsebin, self)

        if create_source_elems_only:
            return

        self._q1 = Gst.ElementFactory.make("queue")
        pipeline.add(self._q1)

        qvideoconvert = Gst.ElementFactory.make("queue")
        pipeline.add(qvideoconvert)

        
        self._q1.link(qvideoconvert)

        q2 = Gst.ElementFactory.make("queue")
        pipeline.add(q2)

        videoconvert = Gst.ElementFactory.make("nvvideoconvert")
        self._videoconvert = videoconvert
        videoconvert.set_property("nvbuf-memory-type", 2)
        videoconvert.set_property("compute-hw", 1)

        videoconvert.set_property("gpu-id", self._gpu_id)
        pipeline.add(videoconvert)

        if self._enable_jpeg_output:
            jpegenc = Gst.ElementFactory.make("nvjpegenc")
            format = "I420"  # only RGB/I420 supported by nvjpegenc
            if jpegenc is None:
                jpegenc = Gst.ElementFactory.make("nvimageenc")
                format = "RGB"  # only RGB/I420 supported by nvjpegenc
            if os.getenv("SAVE_CHUNK_FRAMES_MINIO", "false").lower() == "true":
                enc_src_pad = jpegenc.get_static_pad("src")
                if enc_src_pad:
                    enc_src_pad.add_probe(Gst.PadProbeType.BUFFER, self._image_enc_probe, self)
            pipeline.add(jpegenc)
        else:
            format = "GBR" if self._do_preprocess else "RGB"
            pass

        # Add parallel encoding pipeline for saving images to disk
        self._enable_image_save = os.getenv("SAVE_CHUNK_FRAMES_MINIO", "false").lower() == "true"
        if self._enable_image_save and self._enable_jpeg_output is False:
            # Create a tee to split the video stream
            tee = Gst.ElementFactory.make("tee")
            tee.set_property("name", "video_tee")
            pipeline.add(tee)

            # Create encoding branch
            encode_queue = Gst.ElementFactory.make("queue")
            pipeline.add(encode_queue)

            # Create video converter for encoding branch
            encode_videoconvert = Gst.ElementFactory.make("nvvideoconvert")
            encode_videoconvert.set_property("gpu-id", self._gpu_id)
            pipeline.add(encode_videoconvert)

            # Create caps filter for encoding format
            encode_capsfilter = Gst.ElementFactory.make("capsfilter")
            encode_format = "I420"  # I420 works well with both nvjpegenc and nvimageenc
            encode_capsfilter.set_property(
                "caps", Gst.Caps.from_string(f"video/x-raw(memory:NVMM), format={encode_format}")
            )
            pipeline.add(encode_capsfilter)

            image_encoder = Gst.ElementFactory.make("nvjpegenc")
            if image_encoder is None:
                image_encoder = Gst.ElementFactory.make("nvimageenc")

            if image_encoder is None:
                logger.warning("NVIDIA encoders not available. Falling back to software encoding.")
                image_encoder = Gst.ElementFactory.make("jpegenc")
                encode_capsfilter.set_property(
                    "caps", Gst.Caps.from_string("video/x-raw, format=I420")
                )

            pipeline.add(image_encoder)
            fakesink = Gst.ElementFactory.make("fakesink")
            fakesink.set_property("async", False)
            pipeline.add(fakesink)

            # Store elements for later linking and cleanup
            self._encoding_elements = {
                "tee": tee,
                "encode_queue": encode_queue,
                "encode_videoconvert": encode_videoconvert,
                "encode_capsfilter": encode_capsfilter,
                "image_encoder": image_encoder,
                "fakesink": fakesink,
            }

            # Link encoding pipeline elements
            tee.link(encode_queue)
            encode_queue.link(encode_videoconvert)
            encode_videoconvert.link(encode_capsfilter)
            encode_capsfilter.link(image_encoder)
            image_encoder.link(fakesink)

            enc_src_pad = image_encoder.get_static_pad("src")
            if enc_src_pad:
                enc_src_pad.add_probe(Gst.PadProbeType.BUFFER, self._image_enc_probe, self)
            image_encoder.link(fakesink)

        # format = "NV12"
        capsfilter = Gst.ElementFactory.make("capsfilter")
        self._out_caps_filter = capsfilter
        capsfilter.set_property(
            "caps",
            Gst.Caps.from_string(
                (
                    f"video/x-raw(memory:NVMM), format={format},"
                    f" width={self._frame_width}, height={self._frame_height}"
                )
                if self._frame_width and self._frame_height
                else f"video/x-raw(memory:NVMM), format={format}"
            ),
        )
        pipeline.add(capsfilter)

        self._audio_q1 = None
        if self._audio_support:
            self._audio_eos = False
            self._audio_present = False
            self._audio_q1 = Gst.ElementFactory.make("queue")
            pipeline.add(self._audio_q1)

            # Audio converter for non-interleaved audio to interleaved conversion
            self._audio_convert = Gst.ElementFactory.make("audioconvert")
            pipeline.add(self._audio_convert)

            self._audio_resampler = Gst.ElementFactory.make("audioresample")
            pipeline.add(self._audio_resampler)

            self._audio_capsfilter1 = Gst.ElementFactory.make("capsfilter")
            audio_format = "S16LE"
            self._audio_capsfilter1.set_property(
                "caps",
                Gst.Caps.from_string(
                    f"audio/x-raw, format={audio_format}" f"channels=1, channel-mask=(bitmask)1"
                ),
            )
            pipeline.add(self._audio_capsfilter1)

            self._audio_capsfilter2 = Gst.ElementFactory.make("capsfilter")

            audio_format = "S16LE"
            self._audio_capsfilter2.set_property(
                "caps",
                Gst.Caps.from_string(
                    f"audio/x-raw, format={audio_format},"
                    f"rate=16000, channels=1, channel-mask=(bitmask)1"
                ),
            )
            pipeline.add(self._audio_capsfilter2)

        def buffer_probe(pad, info, data):
            # Probe callback function to pass chosen frames and drop other frames
            buffer = info.get_buffer()
            if buffer.pts == Gst.CLOCK_TIME_NONE:
                return Gst.PadProbeReturn.DROP

            self._last_frame_pts = buffer.pts

            if self._frame_selector.choose_frame(buffer, buffer.pts):
                return Gst.PadProbeReturn.OK
            if len(self._frame_selector._selected_pts_array) == 0 and not self._eos_sent:
                if self._audio_present:
                    if self._audio_eos:
                        self._pipeline.send_event(Gst.Event.new_eos())
                        self._eos_sent = True
                        logger.debug("sent eos")
                else:
                    self._pipeline.send_event(Gst.Event.new_eos())
                    if self._audio_convert:
                        self._audio_convert.send_event(Gst.Event.new_eos())
                    self._eos_sent = True
                    logger.debug("sent eos")

            return Gst.PadProbeReturn.DROP

        def add_to_cache(buffer, width, height):
            # Probe callback to add raw frame / jpeg image to cache
            _, mapinfo = buffer.map(Gst.MapFlags.READ)
            if self._enable_jpeg_output:
                # Buffer contains JPEG image, add to cache as is
                image_tensor = np.frombuffer(mapinfo.data, dtype=np.uint8)
            else:
                # Buffer contains raw frame

                # Extract GPU memory pointer and create tensor from it using
                # DeepStream Python Bindings and cupy
                _, shape, strides, dataptr, size = pyds.get_nvds_buf_surface_gpu(hash(buffer), 0)
                ctypes.pythonapi.PyCapsule_GetPointer.restype = ctypes.c_void_p
                ctypes.pythonapi.PyCapsule_GetPointer.argtypes = [ctypes.py_object, ctypes.c_char_p]
                owner = None
                c_data_ptr = ctypes.pythonapi.PyCapsule_GetPointer(dataptr, None)
                unownedmem = cp.cuda.UnownedMemory(c_data_ptr, size, owner)
                memptr = cp.cuda.MemoryPointer(unownedmem, 0)
                n_frame_gpu = cp.ndarray(
                    shape=shape, dtype=np.uint8, memptr=memptr, strides=strides, order="C"
                )
                image_tensor = torch.tensor(
                    n_frame_gpu, dtype=torch.uint8, requires_grad=False, device="cuda"
                )

            # Cache the pre-processed frame / jpeg and its timestamp. Convert
            # the timestamps from nanoseconds to seconds.
        
            self._cached_frames.append(image_tensor)
            self._cached_frames_pts.append((buffer.pts) / 1000000000.0)
            buffer.unmap(mapinfo)

        def add_text_to_cache(buffer):
            # Probe callback to add audio transcription to cache
            _, mapinfo = buffer.map(Gst.MapFlags.READ)
            transcription = mapinfo.data.decode("utf-8")
            logger.debug(
                "Audio transcript: %s, buffer.pts: %d, duration: %d",
                transcription,
                buffer.pts,
                buffer.duration,
            )

            # Cache the audio transcripts and its timestamp. Convert
            # the timestamps from nanoseconds to seconds.
            with self._audio_end_cv:
                self._audio_current_pts = buffer.pts
                self._audio_end_cv.notify()

            self._cached_transcripts.append(
                {
                    "transcript": transcription,
                    "start": (buffer.pts) / 1000000000.0,
                    "end": (buffer.pts + buffer.duration) / 1000000000.0,
                }
            )

            with self._audio_end_cv:
                self._audio_current_pts = buffer.pts + buffer.duration
                self._audio_end_cv.notify()

            buffer.unmap(mapinfo)
            logger.debug("Picked audio transcription buffer %d", buffer.pts)

        def add_audio_to_cache(buffer):
            # Probe callback to add audio samples to cache
            _, mapinfo = buffer.map(Gst.MapFlags.READ)
            audio_tensor = np.frombuffer(mapinfo.data, dtype=np.int16)
            # logger.debug(
            #     "New audio buffer, buffer.pts: %d, duration: %d", buffer.pts, buffer.duration
            # )

            with self._audio_frames_lock:
                if self._audio_start_pts is None:
                    if buffer.pts != Gst.CLOCK_TIME_NONE:
                        self._audio_start_pts = buffer.pts
                    else:
                        self._audio_start_pts = 0

            # Cache the audio samples and their timestamp. Convert
            # the timestamps from nanoseconds to seconds.
            with self._audio_frames_lock:
                self._cached_audio_frames.append(
                    {
                        "audio": audio_tensor,
                        "start": (buffer.pts) / 1000000000.0,
                        "end": (buffer.pts + buffer.duration) / 1000000000.0,
                    }
                )

            buffer.unmap(mapinfo)
            # logger.debug("Picked audio buffer %d", buffer.pts)

        def on_new_sample(appsink):
            # Appsink callback to pull frame from the pipeline
            sample = appsink.emit("pull-sample")
            caps = sample.get_caps()
            height = caps.get_structure(0).get_value("height")
            width = caps.get_structure(0).get_value("width")
            if self._first_frame_width == 0:
                logger.debug("first width,height in chunk=%d, %d", width, height)
                self._first_frame_width = width
                self._first_frame_height = height
            if sample:
                buffer = sample.get_buffer()
                add_to_cache(buffer, width, height)
            return Gst.FlowReturn.OK

        def on_new_sample_audio(audio_appsink):
            # Appsink callback to pull audio samples from the pipeline
            sample = audio_appsink.emit("pull-sample")
            if sample:
                buffer = sample.get_buffer()
                # logger.debug("New audio buffer with pts: %d", buffer.pts)
                if buffer:
                    if buffer.pts >= self._end_pts and not self._audio_eos:
                        self._audio_eos = True
                        logger.info("Audio pipeline finished for chunk: %d", self._chunkIdx)
                    if buffer.get_size() and not self._audio_eos:
                        # Audio buffer for file input
                        add_audio_to_cache(buffer)
            return Gst.FlowReturn.OK

        appsink = Gst.ElementFactory.make("appsink")
        appsink.set_property("async", False)
        appsink.set_property("sync", False)
        appsink.set_property("enable-last-sample", False)
        appsink.set_property("emit-signals", True)
        appsink.connect("new-sample", on_new_sample)
        pipeline.add(appsink)

        if self._audio_support:
            self._audio_appsink = Gst.ElementFactory.make("appsink")
            self._audio_appsink.set_property("async", False)
            self._audio_appsink.set_property("sync", False)
            self._audio_appsink.set_property("enable-last-sample", False)
            self._audio_appsink.set_property("emit-signals", True)
            self._audio_appsink.connect("new-sample", on_new_sample_audio)
            pipeline.add(self._audio_appsink)

        if uridecodebin:
            uridecodebin.connect("pad-added", cb_newpad_decodebin, self)

        def cb_autoplug_continue(bin, pad, caps, udata):
            # Ignore audio
            return not caps.to_string().startswith("audio/")

        if not self._audio_support or not self._enable_audio:
            if uridecodebin:
                uridecodebin.connect("autoplug-continue", cb_autoplug_continue, None)

        if uridecodebin:
            uridecodebin.connect(
                "deep-element-added",
                lambda bin, subbin, elem, username=username, password=password, selff=self: cb_elem_added(  # noqa: E501
                    elem, username, password, selff
                ),
            )

        pad = videoconvert.get_static_pad("sink")

        def buffer_probe_event_eos(pad, info, data):
            # Probe callback function to send explicit EOS on audio path
            # Send EOS for image input (not self._audio_present).
            event = info.get_event()

            if event.type == Gst.EventType.EOS:
                if self._audio_convert:
                    if not self._audio_present:
                        self._audio_convert.send_event(Gst.Event.new_eos())
            return Gst.PadProbeReturn.OK

        def buffer_probe_event(pad, info, data):
            # Probe callback function to pass chosen frames and drop other frames
            event = info.get_event()
            if event.type != Gst.EventType.CAPS:
                return Gst.PadProbeReturn.OK

            caps = event.parse_caps()
            struct = caps.get_structure(0)
            _, width = struct.get_int("width")
            _, height = struct.get_int("height")

            out_pad_width = 0
            out_pad_height = 0

            if self._image_aspect_ratio == "pad":
                pad_size = abs(width - height) // 2
                out_pad_width = pad_size if width < height else 0
                out_pad_height = pad_size if width > height else 0

            out_width = width + 2 * out_pad_width
            out_height = height + 2 * out_pad_height

            if self._shortest_edge is not None:
                shortest_edge = (
                    self._shortest_edge
                    if isinstance(self._shortest_edge, list)
                    else [self._shortest_edge, self._shortest_edge]
                )
                out_pad_width *= shortest_edge[0] / out_width
                out_pad_height *= shortest_edge[1] / out_height
                out_width, out_height = shortest_edge

            self._out_caps_filter.set_property(
                "caps",
                Gst.Caps.from_string(
                    f"video/x-raw(memory:NVMM), format=GBR, width={out_width}, height={out_height}"
                ),
            )

            if out_pad_width or out_pad_height:
                self._videoconvert.set_property(
                    "dest-crop",
                    (
                        f"{int(out_pad_width)}:{int(out_pad_height)}:"
                        f"{int(out_width-2*out_pad_width)}:{int(out_height-2*out_pad_height)}"
                    ),
                )
                self._videoconvert.set_property("interpolation-method", 1)

            return Gst.PadProbeReturn.OK

        if self._do_preprocess:
            # Event probe to calculate and set pre-processing params based on file resolution
            pad.add_probe(Gst.PadProbeType.EVENT_DOWNSTREAM, buffer_probe_event, self)

        pad.add_probe(Gst.PadProbeType.BUFFER, buffer_probe, self)
        pad.add_probe(Gst.PadProbeType.EVENT_DOWNSTREAM, buffer_probe_event_eos, self)

        qvideoconvert.link(videoconvert)

        # Connect main pipeline elements, inserting tee if image saving is enabled
        if self._enable_image_save and hasattr(self, "_encoding_elements"):
            # Pipeline with tee for parallel encoding: videoconvert -> capsfilter -> tee -> main branch
            videoconvert.link(capsfilter)
            capsfilter.link(self._encoding_elements["tee"])

            self._encoding_elements["tee"].link(q2)
        else:
            # Original pipeline without tee
            videoconvert.link(capsfilter)
            if self._enable_jpeg_output:
                capsfilter.link(jpegenc)
                jpegenc.link(q2)
            else:
                capsfilter.link(q2)

        q2.link(appsink)

        def audio_buffer_probe(pad, info, data):
            # Probe callback function to pass chosen frames and drop other frames
            if not self._enable_audio:
                return Gst.PadProbeReturn.DROP

            buffer = info.get_buffer()

            # Small overlap in audio chunks so that words are not missed
            audio_overlap = min(self._chunk_duration // 10, 5e9)

            if buffer.pts > self._end_pts + audio_overlap or buffer.pts < self._start_pts:
                return Gst.PadProbeReturn.DROP
            else:
                return Gst.PadProbeReturn.OK

        if self._audio_support:
            self._audio_q1.link(self._audio_convert)
            self._audio_convert.link(self._audio_capsfilter1)
            self._audio_capsfilter1.link(self._audio_resampler)
            self._audio_resampler.link(self._audio_capsfilter2)
            self._audio_capsfilter2.link(self._audio_appsink)

            audio_pad = self._audio_convert.get_static_pad("sink")
            audio_pad.add_probe(Gst.PadProbeType.BUFFER, audio_buffer_probe, self)

        self._loop = GLib.MainLoop()
        bus = pipeline.get_bus()
        bus.add_signal_watch()
        self._bus = bus

        def bus_call(bus, message, selff):
            t = message.type
            if t == Gst.MessageType.EOS:
                # sys.stdout.write("End-of-stream\n")
                logger.debug("EOS received on bus")
                selff._audio_stop.set()
                selff._loop.quit()
            elif t == Gst.MessageType.WARNING:
                err, debug = message.parse_warning()

                # Ignore known harmless warnings
                if "Retrying using a tcp connection" in debug:
                    return True

                sys.stderr.write("Warning: %s: %s\n" % (err, debug))
            elif t == Gst.MessageType.ERROR:
                err, debug = message.parse_error()
                sys.stderr.write("Error: %s: %s\n" % (err, debug))
                with self._err_msg_lock:
                    self._err_msg = f"{err}:{debug}"
                selff._audio_stop.set()
                selff._loop.quit()
            return True

        bus.connect("message", bus_call, self)
        return pipeline

    def destroy_pipeline(self):
        if self._pipeline:
            self._pipeline.set_state(Gst.State.NULL)
            self._pipeline = None

    # Debug functionality
    # Dump cached frames
    def dump_cached_frame(self, cached_frames, cached_frames_pts, enable_jpeg_output):
        from PIL import Image

        if self._dump_cached_frames:
            for frame, frame_pts in zip(cached_frames, cached_frames_pts):
                if enable_jpeg_output:
                    output_path = os.path.join(
                        self._cached_frames_dir, f"frame_{frame_pts:08.3f}.jpg"
                    )
                    with open(output_path, "wb") as f:
                        f.write(frame.tobytes())
                else:
                    # Move tensor to CPU (if it's on GPU) and detach (if part of a graph)
                    frame_cpu = frame.cpu().detach()
                    # Convert to NumPy array
                    numpy_image = frame_cpu.numpy()
                    # Ensure array is in correct shape (H,W,C) and uint8 format
                    if len(numpy_image.shape) == 3:
                        if numpy_image.shape[0] == 3:  # If channels are first (C,H,W)
                            numpy_image = numpy_image.transpose(1, 2, 0)
                    numpy_image = numpy_image.astype(np.uint8)
                    # print(numpy_image.shape)
                    pil_image = Image.fromarray(numpy_image)
                    pil_image.save(
                        os.path.join(self._cached_frames_dir, f"frame_{frame_pts:08.3f}.jpg")
                    )

    def _clear_pipeline_elements(self):
        self._vdecodebin_h264 = None
        self._vdecodebin_h265 = None
        self._vdecodebin = None
        self._adecodebin = None
        self._idecodebin = None
        self._uridecodebin = None
        self._filesrc = None
        self._parsebin = None
        self._nvstreammux = None
        self._q1 = None
        self._q2 = None
        self._q3 = None
        self._q4 = None
        self._q5 = None
        self._q6 = None
        self._tee = None
        self._splitmuxsink = None
        self._preview_valve = None
        self._audio_convert = None
        self._audio_resampler = None
        self._audio_appsink = None

    def get_frames(
        self,
        chunk: ChunkInfo,
        retain_pipeline=False,
        frame_selector=None,
        enable_audio=False,
        request_id="",
        frame_width=None,
        frame_height=None,
        video_codec=None,
    ):
        """Get frames from a chunk

        Args:
            chunk (ChunkInfo): Chunk to get frames from

        Returns:
            (list[tensor], list[float]): List of tensors containing raw frames or jpeg images
                                         and a list of corresponding timestamps in seconds
        """
        self._cached_frames = []
        self._cached_frames_pts = []
        self._cached_audio_frames = []
        self._audio_eos = False
        self._audio_present = False
        self._enable_audio = enable_audio
        self._eos_sent = False
        self._end_pts = chunk.end_pts
        self._start_pts = chunk.start_pts
        self._chunk_duration = chunk.end_pts - chunk.start_pts
        self._chunkIdx = chunk.chunkIdx
        self._current_asset_id = getattr(chunk, "streamId", None)
        self._minio_frame_idx = 0
        self._is_warmup = False if request_id else True
        with self._err_msg_lock:
            self._err_msg = None

        logger.debug("Audio ASR enabled: %d", enable_audio)

        if not frame_width:
            frame_width = self._frame_width_orig
        if not frame_height:
            frame_height = self._frame_height_orig

        old_pipeline = None
        # ";" in chunk.file denotes a list of files
        for file in chunk.file.split(";"):
            if video_codec:
                file_video_codec = video_codec
            else:
                file_video_codec = MediaFileInfo.get_info(file).video_codec

            is_codec_changed = self._last_video_codec != file_video_codec
            is_resolution_changed = (
                frame_width != self._previous_frame_width
                or frame_height != self._previous_frame_height
            )
            is_file_changed = self._last_file != file

            def backup_decodebin():
                # If codec or resolution has changed, remove the decodebin from the pipeline
                # and keep the decodebin backed up if old codec is h264 or h265
                if self._pipeline:
                    self._pipeline.send_event(Gst.Event.new_flush_start())
                    self._pipeline.send_event(Gst.Event.new_flush_stop(True))

                    if self._vdecodebin:
                        self._pipeline.remove(self._vdecodebin)
                        if self._vdecodebin not in [self._vdecodebin_h264, self._vdecodebin_h265]:
                            self._vdecodebin.set_state(Gst.State.NULL)
                self._vdecodebin = None

            if (
                is_codec_changed
                or is_resolution_changed
            ) and self._pipeline:
                backup_decodebin()
                old_pipeline = self._pipeline
                self._pipeline = None
                self._vdecodebin = None
                if not (self._frame_width and self._frame_height):
                    # Next pipeline should use same resolution as first
                    # to allow all frames in the chunk have same resolution
                    self._frame_width = self._first_frame_width
                    self._frame_height = self._first_frame_height

            # If pipeline exists, check if file has changed or audio is enabled and audio decodebin is None
            # (possible that same file was processed with audio disabled and now with audio enabled).
            # If so, create new source elements.
            if self._pipeline and (
                is_file_changed or (self._enable_audio and self._adecodebin is None)
            ):
                backup_decodebin()
                if self._adecodebin:
                    self._pipeline.remove(self._adecodebin)
                    self._adecodebin.set_state(Gst.State.NULL)
                self._adecodebin = None

                if self._idecodebin:
                    self._pipeline.remove(self._idecodebin)
                    self._idecodebin.set_state(Gst.State.NULL)
                self._idecodebin = None

                self._filesrc.set_state(Gst.State.NULL)
                self._parsebin.set_state(Gst.State.NULL)

                self._pipeline.remove(self._filesrc)
                self._pipeline.remove(self._parsebin)
                self._filesrc = None
                self._parsebin = None
                self._create_pipeline(file, create_source_elems_only=True)
            else:
                if self._adecodebin and self._enable_audio:
                    self._audio_present = True

            self._last_file = file
            self._frame_width = frame_width
            self._frame_height = frame_height
            self._previous_frame_width = frame_width
            self._previous_frame_height = frame_height
            self._last_video_codec = video_codec

            if not self._pipeline:
                self._pipeline = self._create_pipeline(file)
            pipeline = self._pipeline

            # Set start/end time in the file based on chunk info.
            frame_selector_backup = self._frame_selector
            if frame_selector:
                self._frame_selector = frame_selector
            self._frame_selector.set_chunk(chunk)
            start_pts = chunk.start_pts - chunk.pts_offset_ns

            pipeline.set_state(Gst.State.PAUSED)
            pipeline.get_state(Gst.CLOCK_TIME_NONE)

            pipeline.seek_simple(
                Gst.Format.TIME,
                Gst.SeekFlags.FLUSH | Gst.SeekFlags.KEY_UNIT | Gst.SeekFlags.SNAP_BEFORE,
                start_pts,
            )

            # Set the pipeline to PLAYING and wait for end-of-stream or error
            pipeline.set_state(Gst.State.PLAYING)
            with TimeMeasure("Decode "):
                self._loop.run()
            pipeline.set_state(Gst.State.PAUSED)
            if old_pipeline:
                old_pipeline.set_state(Gst.State.NULL)

        with self._err_msg_lock:
            has_error = self._err_msg is not None
        if not retain_pipeline or has_error:
            self._pipeline.set_state(Gst.State.NULL)
            self._pipeline = None
            self._clear_pipeline_elements()

        # Return the cached raw preprocessed frames / jpegs and the corresponding timestamps.
        # Adjust for the PTS offset if any.
        self._cached_frames_pts = [t + chunk.pts_offset_ns / 1e9 for t in self._cached_frames_pts]

        for audio_frame in self._cached_audio_frames:
            audio_frame["start"] += chunk.pts_offset_ns / 1e9
            audio_frame["end"] += chunk.pts_offset_ns / 1e9

        # reset frame resoulution config after processing multiple files
        self._frame_width = self._frame_width_orig
        self._frame_height = self._frame_height_orig
        self._first_frame_width = 0
        self._first_frame_height = 0
        self.dump_cached_frame(
            self._cached_frames, self._cached_frames_pts, self._enable_jpeg_output
        )

        logger.debug(
            "sampled frame num: %d, chunk: %s, gpu_id: %d",
            len(self._cached_frames),
            chunk,
            self._gpu_id,
        )
        if len(self._cached_frames) == 0:
            logger.warning("No frames found for chunk %s", chunk)
        preprocessed_frames = self._preprocess(self._cached_frames)
        self._cached_frames = None
        self._frame_selector = frame_selector_backup

        with self._err_msg_lock:
            err_msg = self._err_msg
        return (
            preprocessed_frames,
            self._cached_frames_pts,
            self._cached_audio_frames,
            err_msg,
        )

    def dispose_pipeline(self):
        if self._pipeline.set_state(Gst.State.NULL) != Gst.StateChangeReturn.SUCCESS:
            logger.error("Couldn't set state to NULL for pipeline")
        logger.info("Pipeline moved to NULL")

    def dispose_pipeline_from_separate_thread(self):
        """Safely move pipeline to NULL state and clean up resources."""

        # Create a flag to track completion
        self._disposal_complete = False

        def disposal_thread():
            """Thread function to handle pipeline disposal"""
            try:
                logger.debug("Starting pipeline disposal in separate thread")
                self.dispose_pipeline()
                self._disposal_complete = True
                logger.debug("Pipeline disposal completed")
            except Exception as e:
                logger.debug("Error during pipeline disposal: %s", e)
                self._disposal_complete = True  # Mark as complete even on error

        # Start disposal thread
        disposal_thread = threading.Thread(target=disposal_thread)
        disposal_thread.start()

        # Wait for disposal to complete with timeout
        timeout = 120  # Total timeout in seconds
        start_time = time.time()
        while not self._disposal_complete:
            if time.time() - start_time > timeout:
                logger.error("ERROR: Pipeline disposal timed out after %d seconds", timeout)
                break
            time.sleep(2)
            logger.debug("Waiting for pipeline disposal to complete...")

    def dispose_source(self, src):
        if src.set_state(Gst.State.NULL) != Gst.StateChangeReturn.SUCCESS:
            logger.error("Couldn't set state to NULL for %s", self._uridecodebin.get_name())
        logger.info("Source removed")



if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Video File Frame Getter")
    parser.add_argument("file_path", type=str, help="Video file path to get frames from")

    parser.add_argument(
        "--chunk-duration",
        type=int,
        default=10,
        help="Chunk duration in seconds",
    )
    parser.add_argument(
        "--chunk-overlap-duration",
        type=int,
        default=0,
        help="Chunk overlap duration in seconds",
    )
    parser.add_argument(
        "--username", type=str, default=None, help="Username for authentication"
    )
    parser.add_argument(
        "--password", type=str, default=None, help="Password for authentication"
    )

    parser.add_argument(
        "--start-time", type=float, default=0, help="Start time in sec to get frames from"
    )

    parser.add_argument(
        "--end-time", type=float, default=-1, help="End time in sec to get frames from"
    )

    parser.add_argument("--num-frames", type=int, default=8, help="Number of frames to get")
    parser.add_argument("--gpu-id", type=int, default=0, help="gpu id")

    parser.add_argument(
        "--enable-jpeg-output",
        type=bool,
        default=False,
        help="enable JPEG output instead of NVMM:x-raw",
    )

    parser.add_argument(
        "--enable-audio",
        type=bool,
        default=False,
        help="enable audio transcription using RIVA ASR",
    )

    args = parser.parse_args()

    frame_getter = VideoFileFrameGetter(
        frame_selector=DefaultFrameSelector(args.num_frames),
        gpu_id=args.gpu_id,
        enable_jpeg_output=args.enable_jpeg_output,
        audio_support=args.enable_audio,
    )

    chunk = ChunkInfo()
    chunk.file = args.file_path
    chunk.start_pts = args.start_time * 1000000000
    chunk.end_pts = args.end_time * 1000000000 if args.end_time >= 0 else -1
    frames, frames_pts, audio_frames, error = frame_getter.get_frames(
        chunk, enable_audio=args.enable_audio
    )
    print(f"Picked {len(frames)} frames with times: {frames_pts}")
