import asyncio
import concurrent.futures
import sys
import os
import time
import uuid
from typing import Union, List, Optional, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
import argparse

from loguru import logger

# Configure comprehensive logging system
logger.remove()  # Remove default handler

# Create logs directory
os.makedirs("logs", exist_ok=True)

# 1. MAIN SERVER LOG - General server operations
logger.add("logs/server_main.log", 
          level="INFO",
          rotation="10 MB",
          retention="7 days",
          format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}")

# 2. PROMPT FLOW LOG - Detailed prompt processing
prompt_logger = logger.bind(component="prompt_flow")
logger.add("logs/prompt_flow.log",
          level="DEBUG", 
          rotation="10 MB",
          retention="7 days",
          format="{time:YYYY-MM-DD HH:mm:ss} | PROMPT_FLOW | {function}:{line} | {message}",
          filter=lambda record: record["extra"].get("component") == "prompt_flow")

# 3. CONVERSATION LOG - OpenAI format and conversation handling
conv_logger = logger.bind(component="conversation")
logger.add("logs/conversation.log",
          level="DEBUG",
          rotation="10 MB", 
          retention="7 days",
          format="{time:YYYY-MM-DD HH:mm:ss} | CONVERSATION | {function}:{line} | {message}",
          filter=lambda record: record["extra"].get("component") == "conversation")

# 4. IMAGE PROCESSING LOG - Image and embedding processing
image_logger = logger.bind(component="image_processing")
logger.add("logs/image_processing.log",
          level="DEBUG",
          rotation="10 MB",
          retention="7 days", 
          format="{time:YYYY-MM-DD HH:mm:ss} | IMAGE_PROC | {function}:{line} | {message}",
          filter=lambda record: record["extra"].get("component") == "image_processing")

# 5. VILA MODEL LOG - Model generation and responses
model_logger = logger.bind(component="vila_model")
logger.add("logs/vila_model.log",
          level="DEBUG",
          rotation="10 MB",
          retention="7 days",
          format="{time:YYYY-MM-DD HH:mm:ss} | VILA_MODEL | {function}:{line} | {message}",
          filter=lambda record: record["extra"].get("component") == "vila_model")

# 6. DEBUG LOG - All debug information
logger.add("logs/debug_all.log",
          level="DEBUG",
          rotation="20 MB", 
          retention="3 days",
          format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}")

# Console output
logger.add(sys.stderr, level="INFO")

logger.info("Logging system initialized with multiple log files")

# Create thread pool executor for CPU-intensive operations
CPU_EXECUTOR = concurrent.futures.ThreadPoolExecutor(
    max_workers=4,  # Adjust based on your CPU cores
    thread_name_prefix="vila-cpu"
)

logger.info(f"Initialized CPU thread pool with {CPU_EXECUTOR._max_workers} workers")

# Your existing imports
from model_setup import prepare_model, VlmModelType, TrtLlmMode
from process_prompt import extract_video_frames_times
from image_utils import load_image

# OpenAI-compatible Pydantic models
class ChatMessageContent(BaseModel):
    type: str = Field(..., description="Content type: 'text', 'image_url', or 'video_url'")
    text: Optional[str] = Field(None, description="Text content for type='text'")
    image_url: Optional[Dict[str, str]] = Field(None, description="Image data with 'url' field containing data:image/jpeg;base64,... format")
    video_url: Optional[Dict[str, str]] = Field(None, description="Video data with 'url' field containing data:video/mp4;base64,... format")
    frames: Optional[int] = Field(8, description="Number of frames to extract from video (default: 8)")
    
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "type": "text",
                    "text": "What do you see in this image?"
                },
                {
                    "type": "image_url", 
                    "image_url": {
                        "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
                    }
                },
                {
                    "type": "video_url",
                    "video_url": {
                        "url": "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28y..."
                    },
                    "frames": 8
                }
            ]
        }
    }

class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: 'user', 'assistant', or 'system'")
    content: Union[str, List[ChatMessageContent]] = Field(..., description="Message content: string for text-only, or array of content objects for multimodal")
    
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "role": "user",
                    "content": "Hello, how are you?"
                },
                {
                    "role": "user", 
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this security camera footage for any suspicious activity."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
                            }
                        }
                    ]
                }
            ]
        }
    }

