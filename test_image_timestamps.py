#!/usr/bin/env python3
"""Test script for VILA deployment with timestamp handling."""

import requests
import base64
from PIL import Image
import io
import json

def create_test_image():
    """Create a simple test image for testing."""
    img = Image.new('RGB', (224, 224), color='blue')
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    img_data = buffer.getvalue()
    return base64.b64encode(img_data).decode('utf-8')

def test_vila_server():
    """Test VILA server with timestamp system message handling."""
    
    # Create test prompt matching CompOpenAIModel format
    test_prompt = {
        "model": "vila-1.5",
        "messages": [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text", 
                        "text": "These are images sampled from a video at timestamps in seconds : <10.5> <15.2> <20.8> .Make sure the answer contain correct timestamps."
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{create_test_image()}",
                            "detail": "auto"
                        }
                    },
                    {
                        "type": "text",
                        "text": "What do you see in this image? Please mention the timestamps."
                    }
                ]
            }
        ],
        "max_tokens": 150,
        "temperature": 0.2
    }

    # Send to VILA server
    try:
        print("Sending request to VILA server...")
        response = requests.post(
            "http://0.0.0.0:8001/v1/chat/completions",
            json=test_prompt,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("Response received successfully!")
            print(f"Model response: {result['choices'][0]['message']['content']}")
            
            # Check if timestamps are mentioned in response
            response_text = result['choices'][0]['message']['content']
            timestamps = ["10.5", "15.2", "20.8"]
            timestamp_mentions = sum(1 for ts in timestamps if ts in response_text)
            
            print(f"\nTimestamp analysis:")
            print(f"- Timestamps in system message: {timestamps}")
            print(f"- Timestamps mentioned in response: {timestamp_mentions}/{len(timestamps)}")
            
            if timestamp_mentions == 0:
                print("❌ ISSUE: Model did not reference any timestamps from system message")
                return False
            else:
                print("✅ SUCCESS: Model referenced timestamps from system message")
                return True
                
        else:
            print(f"Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error connecting to server: {e}")
        return False

if __name__ == "__main__":
    print("Testing VILA server timestamp handling...")
    success = test_vila_server()
    if not success:
        print("\n🔍 This test helps identify system message handling issues in VILA deployment")
        exit(1)
    else:
        print("\n✅ Test passed!")