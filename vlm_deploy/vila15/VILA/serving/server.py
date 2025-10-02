import sys
import os
import time
import uuid
from typing import Union, List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import argparse

from loguru import logger
# Your existing imports
from model_setup import prepare_model, VlmModelType, TrtLlmMode
from process_prompt import extract_video_frames_times
from image_utils import load_image

# OpenAI-compatible Pydantic models
class ChatMessageContent(BaseModel):
    type: str
    text: Optional[str] = None
    image_url: Optional[Dict[str, str]] = None
    video_url: Optional[Dict[str, str]] = None
    frames: Optional[int] = 8

class ChatMessage(BaseModel):
    role: str
    content: Union[str, List[ChatMessageContent]]

class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    max_tokens: Optional[int] = None
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 1.0
    stream: Optional[bool] = False
    use_cache: Optional[bool] = True
    num_beams: Optional[int] = 1

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

# Helper functions (implement these based on your existing code)
def load_video(video_url: str):
    """Load video from URL"""
    # Your existing video loading logic
    pass

def sample_frames_from_video(video_path: str, num_frames: int):
    """Sample frames from video"""
    # Your existing frame sampling logic
    pass

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
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy" if components.is_initialized() else "initializing",
        "model": components.model_type,
        "timestamp": time.time(),
        "components_ready": components.is_initialized()
    }

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

@app.get("/debug/frame_processor")
def debug_frame_processor():
    """Debug endpoint to check frame processor status"""
    if components.frame_processor is None:
        return {"error": "Frame processor not initialized"}
    
    try:
        # Get preprocessing info
        info = components.frame_processor.get_preprocessing_info()
        return {
            "frame_processor_type": str(type(components.frame_processor)),
            "preprocessing_info": info,
            "has_process_image": hasattr(components.frame_processor, 'process_image')
        }
    except Exception as e:
        return {"error": f"Failed to get frame processor info: {str(e)}"}
    

@app.post("/v1/chat/completions")
def chat_completions(request: ChatCompletionRequest):
    """Main chat completions endpoint"""
    try:
        # Validate components are initialized
        if not components.is_initialized():
            raise HTTPException(status_code=503, detail="Server components not fully initialized")
            
        if request.model != components.model_type:
            raise HTTPException(
                status_code=400,
                detail=f"Model {request.model} not available. Available: {components.model_type}"
            )
            
        if not request.messages:
            raise HTTPException(status_code=400, detail="Messages cannot be empty")
        
        # Handle test calls
        if is_test_api_call(request.messages):
            logger.info("Received test API call")
            return handle_test_api_call(request)
        
        # Process multimodal input - pass components as parameters
        prompt_text, media_content = process_multimodal_input(
            request.messages, 
            components.frame_processor, 
            components.emb_generator
        )
        
        logger.debug(f"Processed prompt length: {len(prompt_text)} characters")
        logger.debug(f"Media content keys: {list(media_content.keys())}")

        # Generate response using VILA model - pass model as parameter
        response_content = generate_response(
            prompt_text, 
            media_content, 
            request, 
            components.model
        )
        
        # Ensure response content is a string before calling split()
        if not isinstance(response_content, str):
            logger.warning(f"Response content is not a string: {type(response_content)}")
            response_content = str(response_content) if response_content is not None else ""

        # Calculate tokens safely
        prompt_tokens = len(prompt_text.split()) if prompt_text else 0
        completion_tokens = len(response_content.split()) if response_content else 0
        
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
        
    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
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

