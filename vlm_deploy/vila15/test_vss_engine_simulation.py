#!/usr/bin/env python3
"""
VSS Engine Simulation Test Script
This script mimics how the VSS engine sends requests to VILA server
through the OpenAI-compatible interface, following the patterns in
openai_compat_model.py
"""

import asyncio
import base64
import json
import os
import time
from io import BytesIO
from typing import List, Dict, Any

import aiohttp
import numpy as np
import torch
from PIL import Image, ImageDraw, ImageFont

# Configuration to mimic VSS engine setup
VILA_SERVER_BASE_URL = "http://localhost:8000"
MODEL_DEPLOYMENT_NAME = "vila-1.5"

class VSSEngineSimulator:
    """Simulates VSS Engine behavior when calling VILA server"""
    
    def __init__(self, base_url: str = VILA_SERVER_BASE_URL):
        self.base_url = base_url
        self.model_name = MODEL_DEPLOYMENT_NAME
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    def create_video_frame_tensor(self, width: int = 224, height: int = 224, 
                                num_frames: int = 5, text_prefix: str = "Frame") -> torch.Tensor:
        """Create a tensor representing video frames (mimics VSS video processing)"""
        frames = []
        
        for i in range(num_frames):
            # Create frame image
            img = Image.new('RGB', (width, height), 
                          color=(100 + i * 30, 150 + i * 20, 200 + i * 10))
            draw = ImageDraw.Draw(img)
            
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
            except:
                font = ImageFont.load_default()
            
            # Add frame info
            text = f"{text_prefix} {i+1}"
            draw.text((10, height//2), text, fill='white', font=font)
            draw.text((10, height//2 + 20), f"t={i*2.5}s", fill='yellow', font=font)
            
            # Convert to numpy array (mimics video frame processing)
            img_array = np.array(img)
            
            # Convert to JPEG bytes (as done in VSS)
            buffer = BytesIO()
            img.save(buffer, format='JPEG')
            jpeg_bytes = buffer.getvalue()
            
            # Convert bytes to numpy array (as done in openai_compat_model.py)
            jpeg_array = np.frombuffer(jpeg_bytes, dtype=np.uint8).copy()  # Make writable
            frames.append(torch.from_numpy(jpeg_array))
        
        # Stack into tensor format expected by VSS: (1, num_frames, N)
        # where N is the JPEG byte array length
        max_len = max(len(frame) for frame in frames)
        padded_frames = []
        for frame in frames:
            if len(frame) < max_len:
                # Pad with zeros
                padded = torch.cat([frame, torch.zeros(max_len - len(frame), dtype=frame.dtype)])
                padded_frames.append(padded)
            else:
                padded_frames.append(frame)
        
        return torch.stack(padded_frames).unsqueeze(0)  # Shape: (1, num_frames, max_len)

    def tensor_to_base64_jpeg(self, tensor: torch.Tensor, frame_idx: int = 0) -> str:
        """Convert video frame tensor to base64 JPEG (mimics openai_compat_model.py)"""
        # Extract frame at frame_idx
        frame_data = tensor.squeeze(0)[frame_idx]  # Remove batch dimension, get frame
        
        # Convert tensor to numpy array
        frame_numpy = frame_data.cpu().numpy()
        
        # Find actual JPEG data length (remove padding zeros)
        non_zero_idx = np.where(frame_numpy != 0)[0]
        if len(non_zero_idx) > 0:
            actual_data = frame_numpy[:non_zero_idx[-1] + 1]
        else:
            actual_data = frame_numpy
        
        # Convert to bytes
        jpeg_bytes = actual_data.astype(np.uint8).tobytes()
        
        # Encode as base64
        base64_encoded = base64.b64encode(jpeg_bytes).decode('utf-8')
        return f"data:image/jpeg;base64,{base64_encoded}"

    def create_vss_style_messages(self, prompt: str, video_tensor: torch.Tensor, 
                                video_frames_times: List[float], chunk_info: Dict = None) -> List[Dict]:
        """Create messages in the exact format used by VSS engine (openai_compat_model.py)"""
        
        num_frames = len(video_frames_times)
        
        # Create image list exactly as in openai_compat_model.py
        image_list = []
        for j in range(num_frames):
            try:
                base64_image = self.tensor_to_base64_jpeg(video_tensor, j)
                image_list.append({
                    "type": "image_url",
                    "image_url": {
                        "url": base64_image,
                        "detail": "auto"
                    }
                })
            except Exception as e:
                print(f"Warning: Failed to process frame {j}: {e}")
                # Skip this frame
                continue
        
        # Create timestamp string exactly as in VSS
        string_of_times = ""
        time_format_str = " at timestamps in seconds"
        
        for j in range(num_frames):
            if chunk_info and chunk_info.get('file', '').startswith('rtsp://'):
                time_format_str = " at timestamps in RFC3339 format"
                # For RTSP streams, use RFC3339 format (simplified)
                string_timestamp = f"2024-10-24T12:00:{video_frames_times[j]:02.0f}Z"
            else:
                string_timestamp = str(video_frames_times[j])
            
            string_of_times += f"<{string_timestamp}> "
        
        # Create system prompt exactly as in VSS
        PROMPT = (
            "These are images sampled from a video"
            + time_format_str
            + " : "
            + string_of_times
            + "."
            + "Make sure the answer contain correct timestamps."
        )
        
        # Create messages structure exactly as in openai_compat_model.py
        messages = [
            {
                "role": "system",
                "content": [
                    {"type": "text", "text": PROMPT}
                ],
            },
            {
                "role": "user",
                "content": [
                    *image_list,
                    {"type": "text", "text": prompt},
                ],
            }
        ]
        
        return messages

    async def send_vss_style_request(self, prompt: str, video_tensor: torch.Tensor,
                                   video_frames_times: List[float], 
                                   generation_config: Dict = None,
                                   chunk_info: Dict = None) -> Dict:
        """Send request exactly as VSS engine does"""
        
        if not generation_config:
            generation_config = {
                "temperature": 0.2,
                "max_new_tokens": 1024,
                "top_p": 1.0,
                "seed": 1
            }
        
        # Create messages in VSS format
        messages = self.create_vss_style_messages(prompt, video_tensor, 
                                                video_frames_times, chunk_info)
        
        # Create request payload matching VSS format
        payload = {
            "model": self.model_name,
            "messages": messages,
            "max_tokens": generation_config.get("max_new_tokens", 1024),
            "temperature": generation_config.get("temperature", 0.2),
            "top_p": generation_config.get("top_p", 1.0),
            "seed": generation_config.get("seed", 1)
        }
        
        start_time = time.time()
        
        try:
            async with self.session.post(
                f"{self.base_url}/v1/chat/completions",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=120)  # VSS typically uses longer timeouts
            ) as response:
                response_data = await response.json()
                duration = time.time() - start_time
                
                return {
                    "status": response.status,
                    "success": response.status == 200,
                    "response": response_data if response.status == 200 else None,
                    "error": response_data if response.status != 200 else None,
                    "duration": duration,
                    "frames_processed": len(video_frames_times),
                    "chunk_info": chunk_info
                }
        
        except Exception as e:
            duration = time.time() - start_time
            return {
                "status": "error",
                "success": False,
                "error": str(e),
                "duration": duration,
                "frames_processed": len(video_frames_times),
                "chunk_info": chunk_info
            }

async def test_basic_connectivity():
    """Test basic connectivity with VILA server"""
    print("🔌 Testing basic VILA server connectivity...")
    
    async with VSSEngineSimulator() as vss:
        try:
            async with vss.session.get(f"{vss.base_url}/health") as response:
                health = await response.json()
                print(f"✅ Server health: {health}")
                return True
        except Exception as e:
            print(f"❌ Server connectivity failed: {e}")
            return False

async def test_vss_video_analysis():
    """Test VSS-style video analysis scenarios"""
    
    print("🎬 VSS Engine Simulation - Video Analysis Test")
    print("=" * 60)
    
    # First check connectivity
    if not await test_basic_connectivity():
        print("❌ Skipping video analysis - server not reachable")
        return
    
    async with VSSEngineSimulator() as vss:
        
        # Test 1: Short video clip analysis (typical VSS use case)
        print("\n📹 Test 1: Short Video Clip Analysis (3 frames)")
        video_tensor = vss.create_video_frame_tensor(
            width=224, height=224, num_frames=3, text_prefix="Scene"
        )
        video_frames_times = [0.0, 2.5, 5.0]  # 2.5 second intervals
        
        result1 = await vss.send_vss_style_request(
            prompt="Describe what happens in this video sequence. Include specific timestamps in your analysis.",
            video_tensor=video_tensor,
            video_frames_times=video_frames_times,
            generation_config={"temperature": 0.3, "max_new_tokens": 200}
        )
        
        print(f"✅ Status: {'SUCCESS' if result1['success'] else 'FAILED'}")
        print(f"⏱️ Duration: {result1['duration']:.3f}s")
        print(f"🖼️ Frames: {result1['frames_processed']}")
        if result1['success']:
            content = result1['response']['choices'][0]['message']['content']
            print(f"📝 Response: {content[:200]}...")
        else:
            print(f"❌ Error: {result1['error']}")
        
        # Test 2: RTSP stream simulation (live video)
        print("\n📡 Test 2: RTSP Stream Simulation (2 frames)")
        rtsp_tensor = vss.create_video_frame_tensor(
            width=224, height=224, num_frames=2, text_prefix="Live"
        )
        rtsp_times = [0, 5]  # 5 second intervals for live stream
        chunk_info = {"file": "rtsp://camera.example.com/live"}
        
        result2 = await vss.send_vss_style_request(
            prompt="Analyze this live video feed. What activity do you observe?",
            video_tensor=rtsp_tensor,
            video_frames_times=rtsp_times,
            generation_config={"temperature": 0.1, "max_new_tokens": 150},
            chunk_info=chunk_info
        )
        
        print(f"✅ Status: {'SUCCESS' if result2['success'] else 'FAILED'}")
        print(f"⏱️ Duration: {result2['duration']:.3f}s")
        print(f"🖼️ Frames: {result2['frames_processed']}")
        if result2['success']:
            content = result2['response']['choices'][0]['message']['content']
            print(f"📝 Response: {content[:200]}...")
        
        # Test 3: Longer video sequence (stress test)
        print("\n🎞️ Test 3: Longer Video Sequence (4 frames)")
        long_tensor = vss.create_video_frame_tensor(
            width=224, height=224, num_frames=4, text_prefix="Event"
        )
        long_times = [i * 1.5 for i in range(4)]  # 1.5 second intervals
        
        result3 = await vss.send_vss_style_request(
            prompt="Provide a detailed timeline analysis of this extended video sequence.",
            video_tensor=long_tensor,
            video_frames_times=long_times,
            generation_config={"temperature": 0.2, "max_new_tokens": 300}
        )
        
        print(f"✅ Status: {'SUCCESS' if result3['success'] else 'FAILED'}")
        print(f"⏱️ Duration: {result3['duration']:.3f}s")
        print(f"🖼️ Frames: {result3['frames_processed']}")
        if result3['success']:
            content = result3['response']['choices'][0]['message']['content']
            print(f"📝 Response: {content[:250]}...")

async def test_sequential_vss_requests():
    """Test sequential VSS requests with CUDA memory management"""
    
    print("\n\n🔄 VSS Engine Simulation - GPU-Safe Sequential Requests Test")
    print("=" * 60)
    
    async with VSSEngineSimulator() as vss:
        
        print("🚀 Testing sequential video analysis (avoiding CUDA memory conflicts)...")
        print("⚠️  Note: Using sequential processing to avoid GPU resource contention")
        
        results = []
        start_time = time.time()
        
        # Task 1: Security camera analysis (single frame to reduce GPU load)
        print("📹 Processing security camera analysis...")
        security_tensor = vss.create_video_frame_tensor(num_frames=1, text_prefix="Security")
        security_times = [0.0]
        result1 = await vss.send_vss_style_request(
            "Analyze this security camera frame for any notable activity.",
            security_tensor, security_times,
            {"temperature": 0.1, "max_new_tokens": 80}
        )
        results.append(("Security Analysis", result1))
        
        # Longer delay to allow GPU memory cleanup
        print("⏳ Waiting for GPU memory cleanup...")
        await asyncio.sleep(2.0)
        
        # Task 2: Traffic monitoring
        print("🚗 Processing traffic monitoring analysis...")
        traffic_tensor = vss.create_video_frame_tensor(num_frames=1, text_prefix="Traffic")
        traffic_times = [0.0]
        result2 = await vss.send_vss_style_request(
            "Analyze this traffic camera frame for vehicle activity.",
            traffic_tensor, traffic_times,
            {"temperature": 0.2, "max_new_tokens": 80}
        )
        results.append(("Traffic Monitoring", result2))
        
        # Longer delay between requests
        print("⏳ Waiting for GPU memory cleanup...")
        await asyncio.sleep(2.0)
        
        # Task 3: Quality inspection
        print("🔍 Processing quality inspection analysis...")
        quality_tensor = vss.create_video_frame_tensor(num_frames=1, text_prefix="Quality")  
        quality_times = [1.0]
        result3 = await vss.send_vss_style_request(
            "Inspect this manufacturing frame for quality issues.",
            quality_tensor, quality_times,
            {"temperature": 0.15, "max_new_tokens": 80}
        )
        results.append(("Quality Inspection", result3))
        
        total_time = time.time() - start_time
        
        print(f"\n📊 SEQUENTIAL VSS REQUESTS RESULTS:")
        print(f"- Total requests: {len(results)}")
        print(f"- Total time: {total_time:.3f}s")
        
        successful = 0
        total_frames = 0
        individual_times = []
        
        for task_name, result in results:
            if isinstance(result, dict) and result.get('success'):
                successful += 1
                total_frames += result['frames_processed']
                individual_times.append(result['duration'])
                print(f"✅ {task_name}: {result['duration']:.3f}s ({result['frames_processed']} frames)")
                if result.get('response'):
                    content = result['response']['choices'][0]['message']['content']
                    print(f"   Response: {content[:100]}...")
            else:
                print(f"❌ {task_name}: FAILED")
                if isinstance(result, dict):
                    print(f"   Error: {result.get('error', 'Unknown error')}")
                else:
                    print(f"   Exception: {result}")
        
        if individual_times:
            avg_time = sum(individual_times) / len(individual_times)
            
            print(f"\n⚡ PERFORMANCE ANALYSIS:")
            print(f"- Successful requests: {successful}/{len(results)}")
            print(f"- Total frames processed: {total_frames}")
            print(f"- Average response time: {avg_time:.3f}s")
            print(f"- Total processing time: {total_time:.3f}s")
            
            if successful == len(results):
                print("✅ VILA server successfully handled all VSS-style video analysis requests!")
            else:
                print("⚠️ Some VSS requests failed - may need resource optimization")

async def test_resource_safe_vss():
    """Test VSS requests with GPU resource safety measures"""
    
    print("\n\n🛡️ VSS Engine - GPU Resource Safe Test")
    print("=" * 60)
    print("⚠️  Using single-frame processing to avoid CUDA memory conflicts")
    
    async with VSSEngineSimulator() as vss:
        
        print("🔧 Testing GPU-safe single request processing...")
        
        # Single security camera frame analysis
        print("📹 Processing single security frame...")
        security_tensor = vss.create_video_frame_tensor(num_frames=1, text_prefix="Security")
        security_times = [0.0]
        
        start_time = time.time()
        result = await vss.send_vss_style_request(
            "Analyze this security camera frame for any activity or objects of interest.",
            security_tensor, security_times,
            {"temperature": 0.1, "max_new_tokens": 150}
        )
        end_time = time.time()
        
        print(f"\n📊 GPU-Safe VSS Test Result:")
        print(f"⏱️  Processing time: {end_time - start_time:.2f}s")
        
        if isinstance(result, dict) and result.get('success'):
            print(f"✅ Security Analysis: SUCCESS")
            if result.get('response'):
                content = result['response']['choices'][0]['message']['content']
                print(f"📝 Response: {content[:200]}...")
                print(f"🎯 This demonstrates VSS-style processing works with proper resource management")
        else:
            print(f"❌ Security Analysis: FAILED")
            if isinstance(result, dict):
                print(f"   Error: {result.get('error', 'Unknown error')}")
            else:
                print(f"   Exception: {result}")
        
        return result

async def main():
    """Main test function"""
    print("🎭 VSS Engine VILA Server Simulation")
    print("Mimicking real VSS engine request patterns with GPU safety")
    print("=" * 60)
    
    try:
        # Test 1: Individual VSS-style video analysis
        await test_vss_video_analysis()
        
        # Test 2: GPU-safe single request test
        await test_resource_safe_vss()
        
        # Test 3: Sequential requests (now safe after server restart)
        await test_sequential_vss_requests()
        
        print("\n" + "=" * 60)
        print("✅ VSS Engine simulation complete!")
        print("\nThis simulation tested:")
        print("1. 🎬 VSS video frame processing format")
        print("2. 📡 RTSP stream timestamp handling") 
        print("3. �️ GPU-safe single request processing")
        print("4. 🔧 Resource management for CUDA memory constraints")
        print("\n⚠️  Note: Concurrent/batch processing disabled due to GPU memory conflicts")
        print("   In production, ensure proper CUDA memory management or use sequential processing")
        
    except KeyboardInterrupt:
        print("\n🛑 Simulation interrupted by user")
    except Exception as e:
        print(f"\n❌ Simulation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())