class ChatCompletionRequest(BaseModel):
    model: str = Field(..., description="Model to use: 'vila-1.5'")
    messages: List[ChatMessage] = Field(..., description="Array of messages in the conversation")
    max_tokens: Optional[int] = Field(None, description="Maximum number of tokens to generate")
    temperature: Optional[float] = Field(0.7, description="Sampling temperature between 0 and 1")
    top_p: Optional[float] = Field(1.0, description="Nucleus sampling parameter")
    stream: Optional[bool] = Field(False, description="Whether to stream partial results")
    use_cache: Optional[bool] = Field(True, description="Whether to use caching")
    num_beams: Optional[int] = Field(1, description="Number of beams for beam search")
    
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "model": "vila-1.5",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Analyze this image and describe what you see."
                                },
                                {
                                    "type": "image_url", 
                                    "image_url": {
                                        "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
                                    }
                                }
                            ]
                        }
                    ],
                    "max_tokens": 150,
                    "temperature": 0.7,
                    "stream": False
                },
                {
                    "model": "vila-1.5",
                    "messages": [
                        {
                            "role": "user",
                            "content": "Hello, how are you today?"
                        }
                    ],
                    "max_tokens": 100,
                    "temperature": 0.5
                }
            ]
        }
    }

# Server components class to hold all initialized components
class ServerComponents:
    """Container for all server components"""
    def __init__(self):
        self.model = None
        self.emb_generator = None
        self.frame_processor = None
        self.model_type = None
    
    def is_initialized(self) -> bool:
        """Check if all components are initialized"""
        return all([
            self.model is not None,
            self.emb_generator is not None,
            self.frame_processor is not None,
            self.model_type is not None
        ])

# Global instance of components
components = ServerComponents()

