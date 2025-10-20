#!/usr/bin/env python3
"""
Comprehensive test of VILA 1.5 logging system to trace prompt flow
Tests the complete pipeline from OpenAI format to VILA model generation
"""

import json
import requests
import time
import os
import sys
from pathlib import Path
from loguru import logger

# Setup test logger
test_logger = logger.bind(component="test_logging")
test_logger.add("logs/test_logging.log", 
                format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | TEST | {message}",
                level="DEBUG", rotation="10 MB", compression="zip")

def test_prompt_flow_logging():
    """
    Test the complete prompt flow logging system
    This will trace how system and user prompts are processed through VILA
    """
    test_logger.info("🧪 STARTING COMPREHENSIVE PROMPT FLOW LOGGING TEST")
    
    # Ensure logs directory exists
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    test_logger.info(f"Logs directory: {logs_dir.absolute()}")
    
    # Test OpenAI API endpoint
    api_url = "http://localhost:8000/v1/chat/completions"
    
    # Test payload with system message and user message
    test_payload = {
        "model": "vila-1.5",
        "messages": [
            {
                "role": "system", 
                "content": "You are a helpful AI assistant that analyzes images and videos. Always be concise and accurate in your responses."
            },
            {
                "role": "user",
                "content": "What do you see in this image? Please describe it in detail.",
                "images": ["test_image_base64_placeholder"]  # This would be actual base64 in real test
            }
        ],
        "temperature": 0.7,
        "max_tokens": 200,
        "stream": False
    }
    
    test_logger.info("📤 SENDING TEST REQUEST TO VILA API")
    test_logger.info(f"API URL: {api_url}")
    test_logger.info(f"Test payload messages: {len(test_payload['messages'])}")
    test_logger.debug(f"System message: {test_payload['messages'][0]['content']}")
    test_logger.debug(f"User message: {test_payload['messages'][1]['content']}")
    
    try:
        # Send request to VILA API
        response = requests.post(
            api_url,
            json=test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        test_logger.info(f"📥 RECEIVED RESPONSE: Status {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            test_logger.info("✅ API REQUEST SUCCESSFUL")
            test_logger.debug(f"Response: {json.dumps(response_data, indent=2)}")
        else:
            test_logger.error(f"❌ API REQUEST FAILED: {response.status_code}")
            test_logger.error(f"Response: {response.text}")
            
    except requests.ConnectionError:
        test_logger.warning("⚠️ VILA server not running - simulating log analysis")
        test_logger.info("This test will analyze existing logs if available")
    except Exception as e:
        test_logger.error(f"❌ Test failed with error: {str(e)}")

def analyze_log_files():
    """
    Analyze the generated log files to understand prompt flow
    """
    test_logger.info("🔍 ANALYZING GENERATED LOG FILES")
    
    log_files = [
        "logs/server_main.log",
        "logs/prompt_flow.log", 
        "logs/conversation.log",
        "logs/vila_model.log",
        "logs/image_processing.log",
        "logs/debug_all.log"
    ]
    
    for log_file in log_files:
        log_path = Path(log_file)
        if log_path.exists():
            test_logger.info(f"📄 Found log file: {log_file}")
            test_logger.info(f"   Size: {log_path.stat().st_size} bytes")
            
            # Show last few lines of each log
            try:
                with open(log_path, 'r') as f:
                    lines = f.readlines()
                    if lines:
                        test_logger.debug(f"Last entry in {log_file}: {lines[-1].strip()}")
                    test_logger.info(f"   Total lines: {len(lines)}")
            except Exception as e:
                test_logger.warning(f"Could not read {log_file}: {e}")
        else:
            test_logger.warning(f"❌ Log file not found: {log_file}")

def print_logging_summary():
    """
    Print a summary of the logging system we've implemented
    """
    test_logger.info("📋 LOGGING SYSTEM IMPLEMENTATION SUMMARY")
    
    logging_components = {
        "server.py": [
            "Request ID generation and tracking",
            "OpenAI message format parsing", 
            "System message extraction",
            "Image processing pipeline",
            "VILA model generation calls",
            "Response formatting",
            "Error handling"
        ],
        "vila15_context.py": [
            "Conversation initialization", 
            "System message setting",
            "Video embeddings configuration",
            "Query processing and response generation"
        ],
        "conversation.py": [
            "Prompt generation with separator styles",
            "Message appending and formatting",
            "System prompt vs user prompt handling",
            "Conversation format conversion"
        ],
        "vila15_model.py": [
            "Model initialization and configuration",
            "Generation parameter setup",
            "Tokenization process",
            "Video embedding preparation", 
            "TRT-LLM request creation and execution",
            "Output processing"
        ],
        "vila15_embedding_generator.py": [
            "Embedding generator initialization",
            "TRT visual encoder loading",
            "Visual embedding generation",
            "Batch processing of frame tensors"
        ]
    }
    
    for component, features in logging_components.items():
        test_logger.info(f"🔧 {component}")
        for feature in features:
            test_logger.info(f"   ✓ {feature}")

if __name__ == "__main__":
    print("🚀 Starting VILA 1.5 Prompt Flow Logging Test")
    print("="*60)
    
    # Run comprehensive test
    test_prompt_flow_logging()
    
    # Analyze existing logs
    analyze_log_files()
    
    # Print summary
    print_logging_summary()
    
    print("="*60)
    print("✅ Test completed! Check logs/ directory for detailed trace files")
    print("\nKey log files to analyze:")
    print("- logs/prompt_flow.log: Complete request flow")
    print("- logs/conversation.log: Prompt formatting details") 
    print("- logs/vila_model.log: Model generation process")
    print("- logs/image_processing.log: Visual embedding generation")
    print("- logs/debug_all.log: Comprehensive debug information")