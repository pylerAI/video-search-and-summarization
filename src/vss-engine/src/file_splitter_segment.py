"""VIA File Splitter"""

import json
import os
from datetime import datetime, timezone
from enum import Enum
from typing import Callable

import gi
from chunk_info import ChunkInfo
from via_logger import TimeMeasure

gi.require_version("Gst", "1.0")
from gi.repository import Gst  # noqa: E402

Gst.init(None)


def get_timestamp_str(ts):
    """Get RFC3339 string timestamp"""
    return (
        datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
        + f".{(int(ts * 1000) % 1000):03d}Z"
    )


def ntp_to_unix_timestamp(ntp_ts):
    """Convert an RFC3339 timestamp string to a UNIX timestamp(float)"""
    return (
        datetime.strptime(ntp_ts, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=timezone.utc).timestamp()
    )


def parse_time_str(time_str: str) -> int:
    """Convert 'MM:SS' or 'HH:MM:SS' to nanoseconds"""
    parts = time_str.split(":")
    if len(parts) == 2:
        minutes, seconds = map(int, parts)
        total_seconds = minutes * 60 + seconds
    elif len(parts) == 3:
        hours, minutes, seconds = map(int, parts)
        total_seconds = hours * 3600 + minutes * 60 + seconds
    else:
        raise ValueError(f"Invalid time format: {time_str}")
    return total_seconds * 1_000_000_000  # ns


class FileSplitterSegment:
    """File Splitter Segment

    Splits files / streams into chunks based on configuration. Supports two modes:
    * "split" - Files are actually split into smaller chunk files.
    * "seek" - Files are not actually split, but the chunks contain start & end
               timestamps in the original file.
    """

    class SplitMode(Enum):
        SPLIT = "split"
        SEEK = "seek"

        def __str__(self):
            return self.value

    def __init__(
        self,
        stream: str,
        mode: SplitMode,
        segment: str,
        on_new_chunk: Callable[[ChunkInfo], None],
        sliding_window_overlap_sec=0,
        start_pts: int | None = None,
        end_pts: int | None = None,
        username: str = "",
        password: str = "",
    ) -> None:
        """FileSplitter constructor.

        Args:
            stream: RTSP URL or file path
            mode: Split mode
            on_new_chunk: Callback when new chunks are generated
            sliding_window_overlap_sec: Chunk overlap duration in seconds. Defaults to 0.
            start_pts: Time in file to start chunking from, specified as nanoseconds.
                       Defaults to None.
            end_pts: Time in file to stop chunking at, specified as nanoseconds. Defaults to None.
            output_file_prefix: For "split" chunking mode, prefix of the output chunk files.
                                Defaults to "".
        """
        self._segment_path = segment
        self._stream = stream
        self._split_mode = mode
        self._sliding_window_overlap_sec = sliding_window_overlap_sec
        self._on_new_chunk = on_new_chunk
        self._last_chunk_file = ""
        self._last_pts_offset = 0
        self._last_chunkidx = 0
        self._loop = None
        self._ntp_epoch = 0
        self._ntp_pts = 0
        self._start_pts = start_pts
        self._end_pts = end_pts
        self._base_ntp_time = 0
        self._got_error = False
        self._username = username
        self._password = password

    def split(self):
        """Split the stream based on JSON-defined segments"""

        with TimeMeasure("File Split Segment"):
            # JSON 파일 읽기
            if not os.path.exists(self._segment_path):
                raise FileNotFoundError(f"Segment file not found: {self._segment_path}")

            with open(self._segment_path, "r") as f:
                seg_data = json.load(f)

            chunkIdx = 0
            coarse_idx = 0
            for coarse in seg_data.get("coarse_scenes", []):
                coarse_start = parse_time_str(coarse["start_time"])
                for fine in coarse.get("fine_scenes", []):
                    start_pts =  parse_time_str(fine["start_time"])
                    end_pts = parse_time_str(fine["end_time"])
    
                    info = ChunkInfo()
                    info.chunkIdx = chunkIdx
                    info.is_first = True if chunkIdx == 0 else False
                    info.file = self._stream
                    info.pts_offset_ns = 0
                    info.start_pts = start_pts
                    info.end_pts = end_pts
                    info.start_ntp = get_timestamp_str(self._base_ntp_time + start_pts / 1e9)
                    info.end_ntp = get_timestamp_str(self._base_ntp_time + end_pts / 1e9)
                    info.start_ntp_float = ntp_to_unix_timestamp(info.start_ntp)
                    info.end_ntp_float = ntp_to_unix_timestamp(info.end_ntp)
                    self._on_new_chunk(info, coarse_idx)
                    chunkIdx += 1
                coarse_idx += 1
            # 마지막 None 콜백으로 종료 알림
            self._on_new_chunk(None, coarse_idx)

        return not self._got_error

    def stop_split(self):
        if self._loop:
            self._loop.quit()