# Create FastAPI app
app = FastAPI(
    title="VILA Multimodal API",
    description="OpenAI-compatible API for VILA vision-language model",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    if components.is_initialized():
        return {"status": "healthy", "model": components.model_type}
    else:
        return {"status": "unhealthy", "error": "Components not fully initialized"}

@app.get("/metrics")
async def get_metrics():
    """Get server performance metrics"""
    try:
        # Safely get thread pool info without serializing thread objects
        thread_count = len(CPU_EXECUTOR._threads) if hasattr(CPU_EXECUTOR, '_threads') and CPU_EXECUTOR._threads else 0
        max_workers = getattr(CPU_EXECUTOR, '_max_workers', 0)
        
        # Safely get queue size
        queue_size = 0
        if hasattr(CPU_EXECUTOR, '_work_queue') and hasattr(CPU_EXECUTOR._work_queue, 'qsize'):
            try:
                queue_size = CPU_EXECUTOR._work_queue.qsize()
            except:
                queue_size = 0
        
        return {
            "thread_pool": {
                "active_thread_count": thread_count,
                "max_workers": max_workers,
                "queue_size": queue_size
            },
            "model_status": {
                "initialized": components.is_initialized(),
                "model_type": components.model_type if components.is_initialized() else None
            },
            "server_info": {
                "status": "running",
                "endpoint_version": "v1"
            }
        }
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        return {
            "thread_pool": {
                "active_thread_count": 0,
                "max_workers": 0,
                "queue_size": 0
            },
            "model_status": {
                "initialized": False,
                "model_type": None
            },
            "server_info": {
                "status": "error",
                "error": str(e)
            }
        }

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown"""
    logger.info("Shutting down server...")
    CPU_EXECUTOR.shutdown(wait=True)
    logger.info("Thread pool executor shutdown complete")

@app.get("/debug/status")
def debug_status():
    """Debug endpoint to check component status"""
    return {
        "model_loaded": components.model is not None,
        "emb_generator_loaded": components.emb_generator is not None,
        "frame_processor_loaded": components.frame_processor is not None,
        "model_type": components.model_type,
        "is_initialized": components.is_initialized(),
        "components": {
            "model": str(type(components.model)) if components.model else None,
            "emb_generator": str(type(components.emb_generator)) if components.emb_generator else None,
            "frame_processor": str(type(components.frame_processor)) if components.frame_processor else None,
        }
    }

@app.get("/v1/models")
def list_models():
    """OpenAI-compatible models endpoint"""
    return {
        "object": "list",
        "data": [
            {
                "id": components.model_type or "vila-1.5",
                "object": "model",
                "created": int(time.time()),
                "owned_by": "nvidia"
            }
        ]
    }

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    """Main chat completions endpoint with comprehensive async logging"""
    request_id = uuid.uuid4().hex[:8]
    start_time = time.time()
    
    # STEP 1: LOG INCOMING REQUEST
    prompt_logger.info(f"🚀 [REQ-{request_id}] INCOMING REQUEST")
    prompt_logger.info(f"[REQ-{request_id}] Model: {request.model}")
    prompt_logger.info(f"[REQ-{request_id}] Temperature: {request.temperature}")
    prompt_logger.info(f"[REQ-{request_id}] Max tokens: {request.max_tokens}")
    prompt_logger.info(f"[REQ-{request_id}] Number of messages: {len(request.messages)}")
    
    # Log each message in detail
    for i, msg in enumerate(request.messages):
        conv_logger.info(f"[REQ-{request_id}] Message {i+1} - Role: {msg.role}")
        
        if isinstance(msg.content, list):
            conv_logger.info(f"[REQ-{request_id}] Message {i+1} - Content (list): {len(msg.content)} items")
            for j, content_item in enumerate(msg.content):
                conv_logger.debug(f"[REQ-{request_id}] Message {i+1} - Item {j+1}: type={content_item.type}")
                if content_item.type == "text" and content_item.text:
                    conv_logger.debug(f"[REQ-{request_id}] Message {i+1} - Item {j+1} text: {content_item.text[:100]}...")
                elif content_item.type == "image_url":
                    url = content_item.image_url.get("url", "")
                    conv_logger.debug(f"[REQ-{request_id}] Message {i+1} - Item {j+1} image_url: {url[:50]}...")
        else:
            raise HTTPException(status_code=400, detail="Unsupported message content type")
    
    try:
        # STEP 2: VALIDATE COMPONENTS
        prompt_logger.info(f"[REQ-{request_id}] ✅ STEP 2: Validating components")
        if not components.is_initialized():
            prompt_logger.error(f"[REQ-{request_id}] ❌ Components not initialized")
            raise HTTPException(status_code=503, detail="Server components not fully initialized")
            
        if request.model != components.model_type:
            prompt_logger.error(f"[REQ-{request_id}] ❌ Model mismatch: {request.model} != {components.model_type}")
            raise HTTPException(
                status_code=400,
                detail=f"Model {request.model} not available. Available: {components.model_type}"
            )
            
        if not request.messages:
            prompt_logger.error(f"[REQ-{request_id}] ❌ Empty messages")
            raise HTTPException(status_code=400, detail="Messages cannot be empty")
        
        prompt_logger.info(f"[REQ-{request_id}] ✅ Components validation passed")
        
        # STEP 3: CHECK FOR TEST CALLS
        prompt_logger.info(f"[REQ-{request_id}] ✅ STEP 3: Checking for test calls")
        if is_test_api_call(request.messages):
            prompt_logger.info(f"[REQ-{request_id}] 🧪 Detected test API call")
            return handle_test_api_call(request)
        
        # STEP 4: PROCESS MULTIMODAL INPUT
        prompt_logger.info(f"[REQ-{request_id}] ✅ STEP 4: Processing multimodal input")
        prompt_text, media_content, system_message = await process_multimodal_input(
            request.messages, 
            components.frame_processor, 
            components.emb_generator,
            request_id
        )
        
        prompt_logger.info(f"[REQ-{request_id}] ✅ Multimodal processing complete")
        prompt_logger.info(f"[REQ-{request_id}] - User prompt length: {len(prompt_text)} characters")
        prompt_logger.info(f"[REQ-{request_id}] - System message length: {len(system_message) if system_message else 0} characters")
        prompt_logger.info(f"[REQ-{request_id}] - Media content keys: {list(media_content.keys())}")
        prompt_logger.info(f"[REQ-{request_id}] - Number of embeddings: {len(media_content.get('embeddings', []))}")
        prompt_logger.info(f"[REQ-{request_id}] - Number of timestamps: {len(media_content.get('string_of_times', []))}")
        
        conv_logger.info(f"[REQ-{request_id}] EXTRACTED USER PROMPT: {prompt_text}")
        conv_logger.info(f"[REQ-{request_id}] EXTRACTED SYSTEM MESSAGE: {system_message}")

        # STEP 5: GENERATE RESPONSE
        prompt_logger.info(f"[REQ-{request_id}] ✅ STEP 5: Generating VILA response")
        response_content = await generate_response(
            prompt_text, 
            media_content, 
            request, 
            components.model,
            system_message,
            request_id
        )
        
        prompt_logger.info(f"[REQ-{request_id}] ✅ Response generation complete")
        prompt_logger.info(f"[REQ-{request_id}] - Response length: {len(response_content) if response_content else 0} characters")
        
        # STEP 6: POST-PROCESS RESPONSE
        prompt_logger.info(f"[REQ-{request_id}] ✅ STEP 6: Post-processing response")
        
        # Ensure response content is a string before calling split()
        if not isinstance(response_content, str):
            prompt_logger.warning(f"[REQ-{request_id}] ⚠️  Response content is not a string: {type(response_content)}")
            response_content = str(response_content) if response_content is not None else ""

        # Calculate tokens safely
        prompt_tokens = len(prompt_text.split()) if prompt_text else 0
        completion_tokens = len(response_content.split()) if response_content else 0
        
        prompt_logger.info(f"[REQ-{request_id}] - Prompt tokens: {prompt_tokens}")
        prompt_logger.info(f"[REQ-{request_id}] - Completion tokens: {completion_tokens}")
        prompt_logger.info(f"[REQ-{request_id}] - Total tokens: {prompt_tokens + completion_tokens}")
        
        # STEP 7: BUILD FINAL RESPONSE
        prompt_logger.info(f"[REQ-{request_id}] ✅ STEP 7: Building final response")
        final_response = {
            "id": f"chatcmpl-{request_id}",
            "object": "chat.completion", 
            "created": int(time.time()),
            "model": request.model,
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response_content or ""
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens
            }
        }
        
        # PERFORMANCE METRICS
        total_time = time.time() - start_time
        prompt_logger.info(f"[REQ-{request_id}] ⚡ ASYNC PERFORMANCE METRICS:")
        prompt_logger.info(f"[REQ-{request_id}] - Total request time: {total_time:.3f}s")
        prompt_logger.info(f"[REQ-{request_id}] - Tokens per second: {completion_tokens/total_time:.1f}" if total_time > 0 else f"[REQ-{request_id}] - Tokens per second: N/A")
        
        prompt_logger.info(f"[REQ-{request_id}] 🎉 ASYNC REQUEST COMPLETED SUCCESSFULLY")
        conv_logger.info(f"[REQ-{request_id}] FINAL RESPONSE: {response_content}")
        
        return final_response
        
    except Exception as e:
        prompt_logger.error(f"[REQ-{request_id}] ❌ ERROR in chat completion: {str(e)}")
        import traceback
        prompt_logger.error(f"[REQ-{request_id}] ❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


def is_test_api_call(messages: List[ChatMessage]) -> bool:
    """Detect test API calls"""
    if not messages:
        return True
        
    for message in messages:
        if isinstance(message.content, str):
            if is_empty_timestamp_content(message.content):
                return True
            if message.content.strip():
                return False
        elif isinstance(message.content, list):
            if not message.content:
                return True
            for content in message.content:
                if content.type == "text" and content.text:
                    if is_empty_timestamp_content(content.text):
                        return True
                    return False
                elif content.type in ["image_url", "video_url"]:
                    return False
    return True


def is_empty_timestamp_content(text: str) -> bool:
    """Check if text has empty timestamp section"""
    if not text:
        return True
    
    # Check for pattern: "video ... : ...." where timestamp section is empty
    import re
    pattern = r"video.*?:\s*\."
    return bool(re.search(pattern, text, re.IGNORECASE))


def handle_test_api_call(request: ChatCompletionRequest):
    """Handle test API calls"""
    return {
        "id": f"chatcmpl-{uuid.uuid4().hex}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": request.model,
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "Server is ready and responding to requests."
                },
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": 0,
            "completion_tokens": 8,
            "total_tokens": 8
        }
    }


async def process_multimodal_input(
    messages: List[ChatMessage], 
    frame_processor, 
    emb_generator,
    request_id: str
) -> tuple[str, dict, str]:
    """Process multimodal input from messages with comprehensive logging"""
    
    prompt_logger.info(f"[REQ-{request_id}] 🔄 PROCESSING MULTIMODAL INPUT")
    
    system_message = ""
    user_prompt_parts = []
    media_content = {
        "images": [],
        "videos": [],
        "embeddings": [],
        "string_of_times": []
    }
    
    # Collect ALL images first, then process in batch
    all_image_urls = []
    
    prompt_logger.info(f"[REQ-{request_id}] Processing {len(messages)} messages")
    
    for i, message in enumerate(messages):
        conv_logger.debug(f"[REQ-{request_id}] Processing message {i+1}: role={message.role}")
        conv_logger.debug(f"[REQ-{request_id}] Message content type: {type(message.content)}")
                
        if isinstance(message.content, list):
            conv_logger.debug(f"[REQ-{request_id}] Message {i+1} - List content: {len(message.content)} items")
            
            for j, content in enumerate(message.content):
                conv_logger.debug(f"[REQ-{request_id}] Message {i+1} - Item {j+1}: type={content.type}")
                
                if content.type == "text":
                    if content.text:
                        conv_logger.debug(f"[REQ-{request_id}] Message {i+1} - Item {j+1} text: {content.text[:100]}...")
                        
                        if message.role == "system":
                            conv_logger.info(f"[REQ-{request_id}] Found SYSTEM text: {content.text[:100]}...")
                            system_message = content.text
                            times = extract_video_frames_times(content.text)
                            conv_logger.debug(f"[REQ-{request_id}] Extracted {len(times) if times else 0} timestamps from system message")
                            if times:
                                media_content["string_of_times"] = times

                        elif message.role == "user":
                            conv_logger.info(f"[REQ-{request_id}] Found USER text: {content.text[:100]}...")
                            user_prompt_parts.append(content.text)
                            # Also check user message for timestamps (fallback)
                            times = extract_video_frames_times(content.text)
                            if times and not media_content["string_of_times"]:
                                media_content["string_of_times"] = times
                                conv_logger.debug(f"[REQ-{request_id}] Extracted {len(times)} timestamps from user message as fallback")
                                
                elif content.type == "image_url":
                    # Collect images, don't process yet
                    image_url = content.image_url["url"]
                    all_image_urls.append(image_url)
                    image_logger.debug(f"[REQ-{request_id}] Collected image URL: {image_url[:50]}...")

        else:
            raise HTTPException(status_code=400, detail="Unsupported message content type")
    
    conv_logger.info(f"[REQ-{request_id}] EXTRACTION COMPLETE:")
    conv_logger.info(f"[REQ-{request_id}] - System message: {len(system_message)} chars")
    conv_logger.info(f"[REQ-{request_id}] - User prompt parts: {len(user_prompt_parts)} parts")
    conv_logger.info(f"[REQ-{request_id}] - Images to process: {len(all_image_urls)}")
    conv_logger.info(f"[REQ-{request_id}] - Timestamps found: {len(media_content.get('string_of_times', []))}")
    
    # NOW BATCH PROCESS ALL IMAGES AT ONCE
    if all_image_urls:
        image_logger.info(f"[REQ-{request_id}] 🖼️  BATCH PROCESSING {len(all_image_urls)} IMAGES")
        try:
            # Validate components
            if frame_processor is None:
                image_logger.error(f"[REQ-{request_id}] ❌ Frame processor not available")
                raise RuntimeError("Frame processor not available")
            if emb_generator is None:
                image_logger.error(f"[REQ-{request_id}] ❌ Embedding generator not available")
                raise RuntimeError("Embedding generator not available")
            
            # Process all images to tensors asynchronously
            all_image_tensors = []
            
            async def process_single_image(i, image_url):
                """Process a single image asynchronously"""
                image_logger.debug(f"[REQ-{request_id}] Loading image {i+1}/{len(all_image_urls)}: {image_url[:50]}...")
                
                # Run CPU-intensive operations in thread pool
                loop = asyncio.get_event_loop()
                pil_image = await loop.run_in_executor(CPU_EXECUTOR, load_image, image_url, False)
                image_logger.debug(f"[REQ-{request_id}] Loaded image {i+1}: size={pil_image.size}, mode={pil_image.mode}")
                
                image_tensor = await loop.run_in_executor(CPU_EXECUTOR, frame_processor.process_image, pil_image)
                image_logger.debug(f"[REQ-{request_id}] Processed image {i+1} to tensor: {image_tensor.shape}")
                
                return image_tensor
            
            # Process all images concurrently
            image_tasks = [process_single_image(i, url) for i, url in enumerate(all_image_urls)]
            all_image_tensors = await asyncio.gather(*image_tasks)
            
            # BATCH GENERATE EMBEDDINGS FOR ALL IMAGES AT ONCE (ASYNC)
            image_logger.info(f"[REQ-{request_id}] 🧠 Generating embeddings for {len(all_image_tensors)} tensors...")
            loop = asyncio.get_event_loop()
            all_embeddings = await loop.run_in_executor(CPU_EXECUTOR, emb_generator.get_embeddings, all_image_tensors)
            
            image_logger.info(f"[REQ-{request_id}] ✅ Generated embeddings: count={len(all_embeddings)}")
            for i, emb in enumerate(all_embeddings):
                image_logger.debug(f"[REQ-{request_id}] Embedding {i}: shape={emb.shape}")
            
            # Store ALL embeddings
            media_content["embeddings"] = all_embeddings
            
        except Exception as e:
            image_logger.error(f"[REQ-{request_id}] ❌ Failed to batch process images: {str(e)}")
            import traceback
            image_logger.error(f"[REQ-{request_id}] ❌ Full traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=400, detail=f"Failed to process images: {str(e)}")
    
    # Build prompt text - only use user prompt parts, not system message
    prompt_text = " ".join(user_prompt_parts) if user_prompt_parts else ""
    
    prompt_logger.info(f"[REQ-{request_id}] ✅ MULTIMODAL PROCESSING COMPLETE")
    prompt_logger.info(f"[REQ-{request_id}] - Final user prompt: {len(prompt_text)} chars")
    prompt_logger.info(f"[REQ-{request_id}] - System message: {len(system_message)} chars") 
    prompt_logger.info(f"[REQ-{request_id}] - Images processed: {len(all_image_urls)}")
    prompt_logger.info(f"[REQ-{request_id}] - Embeddings generated: {len(media_content.get('embeddings', []))}")
    
    conv_logger.debug(f"[REQ-{request_id}] FINAL USER PROMPT: {prompt_text}")
    conv_logger.debug(f"[REQ-{request_id}] FINAL SYSTEM MESSAGE: {system_message}")
    
    # Return user prompt, media content, and system message separately
    return prompt_text, media_content, system_message


async def generate_response(
    prompt_text: str, 
    media_content: dict, 
    request: ChatCompletionRequest,
    model,
    system_message: str = "",
    request_id: str = ""
) -> str:
    """Generate response with comprehensive logging"""
    model_logger.info(f"[REQ-{request_id}] 🤖 VILA MODEL GENERATION")
    model_logger.info(f"[REQ-{request_id}] User prompt: {prompt_text[:100]}...")
    model_logger.info(f"[REQ-{request_id}] System message: {system_message[:100] if system_message else 'None'}...")
    
    if model is None:
        model_logger.error(f"[REQ-{request_id}] ❌ Model not available")
        raise RuntimeError("Model not available")
    
    sys.path.append(os.path.dirname(__file__) + "/../..")
    from vila15_context import Vila15Context
    
    try:
        model_logger.debug(f"[REQ-{request_id}] Creating VILA context...")
        ctx = Vila15Context(model)
        
        # Set the system message if provided
        if system_message:
            model_logger.info(f"[REQ-{request_id}] Setting system message: {system_message[:100]}...")
            ctx.set_system_message(system_message)
        else:
            model_logger.debug(f"[REQ-{request_id}] No system message provided, using default")
        
        if media_content.get("embeddings"):
            embeddings = media_content["embeddings"]
            string_of_times = media_content.get("string_of_times", [])
            
            model_logger.info(f"[REQ-{request_id}] 🔢 PROCESSING EMBEDDINGS:")
            model_logger.info(f"[REQ-{request_id}] - Number of embeddings: {len(embeddings)}")
            model_logger.info(f"[REQ-{request_id}] - Number of timestamps: {len(string_of_times)}")
            
            # Debug each embedding
            total_tokens = 0
            for i, emb in enumerate(embeddings):
                model_logger.debug(f"[REQ-{request_id}] Embedding {i}: shape={emb.shape}")
                if len(emb.shape) >= 2:
                    tokens_for_this_embedding = emb.shape[1]
                    total_tokens += tokens_for_this_embedding
                    model_logger.debug(f"[REQ-{request_id}]   Will create {tokens_for_this_embedding} tokens")
            
            model_logger.info(f"[REQ-{request_id}] - Total tokens from all embeddings: {total_tokens}")
            
            # Sanity check - prevent token explosion
            if total_tokens > 3000:  # Conservative limit
                model_logger.error(f"[REQ-{request_id}] 🚨 TOO MANY TOKENS: {total_tokens}")
                return f"Error: Too many image tokens ({total_tokens}). Check embedding processing."
            
            # Prepare timestamps
            if not string_of_times:
                # Create default timestamps for each embedding
                string_of_times = [float(i) for i in range(len(embeddings))]
                model_logger.debug(f"[REQ-{request_id}] Created default timestamps: {string_of_times}")
            elif len(string_of_times) != len(embeddings):
                model_logger.warning(f"[REQ-{request_id}] ⚠️  Timestamp count ({len(string_of_times)}) != embedding count ({len(embeddings)})")
                # Pad or truncate as needed
                while len(string_of_times) < len(embeddings):
                    string_of_times.append(float(len(string_of_times)))
                string_of_times = string_of_times[:len(embeddings)]
                model_logger.debug(f"[REQ-{request_id}] Adjusted timestamps: {string_of_times}")
            
            model_logger.info(f"[REQ-{request_id}] - Final timestamps: {string_of_times}")
            
            model_logger.debug(f"[REQ-{request_id}] Setting video embeds in context...")
            ctx.set_video_embeds(
                video_embeds=embeddings,        # ALL embeddings
                video_frames_times=[string_of_times]  # Timestamps for all embeddings
            )
            model_logger.debug(f"[REQ-{request_id}] ✅ Video embeds set successfully")
        else:
            model_logger.info(f"[REQ-{request_id}] No embeddings to process")
        
        model_logger.info(f"[REQ-{request_id}] 🎯 Asking VILA model...")
        model_logger.debug(f"[REQ-{request_id}] Final prompt for VILA: {prompt_text}")
        
        # Generate response with system message
        vlm_response_stats = ctx.ask(prompt_text, system_message=system_message)
        
        model_logger.debug(f"[REQ-{request_id}] VILA model response received")
        model_logger.debug(f"[REQ-{request_id}] Response type: {type(vlm_response_stats)}")
        
        # Handle response (same as before)
        if isinstance(vlm_response_stats, tuple):
            vlm_response, stats = vlm_response_stats
            model_logger.debug(f"[REQ-{request_id}] Response is tuple, extracted response")
        else:
            vlm_response = vlm_response_stats
            model_logger.debug(f"[REQ-{request_id}] Response is direct value")

        if hasattr(vlm_response, "result"):
            model_logger.debug(f"[REQ-{request_id}] Response is a Future object, getting result...")
            try:
                actual_result = await asyncio.wrap_future(vlm_response)
                model_logger.debug(f"[REQ-{request_id}] Future result type: {type(actual_result)}")
                
                if isinstance(actual_result, tuple) and len(actual_result) == 2:
                    outputs_list, stats_list = actual_result
                    if outputs_list and len(outputs_list) > 0:
                        vlm_response = outputs_list[0]
                        model_logger.debug(f"[REQ-{request_id}] Extracted response from outputs_list: {vlm_response[:100]}...")
                    else:
                        vlm_response = ""
                        model_logger.warning(f"[REQ-{request_id}] ⚠️  Empty outputs_list")
                else:
                    vlm_response = str(actual_result) if actual_result is not None else ""
                    model_logger.debug(f"[REQ-{request_id}] Direct result: {vlm_response[:100]}...")
            except Exception as future_error:
                model_logger.error(f"[REQ-{request_id}] ❌ Error getting result from Future: {future_error}")
                vlm_response = ""
        
        if vlm_response is None:
            model_logger.warning(f"[REQ-{request_id}] ⚠️  Response is None, setting to empty string")
            vlm_response = ""
        elif not isinstance(vlm_response, str):
            model_logger.debug(f"[REQ-{request_id}] Converting response to string: {type(vlm_response)}")
            vlm_response = str(vlm_response)

        model_logger.info(f"[REQ-{request_id}] ✅ VILA GENERATION COMPLETE")
        model_logger.info(f"[REQ-{request_id}] - Final response length: {len(vlm_response)} characters")
        model_logger.debug(f"[REQ-{request_id}] - Final response: {vlm_response}")

        return vlm_response
        
    except Exception as e:
        model_logger.error(f"[REQ-{request_id}] ❌ Error in generating response: {str(e)}")
        import traceback
        model_logger.error(f"[REQ-{request_id}] ❌ Full traceback: {traceback.format_exc()}")
        raise


def initialize_model(args):
    """Initialize the VILA model and all components"""
    global components
    
    try:
        logger.info("Initializing VILA model...")
        
        # Your existing model initialization logic
        final_model_path, final_trt_engine_dir, use_trt = prepare_model(
            model_path=args.model_path,
            model_type=args.model_type,
            trt_engine_dir=args.trt_engine_dir,
            trt_llm_mode=args.trt_llm_mode,
            vlm_batch_size=args.vlm_batch_size,
            force_rebuild=args.force_build_trt_engine,
        )
        
        # Load your VILA model
        sys.path.append(os.path.dirname(__file__) + "/../..")
        from vila15_model import Vila15
        from vila15_embedding_generator import Vila15EmbeddingGenerator
        from vila15_frame_processor import VilaFrameProcessor
        
        logger.info("Loading VILA model...")
        components.model = Vila15(
            final_model_path,
            trt_engine_dir=final_trt_engine_dir,
            max_batch_size=args.vlm_batch_size,
            async_output=True,
        )
        
        logger.info("Loading VILA embedding generator...")
        components.emb_generator = Vila15EmbeddingGenerator(
            final_model_path,
            trt_engine_dir=final_trt_engine_dir,
            async_output=True,
        )
        
        logger.info("Initializing VILA frame processor...")
        components.frame_processor = VilaFrameProcessor(final_model_path)    
        
        components.model_type = args.model_type
        
        # Verify all components are initialized
        if not components.is_initialized():
            raise RuntimeError("Not all components were properly initialized")
        
        logger.info(f"VILA model loaded successfully: {components.model_type}")
        logger.info(f"Frame processor initialized for model: {final_model_path}")
        logger.info("All components initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize model: {str(e)}")
        raise RuntimeError(f"Model initialization failed: {str(e)}")


if __name__ == "__main__":
    # Parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", type=str, default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--model-path", type=str, required=True)
    parser.add_argument("--conv-mode", type=str, default="auto")
    parser.add_argument("--model-type", type=str, default=VlmModelType.VILA_15, 
                        choices=[VlmModelType.VILA_15, VlmModelType.NVILA])
    parser.add_argument("--trt-engine-dir", type=str, default=None)
    parser.add_argument("--trt-llm-mode", type=str, default=TrtLlmMode.FP8,
                        choices=[TrtLlmMode.FP16, TrtLlmMode.FP8, TrtLlmMode.INT8, TrtLlmMode.INT4, TrtLlmMode.INT4_AWQ])
    parser.add_argument("--vlm-batch-size", type=int, default=128)
    parser.add_argument("--use-trt", action="store_true", default=False)
    parser.add_argument("--force-build-trt-engine", action="store_true", default=False)

    args = parser.parse_args()
    
    # Initialize model before starting server
    try:
        initialize_model(args)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)
    
    # Start server with optimized async configuration (without uvloop)
    uvicorn.run(
        app,
        host=args.host,
        port=args.port,
        workers=1,  # Single worker for GPU workloads to avoid contention
        log_level="info",
        access_log=False,  # Reduce I/O overhead
        use_colors=False,  # Reduce formatting overhead
        limit_concurrency=100,  # Max concurrent connections
        limit_max_requests=1000,  # Restart worker after N requests (memory cleanup)
        timeout_keep_alive=5,  # Keep-alive timeout
    )