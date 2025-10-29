#!/usr/bin/env python3
"""
API Documentation Verification Test

This script tests whether the VILA server API documentation now shows
the correct multimodal message format instead of the generic string format.
"""

import requests
import json

def test_api_documentation():
    """Test if API documentation shows correct multimodal format"""
    
    print("📚 VILA Server API Documentation Test")
    print("=" * 60)
    
    # Test the OpenAPI schema endpoint
    try:
        print("🔍 Checking OpenAPI schema...")
        response = requests.get("http://localhost:8000/openapi.json")
        
        if response.status_code == 200:
            schema = response.json()
            
            # Check if the schema contains proper multimodal content structure
            paths = schema.get("paths", {})
            chat_endpoint = paths.get("/v1/chat/completions", {})
            post_method = chat_endpoint.get("post", {})
            request_body = post_method.get("requestBody", {})
            content = request_body.get("content", {})
            app_json = content.get("application/json", {})
            schema_ref = app_json.get("schema", {})
            
            print(f"✅ OpenAPI schema retrieved successfully")
            
            # Look for the ChatCompletionRequest schema
            components = schema.get("components", {})
            schemas = components.get("schemas", {})
            
            chat_completion_request = schemas.get("ChatCompletionRequest", {})
            if chat_completion_request:
                print(f"✅ Found ChatCompletionRequest schema")
                
                # Check if it has the example we added
                example = chat_completion_request.get("example", {})
                if example:
                    print(f"✅ Found example in schema")
                    print(f"📋 Example model: {example.get('model', 'Not found')}")
                    
                    messages = example.get("messages", [])
                    if messages and len(messages) > 0:
                        first_message = messages[0]
                        content = first_message.get("content", [])
                        
                        if isinstance(content, list) and len(content) > 0:
                            print(f"✅ Example shows multimodal content array format")
                            
                            # Check for text and image_url types
                            has_text = any(item.get("type") == "text" for item in content)
                            has_image = any(item.get("type") == "image_url" for item in content)
                            
                            if has_text:
                                print(f"✅ Example includes 'text' content type")
                            if has_image:
                                print(f"✅ Example includes 'image_url' content type")
                                
                            print(f"\n📝 Example message content structure:")
                            for i, item in enumerate(content):
                                print(f"   {i+1}. Type: {item.get('type', 'unknown')}")
                                if item.get('type') == 'text':
                                    print(f"      Text: {item.get('text', '')[:50]}...")
                                elif item.get('type') == 'image_url':
                                    print(f"      Image URL: {item.get('image_url', {}).get('url', '')[:50]}...")
                        else:
                            print(f"❌ Example still shows string content format")
                    else:
                        print(f"❌ No messages found in example")
                else:
                    print(f"❌ No example found in schema")
            else:
                print(f"❌ ChatCompletionRequest schema not found")
                
            # Check ChatMessageContent schema
            chat_message_content = schemas.get("ChatMessageContent", {})
            if chat_message_content:
                print(f"\n✅ Found ChatMessageContent schema")
                properties = chat_message_content.get("properties", {})
                
                expected_props = ["type", "text", "image_url", "video_url", "frames"]
                for prop in expected_props:
                    if prop in properties:
                        description = properties[prop].get("description", "No description")
                        print(f"   ✅ {prop}: {description}")
                    else:
                        print(f"   ❌ Missing property: {prop}")
                        
            else:
                print(f"❌ ChatMessageContent schema not found")
                
        else:
            print(f"❌ Failed to retrieve OpenAPI schema: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error checking API documentation: {e}")

def test_sample_multimodal_request():
    """Test a sample multimodal request to ensure it works"""
    
    print(f"\n🧪 Testing Sample Multimodal Request")
    print("=" * 60)
    
    # Create a simple test image (small base64 encoded image)
    test_image_b64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    
    request_data = {
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
                            "url": f"data:image/jpeg;base64,{test_image_b64}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 50,
        "temperature": 0.7
    }
    
    try:
        print("📡 Sending multimodal request...")
        response = requests.post(
            "http://localhost:8000/v1/chat/completions",
            json=request_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Multimodal request successful!")
            
            choices = result.get("choices", [])
            if choices:
                message = choices[0].get("message", {})
                content = message.get("content", "")
                print(f"📝 Response: {content[:100]}...")
            else:
                print(f"❌ No choices in response")
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"📄 Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing multimodal request: {e}")

def main():
    """Main test function"""
    
    print("🎭 VILA Server API Documentation Verification")
    print("Checking if API docs show correct multimodal format")
    print("=" * 60)
    
    # Test 1: Check API documentation
    test_api_documentation()
    
    # Test 2: Test actual multimodal request
    test_sample_multimodal_request()
    
    print(f"\n" + "=" * 60)
    print("✅ API Documentation Test Complete!")
    print("📋 Check http://localhost:8000/docs#/default/chat_completions_v1_chat_completions_post")
    print("🎯 The 'Try it out' example should now show proper multimodal format")

if __name__ == "__main__":
    main()