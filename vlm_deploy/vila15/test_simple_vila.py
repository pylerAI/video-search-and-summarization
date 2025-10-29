#!/usr/bin/env python3
"""
Simple VILA server test to check basic functionality after CUDA errors
"""

import asyncio
import aiohttp
import json
import sys

async def test_text_only():
    """Test text-only request to check if server is responsive"""
    
    print("🔍 Testing VILA server with text-only request...")
    
    url = "http://localhost:8000/v1/chat/completions"
    
    data = {
        "model": "vila-1.5",
        "messages": [
            {
                "role": "user", 
                "content": [
                    {"type": "text", "text": "Hello, are you working properly?"}
                ]
            }
        ],
        "temperature": 0.1,
        "max_tokens": 50
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                print(f"📡 Response status: {response.status}")
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ Text-only request successful!")
                    if 'choices' in result and result['choices']:
                        content = result['choices'][0]['message']['content']
                        print(f"📝 Response: {content}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Request failed: {error_text}")
                    return False
                    
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

async def test_health():
    """Test server health endpoint"""
    
    print("🏥 Testing VILA server health...")
    
    url = "http://localhost:8000/health"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                print(f"📡 Health check status: {response.status}")
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ Server health check passed!")
                    print(f"📊 Health data: {result}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Health check failed: {error_text}")
                    return False
                    
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

async def main():
    """Main test function"""
    print("🧪 Simple VILA Server Recovery Test")
    print("=" * 50)
    
    # Test 1: Health check
    health_ok = await test_health()
    
    if health_ok:
        # Test 2: Text-only request
        text_ok = await test_text_only()
        
        if text_ok:
            print("\n✅ VILA server appears to be working for text requests")
            print("🔧 Issue seems to be with image processing/CUDA memory management")
        else:
            print("\n❌ VILA server has deeper issues beyond CUDA memory")
    else:
        print("\n❌ VILA server is not responding properly")
        
    print("\n📋 Next steps:")
    print("1. If text works but images fail -> CUDA memory corruption, restart server")  
    print("2. If nothing works -> Server process issue, restart required")
    print("3. Consider using CUDA_LAUNCH_BLOCKING=1 for debugging")

if __name__ == "__main__":
    asyncio.run(main())