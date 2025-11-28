######################################################################################################
# SPDX-FileCopyrightText: Copyright (c) 2024-2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: LicenseRef-NvidiaProprietary
#
# NVIDIA CORPORATION, its affiliates and licensors retain all intellectual
# property and proprietary rights in and to this material, related
# documentation and any modifications thereto. Any use, reproduction,
# disclosure or distribution of this material and related documentation
# without an express license agreement from NVIDIA CORPORATION or
# its affiliates is strictly prohibited.
######################################################################################################

ARG BASE_IMAGE="nvcr.io/nvidia/blueprint/vss-engine-base:2.4.0"
FROM $BASE_IMAGE

RUN --mount=type=bind,source=binaries/gradio_videotimeline-1.0.2-py3-none-any.whl,target=/tmp/gradio_videotimeline-1.0.2-py3-none-any.whl \
    pip install --no-deps /tmp/gradio_videotimeline-1.0.2-py3-none-any.whl

RUN touch -m 600 /root/.ssh/known_hosts && \
    ssh-keyscan github.com > /root/.ssh/known_hosts

RUN --mount=type=ssh \
    git clone git@github.com:pylerAI/context-aware-rag.git -b main-1.0.0 /workspace/vss-ctx-rag && \
    pip install -e /workspace/vss-ctx-rag --no-deps && \
    git clone git@github.com:pylerAI/video-search-and-summarization.git -b develop-2.4.0 /workspace/vss

# Make symlinks for the python source code

RUN --mount=type=bind,source=config,target=/tmp/via-src/config \
    --mount=type=bind,source=docker,target=/tmp/via-src/docker \
    cd /tmp/via-src/ \
    && docker/copy_sources.sh /workspace/vss/src/vss-engine/src /opt/nvidia/via \
    && docker/copy_configs.sh /workspace/vss/src/vss-engine/config /opt/nvidia/via


RUN mkdir -p /opt/nvidia/via/config/overrides && \
    ln -s -v /workspace/vss/src/vss-engine/config/MOT_EVAL_config_fusion.yml /opt/nvidia/via/config/ && \
    ln -s /workspace/vss/src/vss-engine/config/config_tracker_NvDCF_accuracy_interval1.yml /opt/nvidia/via/config/default_tracker_config.yml && \
    ln -s /workspace/vss/src/vss-engine/config/config_tracker_NvDCF_accuracy_SAM2.yml /opt/nvidia/via/config/config_tracker_NvDCF_accuracy_SAM2.yml && \
    ln -s /workspace/vss/src/vss-engine/config/overrides/overrides_cv_accuracy_mode.yaml /opt/nvidia/via/config/overrides/overrides_cv_accuracy_mode.yaml && \
    ln -s /workspace/vss/src/vss-engine/start_via.sh /opt/nvidia/via/start_via.sh


#To allow helm chart start script to copy updated config:
RUN chmod -R 777 /opt/nvidia/via/guardrails_config/
ENV PATH=$PATH:/opt/nvidia/via/
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/opt/tritonserver/lib/


WORKDIR /opt/nvidia/via/

ENTRYPOINT ["/opt/nvidia/via/start_via.sh"]