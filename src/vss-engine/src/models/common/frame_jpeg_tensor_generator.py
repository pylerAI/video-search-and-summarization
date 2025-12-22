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

import io
from typing import List

import numpy as np
import torch
from PIL import Image, ImageDraw, ImageFont

from via_logger import TimeMeasure, logger


def save_jpeg_buffer_as_tensor(numpy_array):
    tensor = torch.from_numpy(numpy_array)
    logger.debug(f"DEBUGME len(tensor)  {len(tensor)}")
    return tensor


def save_jpeg_buffers_as_single_tensor(numpy_arrays):
    """
    Takes an array of 10 numpy arrays and returns a single PyTorch tensor of shape (1, 10, N),
    where N is the size of the largest numpy array after padding all other arrays with zeros.
    """
    # Find the size of the largest numpy array
    max_size = max(arr.size for arr in numpy_arrays)

    # Pad all other numpy arrays with zeros to match the largest size
    padded_arrays = []
    for arr in numpy_arrays:
        padded_arr = np.pad(arr, (0, max_size - arr.size), mode="constant", constant_values=0)
        padded_arrays.append(padded_arr)

    # Stack the padded numpy arrays into a single PyTorch tensor
    stacked_tensor = torch.stack(list(map(torch.from_numpy, padded_arrays)))

    return stacked_tensor.unsqueeze(0)


def jpeg_buffer_to_pil_image(jpeg_buffer: np.ndarray) -> Image.Image:
    """Convert JPEG buffer (numpy array) to PIL Image"""
    jpeg_bytes = jpeg_buffer.tobytes()
    return Image.open(io.BytesIO(jpeg_bytes))


def pil_image_to_jpeg_buffer(pil_image: Image.Image, quality: int = 95) -> np.ndarray:
    """Convert PIL Image to JPEG buffer (numpy array)"""
    buffer = io.BytesIO()
    pil_image.save(buffer, format='JPEG', quality=quality)
    jpeg_bytes = buffer.getvalue()
    return np.frombuffer(jpeg_bytes, dtype=np.uint8)


def overlay_frame_number_on_jpeg_buffer(
    jpeg_buffer: np.ndarray,
    relative_timestamp: float,  # This is already the relative timestamp
    position_idx: int,
    border_height: int = 28,
    temporal_path_size: int = 2,
    font_size: int = 20,
    font_color: str = "white",
) -> np.ndarray:
    """Apply frame number overlay directly on JPEG buffer with pre-calculated relative timestamp"""
    try:
        # Convert JPEG buffer to PIL Image
        pil_image = jpeg_buffer_to_pil_image(jpeg_buffer)
        
        # Apply overlay directly with the relative timestamp (don't calculate it again)
        overlaid_image = _apply_single_frame_overlay_pil(
            pil_image, relative_timestamp, position_idx, border_height, temporal_path_size, font_size, font_color
        )
        
        # Convert back to JPEG buffer
        return pil_image_to_jpeg_buffer(overlaid_image)
    except Exception as e:
        logger.warning(f"Failed to apply overlay on frame: {e}")
        return jpeg_buffer  # Return original buffer if overlay fails


def _apply_single_frame_overlay_pil(image, relative_timestamp, position_idx, border_height=28, temporal_path_size=2, font_size=20, font_color="white"):
    """Apply overlay to a single PIL image with pre-calculated relative timestamp"""
    # Try to use DejaVu Sans Mono font for better readability
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", font_size)

    # Get original dimensions
    width, height = image.size

    # Create new image with black border at the bottom
    new_height = height + border_height
    new_image = Image.new("RGB", (width, new_height), color="black")

    # Paste original image at the top
    new_image.paste(image, (0, 0))

    # Draw text on the black border
    draw = ImageDraw.Draw(new_image)

    # Use the pre-calculated relative timestamp
    text = f"{relative_timestamp:.2f}s"

    # Get text dimensions
    try:
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    except AttributeError:
        # Fallback for older PIL versions
        text_width, text_height = draw.textsize(text, font=font)

    # Use the provided position index
    section_width = width // temporal_path_size

    # Calculate x position based on position index
    section_center_x = position_idx * section_width + section_width // 2
    text_x = section_center_x - text_width // 2

    # Ensure text doesn't go outside bounds
    text_x = max(0, min(text_x, width - text_width))

    # Center vertically in the border
    text_y = height + (border_height - text_height) // 2

    # Draw the timestamp
    draw.text((text_x, text_y), text, fill=font_color, font=font)

    return new_image


