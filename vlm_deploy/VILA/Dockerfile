FROM nvcr.io/nvidia/pytorch:25.01-py3
# Install additional system packages
RUN apt-get update && apt-get install -y libgl1 wget

# Install NGC CLI for model downloads
RUN wget -O ngccli_linux.zip https://ngc.nvidia.com/downloads/ngccli_linux.zip && \
    unzip ngccli_linux.zip && \
    chmod u+x ngc-cli/ngc && \
    mv ngc-cli/ngc /usr/local/bin/ngc && \
    rm -rf ngc-cli ngccli_linux.zip
WORKDIR /app

RUN curl https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -o ~/miniconda.sh \
 && sh ~/miniconda.sh -b -p /opt/conda \
 && rm ~/miniconda.sh

ENV PATH=/opt/conda/bin:$PATH

# Conda Terms of Service 승인
RUN conda config --set allow_conda_downgrades true && \
 conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/main && \
 conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/r

COPY pyproject.toml pyproject.toml
COPY llava llava

COPY environment_setup.sh environment_setup.sh
RUN bash environment_setup.sh vila

# CUDA 환경 변수 설정 (빌드 시점에 적용)
ENV CUDA_LAUNCH_BLOCKING=1
ENV TORCH_USE_CUDA_DSA=1
ENV PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
ENV TORCH_DTYPE=float16
ENV DEVICE_MAP=auto

# OpenCV headless 버전 설치 (GUI 의존성 없음)
RUN conda run -n vila pip install opencv-python-headless

RUN conda run -n vila pip install ps3-torch --no-deps && \
 conda run -n vila pip install timm && \
 conda run -n vila pip install triton && \
 conda run -n vila pip install tiktoken ftfy wcwidth

RUN conda run -n vila pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
RUN conda run -n vila pip install -U "deepspeed>=0.14.4"
RUN conda run -n vila pip uninstall -y flash-attn flash_attn
RUN conda run -n vila pip install -U ninja packaging
ENV CUDA_HOME="/usr/local/cuda-12.8"
ENV TORCH_CUDA_ARCH_LIST="10.0"
RUN conda run -n vila pip install --no-build-isolation flash-attn

# Install additional Python packages for NGC and logging
RUN conda run -n vila pip install loguru requests

# Install TensorRT-LLM for engine building (if needed)
# Note: This may require specific CUDA/TensorRT versions
# RUN conda run -n vila pip install tensorrt-llm

COPY serving/server.py serving/server.py
COPY model_setup.py model_setup.py
COPY ngc_model_downloader.py ngc_model_downloader.py
COPY trt_helper/ trt_helper/

ENV VILA_PORT=8001
ENV VILA_MODEL_PATH="Efficient-Large-Model/VILA1.5-3b"
ENV VILA_CONV_MODE="auto"
ENV VILA_MODEL_TYPE="vila-1.5"
ENV VILA_TRT_LLM_MODE="fp16"
ENV VILA_BATCH_SIZE="1"
# Set NGC_API_KEY as an environment variable (to be passed at runtime)
ENV NGC_API_KEY=""
# Set NGC model cache directory
ENV NGC_MODEL_CACHE="/app/.via/ngc_model_cache"

CMD conda run -n vila --no-capture-output python -u -W ignore serving/server.py \
    --port $VILA_PORT \
    --model-path "$VILA_MODEL_PATH" \
    --conv-mode $VILA_CONV_MODE \
    --model-type $VILA_MODEL_TYPE \
    --trt-llm-mode $VILA_TRT_LLM_MODE \
    --vlm-batch-size $VILA_BATCH_SIZE
