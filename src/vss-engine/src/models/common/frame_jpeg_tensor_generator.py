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
    timestamp: float,
    position_idx: int,
    border_height: int = 28,
    temporal_path_size: int = 2,
    font_size: int = 20,
    font_color: str = "white",
) -> np.ndarray:
    """Apply frame number overlay directly on JPEG buffer with minimal overhead"""
    try:
        # Convert JPEG buffer to PIL Image
        pil_image = jpeg_buffer_to_pil_image(jpeg_buffer)
        
        # Apply overlay using the existing logic
        overlaid_image = overlay_frame_number(
            [pil_image], [timestamp], border_height, temporal_path_size, font_size, font_color
        )[0]
        
        # Convert back to JPEG buffer
        return pil_image_to_jpeg_buffer(overlaid_image)
    except Exception as e:
        logger.warning(f"Failed to apply overlay on frame: {e}")
        return jpeg_buffer  # Return original buffer if overlay fails


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
        
        # Debug: Save frames for visualization if debug mode is enabled
        if self._debug_save_frames:
            save_overlaid_frames_for_debugging(frames_, video_frames_times, self._debug_output_dir)
            
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
                        else:
                            overlaid_frames.append(frame_buffer)
                    logger.debug(f"len of frames after overlay  {len(overlaid_frames)}")
                    embeds.append(save_jpeg_buffers_as_single_tensor(overlaid_frames))
                else:
                    logger.debug(f"len of frames  {len(frames)} (no frame times provided)")
                    embeds.append(save_jpeg_buffers_as_single_tensor(frames))
        return embeds


def save_overlaid_frames_for_debugging(frames_: list, video_frames_times: List[List[float]] = None, output_dir: str = "/tmp/vss_debug_frames"):
    """Save overlaid frames as images for visual debugging"""
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    logger.info(f"Saving debug frames to {output_dir}")
    
    for i, frames in enumerate(frames_):
        chunk_dir = os.path.join(output_dir, f"chunk_{i}")
        os.makedirs(chunk_dir, exist_ok=True)
        
        for j, frame_buffer in enumerate(frames):
            # Save original frame
            original_path = os.path.join(chunk_dir, f"frame_{j:03d}_original.jpg")
            with open(original_path, 'wb') as f:
                f.write(frame_buffer.tobytes())
            
            # Apply overlay if frame times provided
            if video_frames_times and i < len(video_frames_times) and j < len(video_frames_times[i]):
                relative_timestamp = (
                    float(video_frames_times[i][j]) - float(video_frames_times[i][0])
                    if len(video_frames_times[i]) > 0
                    else float(video_frames_times[i][j])
                )
                
                overlaid_frame = overlay_frame_number_on_jpeg_buffer(
                    frame_buffer,
                    relative_timestamp,
                    j % 2  # Cycle through 2 positions
                )
                
                # Save overlaid frame
                overlaid_path = os.path.join(chunk_dir, f"frame_{j:03d}_overlaid.jpg")
                with open(overlaid_path, 'wb') as f:
                    f.write(overlaid_frame.tobytes())
                    
                logger.info(f"Saved frame {j} for chunk {i}: original and overlaid (timestamp: {relative_timestamp:.2f}s)")
            else:
                logger.info(f"Saved frame {j} for chunk {i}: original only (no frame times provided)")


def test_overlay_functionality():
    """Test function to verify overlay functionality with sample data"""
    logger.info("Testing overlay functionality...")
    
    # Create a simple test image as JPEG buffer
    test_image = Image.new('RGB', (640, 480), color='blue')
    buffer = io.BytesIO()
    test_image.save(buffer, format='JPEG', quality=95)
    test_jpeg_buffer = np.frombuffer(buffer.getvalue(), dtype=np.uint8)
    
    # Test with sample frame times
    sample_frames = [[test_jpeg_buffer] * 3]  # 3 frames in one chunk
    sample_frame_times = [[0.0, 2.5, 5.0]]   # timestamps in seconds
    
    # Save for visual inspection
    save_overlaid_frames_for_debugging(sample_frames, sample_frame_times)
    
    # Test the embedding generation with overlay
    generator = FrameJPEGTensorGenerator()
    embeddings = generator.get_embeddings(sample_frames, sample_frame_times)
    
    logger.info(f"Generated {len(embeddings)} embeddings with overlays")
    logger.info(f"Embedding shape: {embeddings[0].shape if embeddings else 'None'}")
    
    return embeddings


def create_visualization_grid(frames_: list, video_frames_times: List[List[float]] = None, output_path: str = "/tmp/vss_overlay_grid.jpg"):
    """Create a grid visualization showing original vs overlaid frames"""
    from PIL import Image
    import math
    
    all_images = []
    labels = []
    
    for i, frames in enumerate(frames_):
        for j, frame_buffer in enumerate(frames[:6]):  # Limit to 6 frames per chunk for visualization
            # Original frame
            original_img = jpeg_buffer_to_pil_image(frame_buffer)
            all_images.append(original_img)
            labels.append(f"Chunk {i} Frame {j} (Original)")
            
            # Overlaid frame if frame times available
            if video_frames_times and i < len(video_frames_times) and j < len(video_frames_times[i]):
                relative_timestamp = (
                    float(video_frames_times[i][j]) - float(video_frames_times[i][0])
                    if len(video_frames_times[i]) > 0
                    else float(video_frames_times[i][j])
                )
                
                overlaid_buffer = overlay_frame_number_on_jpeg_buffer(
                    frame_buffer, relative_timestamp, j % 2
                )
                overlaid_img = jpeg_buffer_to_pil_image(overlaid_buffer)
                all_images.append(overlaid_img)
                labels.append(f"Chunk {i} Frame {j} (Overlay {relative_timestamp:.2f}s)")
    
    if not all_images:
        logger.warning("No images to create grid")
        return
    
    # Calculate grid dimensions
    cols = min(4, len(all_images))
    rows = math.ceil(len(all_images) / cols)
    
    # Resize images to consistent size
    img_width, img_height = 320, 240
    resized_images = [img.resize((img_width, img_height)) for img in all_images]
    
    # Create grid
    grid_width = cols * img_width
    grid_height = rows * img_height + 30 * rows  # Extra space for labels
    grid_img = Image.new('RGB', (grid_width, grid_height), color='white')
    
    # Paste images into grid
    for idx, (img, label) in enumerate(zip(resized_images, labels)):
        row = idx // cols
        col = idx % cols
        x = col * img_width
        y = row * (img_height + 30)
        
        grid_img.paste(img, (x, y))
        
        # Add label (simple text overlay)
        try:
            draw = ImageDraw.Draw(grid_img)
            font = ImageFont.load_default()
            draw.text((x + 5, y + img_height + 5), label, fill='black', font=font)
        except Exception as e:
            logger.debug(f"Could not add text label: {e}")
    
    # Save grid
    grid_img.save(output_path, quality=95)
    logger.info(f"Visualization grid saved to {output_path}")
    return output_path


if __name__ == "__main__":
    # To test and debug, please use harness:
    # PYTHONPATH=src pytest tests/model/gpt4/test_gpt4v_jpeg_tensor_gen.py -s
    # Please add new test case for each bug
    
    # Uncomment below to run overlay tests
    # test_overlay_functionality()
    pass