def process_multimodal_input(
    messages: List[ChatMessage], 
    frame_processor, 
    emb_generator
) -> tuple[str, dict]:
    """Process multimodal input from messages - BATCH PROCESS IMAGES"""
    prompt_parts = []
    media_content = {
        "images": [],
        "videos": [],
        "embeddings": [],
        "string_of_times": []
    }
    
    # Collect ALL images first, then process in batch
    all_image_urls = []
    
    for message in messages:
        if isinstance(message.content, str):
            logger.debug(f"Processing text content: {message.content[:50]}...")
            prompt_parts.append(message.content)
        elif isinstance(message.content, list):
            for content in message.content:
                if content.type == "text":
                    if content.text:
                        logger.debug(f"Processing text content from {message.role}: {content.text[:50]}...")
                        
                        if message.role == "system":
                            logger.debug(f"System message text: '{content.text}'")

                            times = extract_video_frames_times(content.text)
                            logger.debug(f"Extracted times from system message: {times}")
                            if times:
                                media_content["string_of_times"] = times
                                logger.debug(f"Extracted {len(times)} timestamps from system message")

                            prompt_parts.append(content.text)

                        elif message.role == "user":
                            logger.debug(f"user message text: '{content.text[:100]}'")
                            prompt_parts.append(content.text)

                            times = extract_video_frames_times(content.text)
                        
                        # 🔍 DEBUG TIMESTAMP EXTRACTION
                        logger.debug(f"Full text content: '{content.text}'")
                        logger.debug(f"Extracted times: {times}")
                        logger.debug(f"Number of extracted times: {len(times) if times else 0}")
                        logger.debug(f"Type of times: {type(times)}")
                        
                        if times:
                            media_content["string_of_times"] = times
                            
                            # Additional debugging
                            if isinstance(times, list):
                                logger.debug(f"First few times: {times[:5]}")
                                logger.debug(f"Last few times: {times[-5:]}")
                            else:
                                logger.debug(f"Times is not a list: {times}")
                                
                elif content.type == "image_url":
                    # Collect images, don't process yet
                    image_url = content.image_url["url"]
                    all_image_urls.append(image_url)
                    logger.debug(f"Collected image URL: {image_url[:50]}...")
    
    # NOW BATCH PROCESS ALL IMAGES AT ONCE
    if all_image_urls:
        try:
            logger.debug(f"Batch processing {len(all_image_urls)} images...")
            
            # Validate components
            if frame_processor is None:
                raise RuntimeError("Frame processor not available")
            if emb_generator is None:
                raise RuntimeError("Embedding generator not available")
            
            # Process all images to tensors
            all_image_tensors = []
            for i, image_url in enumerate(all_image_urls):
                logger.debug(f"Loading image {i+1}/{len(all_image_urls)}: {image_url[:50]}...")
                
                pil_image = load_image(image_url, preprocess=False)
                logger.debug(f"Loaded image {i+1}: size={pil_image.size}, mode={pil_image.mode}")
                
                image_tensor = frame_processor.process_image(pil_image)
                logger.debug(f"Processed image {i+1} to tensor: {image_tensor.shape}")
                
                all_image_tensors.append(image_tensor)
            
            # BATCH GENERATE EMBEDDINGS FOR ALL IMAGES AT ONCE
            logger.debug(f"Generating embeddings for {len(all_image_tensors)} tensors...")
            all_embeddings = emb_generator.get_embeddings(all_image_tensors)  # Pass ALL tensors
            
            logger.debug(f"Generated embeddings: count={len(all_embeddings)}")
            for i, emb in enumerate(all_embeddings):
                logger.debug(f"Embedding {i}: shape={emb.shape}")
            
            # Store ALL embeddings
            media_content["embeddings"] = all_embeddings
            
        except Exception as e:
            logger.error(f"Failed to batch process images: {str(e)}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=400, detail=f"Failed to process images: {str(e)}")
    
    # Build prompt text
    prompt_text = " ".join(prompt_parts) if prompt_parts else ""
    
    logger.debug(f"Final prompt length: {len(prompt_text)} characters")
    logger.debug(f"Total images processed: {len(all_image_urls)}")
    logger.debug(f"Total embeddings generated: {len(media_content.get('embeddings', []))}")
    
    return prompt_text, media_content


def generate_response(
    prompt_text: str, 
    media_content: dict, 
    request: ChatCompletionRequest,
    model
) -> str:
    """Generate response - handle multiple embeddings correctly"""
    if model is None:
        raise RuntimeError("Model not available")
    
    sys.path.append(os.path.dirname(__file__) + "/../..")
    from vila15_context import Vila15Context
    
    try:
        ctx = Vila15Context(model)
        
        if media_content.get("embeddings"):
            embeddings = media_content["embeddings"]
            string_of_times = media_content.get("string_of_times", [])
            
            logger.debug(f"🔍 DEBUGGING EMBEDDINGS:")
            logger.debug(f"Number of embeddings: {len(embeddings)}")
            
            # Debug each embedding
            total_tokens = 0
            for i, emb in enumerate(embeddings):
                logger.debug(f"Embedding {i}: shape={emb.shape}")
                if len(emb.shape) >= 2:
                    tokens_for_this_embedding = emb.shape[1]
                    total_tokens += tokens_for_this_embedding
                    logger.debug(f"  Will create {tokens_for_this_embedding} tokens")
            
            logger.debug(f"Total tokens from all embeddings: {total_tokens}")
            
            # Sanity check - prevent token explosion
            if total_tokens > 3000:  # Conservative limit
                logger.error(f"🚨 TOO MANY TOKENS: {total_tokens}")
                return f"Error: Too many image tokens ({total_tokens}). Check embedding processing."
            
            # Prepare timestamps
            if not string_of_times:
                # Create default timestamps for each embedding
                string_of_times = [float(i) for i in range(len(embeddings))]
            elif len(string_of_times) != len(embeddings):
                logger.warning(f"Timestamp count ({len(string_of_times)}) != embedding count ({len(embeddings)})")
                # Pad or truncate as needed
                while len(string_of_times) < len(embeddings):
                    string_of_times.append(float(len(string_of_times)))
                string_of_times = string_of_times[:len(embeddings)]
            
            logger.debug(f"Using timestamps: {string_of_times}")
            
            
            logger.debug(f"Setting video embeds: {len(embeddings)} embeddings")
            ctx.set_video_embeds(
                video_embeds=embeddings,        # ALL embeddings
                video_frames_times=[string_of_times]  # Timestamps for all embeddings
            )
        
        logger.debug(f"Generating response for prompt: {prompt_text}")
        
        # Generate response
        vlm_response_stats = ctx.ask(prompt_text)
        
        # Handle response (same as before)
        if isinstance(vlm_response_stats, tuple):
            vlm_response, stats = vlm_response_stats
        else:
            vlm_response = vlm_response_stats

        if hasattr(vlm_response, "result"):
            logger.debug("Response is a Future object, getting result...")
            try:
                actual_result = vlm_response.result()
                if isinstance(actual_result, tuple) and len(actual_result) == 2:
                    outputs_list, stats_list = actual_result
                    if outputs_list and len(outputs_list) > 0:
                        vlm_response = outputs_list[0]
                    else:
                        vlm_response = ""
                else:
                    vlm_response = str(actual_result) if actual_result is not None else ""
            except Exception as future_error:
                logger.error(f"Error getting result from Future: {future_error}")
                vlm_response = ""
        
        if vlm_response is None:
            vlm_response = ""
        elif not isinstance(vlm_response, str):
            vlm_response = str(vlm_response)

        return vlm_response
        
    except Exception as e:
        logger.error(f"Error in generating response: {str(e)}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
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

@app.get("/debug/test_embedding")
def debug_test_embedding():
    """Debug endpoint to test embedding generation with a simple image"""
    try:
        from PIL import Image
        import numpy as np
        
        # Create a simple test image
        test_image = Image.new('RGB', (256, 256), color='red')
        
        # Process with frame processor
        if components.frame_processor is None:
            return {"error": "Frame processor not available"}
        
        tensor = components.frame_processor.process_image(test_image)
        
        # Generate embeddings
        if components.emb_generator is None:
            return {"error": "Embedding generator not available"}
        
        embeddings = components.emb_generator.get_embeddings([tensor])
        
        # Safe embedding info
        embedding_info = {
            "embeddings_type": str(type(embeddings)),
            "embeddings_length": len(embeddings) if isinstance(embeddings, (list, tuple)) else "not_iterable"
        }
        
        if isinstance(embeddings, (list, tuple)) and len(embeddings) > 0:
            first_emb = embeddings[0]
            embedding_info["first_embedding_type"] = str(type(first_emb))
            if hasattr(first_emb, 'shape'):
                embedding_info["first_embedding_shape"] = str(first_emb.shape)
            if hasattr(first_emb, 'dtype'):
                embedding_info["first_embedding_dtype"] = str(first_emb.dtype)
        
        return {
            "success": True,
            "tensor_shape": str(tensor.shape),
            "tensor_dtype": str(tensor.dtype),
            "embedding_info": embedding_info
        }
        
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

# Add this debug function to check the regex
@app.get("/debug/timestamp_extraction")
def debug_timestamp_extraction():
    """Debug timestamp extraction"""
    test_text = "These are images sampled from a video at timestamps in seconds : <90.01> <91.93> <93.8> <95.68> <97.6> <99.47> <101.35> <103.27> <105.15> <107.02>"
    
    try:
        from process_prompt import extract_video_frames_times
        
        result = extract_video_frames_times(test_text)
        
        return {
            "input_text": test_text,
            "extracted_times": result,
            "count": len(result) if result else 0,
            "type": str(type(result)),
            "first_5": result[:5] if result and len(result) > 5 else result,
            "last_5": result[-5:] if result and len(result) > 5 else []
        }
        
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

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
    
    # Start server
    uvicorn.run(
        app,
        host=args.host,
        port=args.port,
        workers=1,
        log_level="info"
    )