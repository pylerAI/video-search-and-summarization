#!/bin/bash
set -e

echo "Starting VILA server..."

# Initialize conda
source ~/miniconda3/etc/profile.d/conda.sh
conda activate vila

# Set default environment variables if not already set
export VILA_PORT=${VILA_PORT:-8001}
export VILA_MODEL_PATH=${VILA_MODEL_PATH:-"Efficient-Large-Model/VILA1.5-3b"}
export VILA_CONV_MODE=${VILA_CONV_MODE:-"auto"}
export VILA_MODEL_TYPE=${VILA_MODEL_TYPE:-"vila-1.5"}
export VILA_TRT_LLM_MODE=${VILA_TRT_LLM_MODE:-"fp16"}
export VILA_BATCH_SIZE=${VILA_BATCH_SIZE:-"1"}
export NGC_MODEL_CACHE=${NGC_MODEL_CACHE:-"$HOME/.via/ngc_model_cache"}

# Set CUDA environment variables
export CUDA_LAUNCH_BLOCKING=1
export TORCH_USE_CUDA_DSA=1
export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
export TORCH_DTYPE=float16
export DEVICE_MAP=auto
export CUDA_HOME="/usr/local/cuda"
export TORCH_CUDA_ARCH_LIST="10.0"

# Create cache directory if it doesn't exist
mkdir -p "$NGC_MODEL_CACHE"

# Check if NGC_API_KEY is set for NGC models
if [[ "$VILA_MODEL_PATH" == ngc:* ]] && [ -z "$NGC_API_KEY" ]; then
    echo "Error: NGC_API_KEY environment variable must be set for NGC models."
    echo "Set it with: export NGC_API_KEY=your_api_key"
    exit 1
fi

echo "Configuration:"
echo "  Port: $VILA_PORT"
echo "  Model Path: $VILA_MODEL_PATH"
echo "  Conversation Mode: $VILA_CONV_MODE"
echo "  Model Type: $VILA_MODEL_TYPE"
echo "  TRT Mode: $VILA_TRT_LLM_MODE"
echo "  Batch Size: $VILA_BATCH_SIZE"
echo "  NGC Cache: $NGC_MODEL_CACHE"

# Run the server
echo "Starting server on port $VILA_PORT..."
python serving/server.py \
    --port "$VILA_PORT" \
    --model-path "$VILA_MODEL_PATH" \
    --conv-mode "$VILA_CONV_MODE" \
    --model-type "$VILA_MODEL_TYPE" \
    --trt-llm-mode "$VILA_TRT_LLM_MODE" \
    --vlm-batch-size "$VILA_BATCH_SIZE"
