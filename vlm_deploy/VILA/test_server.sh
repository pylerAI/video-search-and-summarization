#!/bin/bash
set -e

# Test script for VILA server
PORT=${VILA_PORT:-8001}
HOST=${VILA_HOST:-localhost}

echo "Testing VILA server at http://$HOST:$PORT"

# Test 1: Health check
echo "Testing health endpoint..."
curl -s "http://$HOST:$PORT/" | jq . || echo "Health check failed"

# Test 2: Simple text completion
echo -e "\nTesting text completion..."
curl -s -X POST "http://$HOST:$PORT/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "vila-1.5",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "max_tokens": 100,
    "temperature": 0.7
  }' | jq . || echo "Text completion test failed"

echo -e "\nTest completed!"