def overlay_frame_number(
        images: List[Image.Image],
        video_frames_times: List[float],
        border_height: int = 28,  # this is due to patch size of 28
        temporal_path_size: int = 2,  # Number of positions to cycle through
        font_size: int = 20,
        font_color: str = "white",
    ) -> List[Image.Image]:
        """
        Overlay text on a list of PIL images with black border.
        The timestamp position cycles through available positions.

        Args:
            images: List of PIL images to process
            fps: Frames per second
            border_height: Height of the black border in pixels (default: 28)
            temporal_path_size: Number of positions to cycle through (default: 2)
            font_size: Font size for the text (default: 20)
            font_color: Color of the text (default: "white")

        Returns:
            List of PIL images with text overlay
            List of timestamps
        """

        # Try to use DejaVu Sans Mono font for better readability
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", font_size)

        # Process each image
        processed_images = []

        for i, image in enumerate(images):
            # Get original dimensions
            width, height = image.size

            # Create new image with black border at the bottom
            new_height = height + border_height
            new_image = Image.new("RGB", (width, new_height), color="black")

            # Paste original image at the top
            new_image.paste(image, (0, 0))

            # Draw text on the black border
            draw = ImageDraw.Draw(new_image)

            # Calculate timestamp for current frame
            text = f"{float(video_frames_times[i])-float(video_frames_times[0]):.2f}s"

            # Get text dimensions
            try:
                # Get text bounding box
                bbox = draw.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
            except AttributeError:
                # Fallback for older PIL versions
                text_width, text_height = draw.textsize(text, font=font)

            # Define available positions (cycling through horizontal positions)
            position_idx = i % temporal_path_size
            section_width = width // temporal_path_size

            # Calculate x position based on cycling position
            section_center_x = position_idx * section_width + section_width // 2
            text_x = section_center_x - text_width // 2

            # Ensure text doesn't go outside bounds
            text_x = max(0, min(text_x, width - text_width))

            # Center vertically in the border
            text_y = height + (border_height - text_height) // 2

            # Draw the single timestamp
            draw.text((text_x, text_y), text, fill=font_color, font=font)

            processed_images.append(new_image)

        return processed_images


class FrameJPEGTensorGenerator:

    def __init__(self, debug_save_frames: bool = False, debug_output_dir: str = "/tmp/vss_debug_frames") -> None:
        self._initialized = True
        self._debug_save_frames = debug_save_frames
        self._debug_output_dir = debug_output_dir
        if debug_save_frames:
            logger.info(f"Debug mode enabled: will save frames to {debug_output_dir}")

    def get_embeddings(self, frames_: list, video_frames_times: List[List[float]] = None):
        embeds = []
            
        with TimeMeasure("Frame JPEG to tensor with overlay"):
            for i, frames in enumerate(frames_):
                # Apply frame overlay if video_frames_times is provided
                if video_frames_times and i < len(video_frames_times):
                    logger.debug(f"Applying frame overlays for chunk {i} with {len(video_frames_times[i])} frame times")
                    overlaid_frames = []
                    for j, frame_buffer in enumerate(frames):
                        if j < len(video_frames_times[i]):
                            # Calculate relative timestamp (from start of video)
                            relative_timestamp = (
                                float(video_frames_times[i][j]) - float(video_frames_times[i][0])
                                if len(video_frames_times[i]) > 0 
                                else float(video_frames_times[i][j])
                            )
                            logger.debug(f"Applying overlay to frame {j} with timestamp {relative_timestamp:.2f}s")
                            overlaid_frame = overlay_frame_number_on_jpeg_buffer(
                                frame_buffer,
                                relative_timestamp,
                                j % 2  # Cycle through 2 positions
                            )
                            overlaid_frames.append(overlaid_frame)
                            
                            # Debug mode: Save key frames (1st, 5th, last) per chunk for visual verification
                            # Enable with VSS_DEBUG_FRAME_OVERLAY=true environment variable
                            if self._debug_save_frames and (j == 0 or j == 4 or j == len(frames) - 1):
                                import os
                                os.makedirs(self._debug_output_dir, exist_ok=True)
                                
                                # Create simple filename with chunk info for consistency
                                timestamp_str = f"{relative_timestamp:.2f}s".replace('.', 'p')
                                
                                # Save original and overlaid versions
                                original_path = os.path.join(self._debug_output_dir, f"openai_c{i:02d}_frame_{j:02d}_original.jpg")
                                overlaid_path = os.path.join(self._debug_output_dir, f"openai_c{i:02d}_frame_{j:02d}_overlaid_{timestamp_str}.jpg")
                                
                                # Only save if file doesn't exist (avoid duplicates from multiple calls)
                                if not os.path.exists(original_path):
                                    with open(original_path, 'wb') as f:
                                        f.write(frame_buffer.tobytes())
                                if not os.path.exists(overlaid_path):
                                    with open(overlaid_path, 'wb') as f:
                                        f.write(overlaid_frame.tobytes())
                                    logger.debug(f"Debug: Saved OpenAI key frame {j} at {relative_timestamp:.2f}s")
                        else:
                            overlaid_frames.append(frame_buffer)
                    logger.debug(f"len of frames after overlay  {len(overlaid_frames)}")
                    embeds.append(save_jpeg_buffers_as_single_tensor(overlaid_frames))
                else:
                    logger.debug(f"len of frames  {len(frames)} (no frame times provided)")
                    embeds.append(save_jpeg_buffers_as_single_tensor(frames))
        return embeds


if __name__ == "__main__":
    # To test and debug, please use harness:
    # PYTHONPATH=src pytest tests/model/gpt4/test_gpt4v_jpeg_tensor_gen.py -s
    pass
