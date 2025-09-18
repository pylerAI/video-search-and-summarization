# #!/bin/bash
# set -e

# echo "Setting up VILA server environment..."

# # Install system dependencies
# echo "Installing system dependencies..."
# apt update && apt install -y libgl1 wget curl unzip

# # Install NGC CLI for model downloads
# echo "Installing NGC CLI..."
# if [ ! -f "/usr/local/bin/ngc" ]; then
#     wget -O ngccli_linux.zip https://ngc.nvidia.com/downloads/ngccli_linux.zip
#     unzip ngccli_linux.zip
#     chmod u+x ngc-cli/ngc
#     mv ngc-cli/ngc /usr/local/bin/ngc
#     rm -rf ngc-cli ngccli_linux.zip
#     echo "NGC CLI installed successfully"
# else
#     echo "NGC CLI already installed"
# fi

# # Install Miniconda if not already installed
# if [ ! -d "$HOME/miniconda3" ]; then
#     echo "Installing Miniconda..."
#     curl https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -o ~/miniconda.sh
#     bash ~/miniconda.sh -b -p ~/miniconda3
#     rm ~/miniconda.sh
#     echo "Miniconda installed successfully"
# fi

# # Initialize conda for this shell session
# source ~/miniconda3/etc/profile.d/conda.sh
# export PATH="$HOME/miniconda3/bin:$PATH"

# # Accept Conda Terms of Service
# echo "Configuring Conda..."
# conda config --set allow_conda_downgrades true
# conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/main || true
# conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/r || true

# # Run environment setup script (assumes environment_setup.sh exists and works)
# if [ -f "environment_setup.sh" ]; then
#     echo "Running VILA environment setup..."
#     bash environment_setup.sh vila
# else
#     echo "Warning: environment_setup.sh not found. Creating vila environment manually..."
#     conda create -n vila python=3.10 -y
# fi

# # Activate the vila environment
# conda activate vila

# # Set CUDA environment variables
# echo "Setting CUDA environment variables..."
# export CUDA_LAUNCH_BLOCKING=1
# export TORCH_USE_CUDA_DSA=1
# export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
# export TORCH_DTYPE=float16
# export DEVICE_MAP=auto
# export CUDA_HOME="/usr/local/cuda"
# export TORCH_CUDA_ARCH_LIST="10.0"

# # Install Python packages
# echo "Installing Python dependencies..."
# pip install opencv-python-headless
# pip install ps3-torch --no-deps
# pip install timm
# pip install triton
# pip install tiktoken ftfy wcwidth
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
# pip install -U "deepspeed>=0.14.4"
# pip uninstall -y flash-attn flash_attn || true
# pip install -U ninja packaging
# pip install --no-build-isolation flash-attn

# # Install additional dependencies for NGC and logging
# echo "Installing additional dependencies..."
# pip install loguru requests

# echo "Environment setup complete!"

# Set VILA environment variables with defaults
export VILA_PORT=${VILA_PORT:-8001}
export VILA_MODEL_PATH=${VILA_MODEL_PATH:-"ngc:nim/nvidia/vila-1.5-40b:vila-yi-34b-siglip-stage3_1003_video_v8"}
export VILA_CONV_MODE=${VILA_CONV_MODE:-"auto"}
export VILA_MODEL_TYPE=${VILA_MODEL_TYPE:-"vila-1.5"}
export VILA_TRT_LLM_MODE=${VILA_TRT_LLM_MODE:-"fp16"}
export VILA_BATCH_SIZE=${VILA_BATCH_SIZE:-"128"}
export NGC_MODEL_CACHE=${NGC_MODEL_CACHE:-"/tmp/via-ngc-model-cache/"}

# Create cache directory
# mkdir -p "$NGC_MODEL_CACHE"

echo "Environment variables set:"
echo "  VILA_PORT=$VILA_PORT"
echo "  VILA_MODEL_PATH=$VILA_MODEL_PATH"
echo "  VILA_CONV_MODE=$VILA_CONV_MODE"
echo "  VILA_MODEL_TYPE=$VILA_MODEL_TYPE"
echo "  VILA_TRT_LLM_MODE=$VILA_TRT_LLM_MODE"
echo "  VILA_BATCH_SIZE=$VILA_BATCH_SIZE"
echo "  NGC_MODEL_CACHE=$NGC_MODEL_CACHE"

# Check if NGC_API_KEY is set
if [ -z "$NGC_API_KEY" ]; then
    echo "Warning: NGC_API_KEY environment variable not set."
    echo "Set it with: export NGC_API_KEY=your_api_key"
fi

echo "Setup complete! You can now run the server with:"
echo "python serving/server.py --port \$VILA_PORT --model-path \"\$VILA_MODEL_PATH\" --conv-mode \$VILA_CONV_MODE --model-type \$VILA_MODEL_TYPE --trt-llm-mode \$VILA_TRT_LLM_MODE --vlm-batch-size \$VILA_BATCH_SIZE"
