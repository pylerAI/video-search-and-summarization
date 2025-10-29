# VILA 1.5 Server - User Guide

## 🚀 Quick Start

Your VILA 1.5 server is now running:
- **Server URL**: `http://localhost:8000` 
- **Model**: vila-1.5 with TensorRT optimization
- **Batch Size**: Optimized at 1 for stability

## 📋 Table of Contents
1. [Server Status & Health](#server-status--health)
2. [Basic API Usage](#basic-api-usage)
3. [Multimodal Requests (Text + Images)](#multimodal-requests-text--images)
4. [Text-Only Requests](#text-only-requests)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
7. [VSS Integration](#vss-integration)

---

## 🏥 Server Status & Health

### Check Server Health
```bash
# Check server status
curl http://localhost:8000/health

# Expected response: {"status":"healthy","model":"vila-1.5"}
```

### Monitor GPU Usage
```bash
# Real-time GPU monitoring
watch -n 1 nvidia-smi

# Check memory usage
nvidia-smi --query-gpu=memory.used,memory.total --format=csv
```

---

## 🔧 Basic API Usage

The servers provide OpenAI-compatible chat completion endpoints:

### Base URL Structure
```
VILA Server: POST http://localhost:8000/v1/chat/completions
```

### Required Headers
```bash
Content-Type: application/json
```

---

## 🖼️ Multimodal Requests (Text + Images)

### Python Example
```python
import requests
import base64

# Encode image to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Send multimodal request
def analyze_image(image_path, question="What do you see in this image?"):
    base64_image = encode_image(image_path)
    
    response = requests.post("http://localhost:8000/v1/chat/completions", 
        json={
            "model": "vila-1.5",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": question
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        }
    )
    
    return response.json()

# Usage
result = analyze_image("your_image.jpg", "Describe this image in detail")
print(result['choices'][0]['message']['content'])
```

### cURL Example
```bash
# Convert image to base64
IMAGE_BASE64=$(base64 -i your_image.jpg)

# Send request
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vila-1.5",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What do you see in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/jpeg;base64,'$IMAGE_BASE64'"
            }
          }
        ]
      }
    ],
    "temperature": 0.7,
    "max_tokens": 1000
  }'
```

---

## 💬 Text-Only Requests

### Python Example
```python
import requests

def ask_question(question):
    response = requests.post("http://localhost:8000/v1/chat/completions",
        json={
            "model": "vila-1.5",
            "messages": [
                {
                    "role": "user", 
                    "content": question
                }
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }
    )
    
    return response.json()['choices'][0]['message']['content']

# Usage
answer = ask_question("Explain quantum computing in simple terms")
print(answer)
```

### cURL Example
```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vila-1.5",
    "messages": [
      {
        "role": "user",
        "content": "What is artificial intelligence?"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 500
  }'
```

---

## 🔄 Multiple Requests

### Sequential Requests
```python
import requests
import time

def send_multiple_requests(questions):
    results = []
    server_url = "http://localhost:8000/v1/chat/completions"
    
    for i, question in enumerate(questions):
        print(f"Processing request {i+1}/{len(questions)}")
        
        response = requests.post(server_url, json={
            "model": "vila-1.5",
            "messages": [{"role": "user", "content": question}],
            "temperature": 0.7,
            "max_tokens": 500
        })
        
        if response.status_code == 200:
            results.append(response.json()['choices'][0]['message']['content'])
        else:
            results.append(f"Error: {response.status_code}")
            
        # Small delay between requests for stability
        time.sleep(0.1)
    
    return results

# Usage
questions = [
    "What is machine learning?",
    "Explain neural networks",
    "What are transformers in AI?"
]
answers = send_multiple_requests(questions)
```

---

## ⚡ Performance Optimization

### Best Practices

1. **Batch Size Configuration**
   ```bash
   # Server is configured with optimal batch size
   --vlm-batch-size 1  # Prevents TensorRT memory errors
   ```

2. **Request Optimization**
   ```python
   # Optimize request parameters for best performance
   optimal_config = {
       "model": "vila-1.5",
       "temperature": 0.7,      # Balance creativity/consistency
       "max_tokens": 1000,      # Adjust based on needs
       "top_p": 0.9,           # Nucleus sampling
       "frequency_penalty": 0   # Repetition control
   }
   
   # Example usage
   response = requests.post("http://localhost:8000/v1/chat/completions", 
       json={
           **optimal_config,
           "messages": [{"role": "user", "content": "Your question here"}]
       }
   )
   ```

3. **Memory Management**
   ```python
   # For processing many images, clear memory between requests
   import gc
   import torch
   
   def process_images_efficiently(image_paths):
       results = []
       for img_path in image_paths:
           result = analyze_image(img_path)
           results.append(result)
           
           # Clean up memory periodically
           if len(results) % 10 == 0:
               gc.collect()
               if torch.cuda.is_available():
                   torch.cuda.empty_cache()
       
       return results
   ```

---

## 🔍 Monitoring & Troubleshooting

### Server Logs
```bash
# Check server logs (if running in background)
tail -f nohup.out

# Check for specific errors
grep -i "error\|failed" nohup.out
```

### GPU Memory Monitoring
```bash
# Monitor GPU memory usage
watch -n 1 'nvidia-smi --query-gpu=index,memory.used,memory.total,utilization.gpu --format=csv'

# Expected healthy state:
# GPU 0: ~103GB/179GB used
# GPU 1: ~103GB/179GB used
```

### Common Issues & Solutions

1. **TensorRT Session Failures**
   ```bash
   # Restart affected server
   pkill -f "python3 server.py"
   
   # Restart server
   cd /workspace/vss/vlm_deploy/vila15
   source /workspace/setup_env.sh
   nohup python3 server.py --port 8000 --vlm-batch-size 1 &
   ```

2. **High Memory Usage**
   ```bash
   # Check process memory usage
   ps aux | grep python3 | grep server.py
   
   # Monitor CUDA memory
   nvidia-smi --query-gpu=memory.used --format=csv --loop=1
   ```

3. **Server Not Responding**
   ```bash
   # Test server connectivity
   curl -f http://localhost:8000/health || echo "Server is down"
   
   # Check server logs
   tail -f nohup.out
   ```

---

## 🎬 VSS Integration

### VSS Engine Integration
```bash
# Set VSS to use your VILA server
export VIA_VLM_ENDPOINT=http://localhost:8000/v1/chat/completions
export VIA_VLM_API_KEY=fake-key

# Test VSS simulation
python3 test_vss_engine_simulation.py
```

### Video Analysis Example
```python
import cv2
import base64
import requests
from io import BytesIO
from PIL import Image

def analyze_video_frame(frame, question="What security concerns do you see?"):
    """Analyze a video frame using VILA server"""
    
    # Convert OpenCV frame to PIL Image
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(frame_rgb)
    
    # Encode to base64
    buffer = BytesIO()
    pil_image.save(buffer, format='JPEG', quality=85)
    base64_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    # Send to VILA server
    response = requests.post("http://localhost:8000/v1/chat/completions",
        json={
            "model": "vila-1.5",
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "text", "text": question},
                    {"type": "image_url", "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }}
                ]
            }],
            "temperature": 0.3,  # Lower for consistent security analysis
            "max_tokens": 800
        }
    )
    
    return response.json()['choices'][0]['message']['content']

# Usage with video stream
cap = cv2.VideoCapture("rtsp://your-camera-stream")
ret, frame = cap.read()
if ret:
    analysis = analyze_video_frame(frame, "Analyze this security footage for any suspicious activity")
    print(analysis)
```

---

## 📊 API Documentation

### Interactive API Docs
Visit the FastAPI documentation for detailed API schemas:
- **Server**: http://localhost:8000/docs

### Response Format
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion", 
  "created": 1730073600,
  "model": "vila-1.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Response text here..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 150,
    "total_tokens": 175
  }
}
```

---

## 🔐 Security & Production Notes

1. **Network Security**: Servers currently bind to localhost only
2. **Authentication**: No authentication implemented (add reverse proxy for production)
3. **Rate Limiting**: No built-in rate limiting (implement upstream)
4. **HTTPS**: HTTP only (add TLS termination for production)

---

## 🎯 Quick Reference Commands

```bash
# Start server
cd /workspace/vss/vlm_deploy/vila15
source /workspace/setup_env.sh
nohup python3 server.py --port 8000 --vlm-batch-size 1 &

# Monitor GPU
watch nvidia-smi

# Health check
curl http://localhost:8000/health

# Test basic functionality
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "vila-1.5", "messages": [{"role": "user", "content": "Hello!"}]}'
```

---

## 📞 Support

For issues or questions:
1. Check server logs: `tail -f nohup.out`
2. Monitor GPU status: `nvidia-smi`
3. Test individual servers: `curl http://localhost:8000/health`
4. Review this guide and try the examples provided

Your VILA server is ready for production workloads! 🚀