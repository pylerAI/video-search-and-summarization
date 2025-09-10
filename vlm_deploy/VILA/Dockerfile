FROM nvcr.io/nvidia/pytorch:25.01-py3

WORKDIR /app

RUN curl https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -o ~/miniconda.sh \
    && sh ~/miniconda.sh -b -p /opt/conda \
    && rm ~/miniconda.sh

ENV PATH /opt/conda/bin:$PATH


# Conda Terms of Service 승인 (이 부분이 추가됨)
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

# PS3 및 패키지 의존성 문제 해결 (빌드 시점에 처리)

RUN conda run -n vila pip install ps3-torch --no-deps && \
    conda run -n vila pip install timm && \
    conda run -n vila pip install triton && \
    conda run -n vila pip install tiktoken ftfy wcwidth

RUN conda run -n vila pip install opencv-python
RUN conda run -n vila pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
RUN conda run -n vila pip install -U "deepspeed>=0.14.4"

RUN conda run -n vila pip uninstall -y flash-attn flash_attn  
RUN conda run -n vila pip install -U ninja packaging   
ENV CUDA_HOME="/usr/local/cuda-12.8"
ENV TORCH_CUDA_ARCH_LIST="10.0"
RUN conda run -n vila pip install --no-build-isolation flash-attn

COPY serving/server.py serving/server.py

ENV VILA_PORT=8001
ENV VILA_MODEL_PATH="Efficient-Large-Model/VILA1.5-40b"
ENV VILA_CONV_MODE="auto"

CMD conda run -n vila --no-capture-output python -u -W ignore serving/server.py --port $VILA_PORT --model-path "$VILA_MODEL_PATH" --conv-mode $VILA_CONV_MODE
