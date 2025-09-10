#start.sh
#!/bin/bash
set -euo pipefail

MODEL="${MODEL_PATH:-${MODEL_NAME:-Qwen/Qwen2.5-VL-32B-Instruct}}"
echo "Using model: ${MODEL}"

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
DOWNLOAD_DIR="${HF_HOME:-/root/.cache/huggingface}"

TP="${TENSOR_PARALLEL_SIZE:-${VLLM_TENSOR_PARALLEL_SIZE:-1}}"

# VLLM serve에서는 모델을 위치 인수로 지정
ARGS=("${MODEL}" --host "${HOST}" --port "${PORT}" --download-dir "${DOWNLOAD_DIR}")

# Many community models (incl. some VLMs) require this
if [[ "${TRUST_REMOTE_CODE:-true}" == "true" ]]; then
  ARGS+=(--trust-remote-code)
fi

[[ -n "${GPU_MEMORY_UTILIZATION:-}" ]] && ARGS+=(--gpu-memory-utilization "${GPU_MEMORY_UTILIZATION}")
[[ -n "${MAX_MODEL_LEN:-}" ]] && ARGS+=(--max-model-len "${MAX_MODEL_LEN}")
[[ -n "${TP}" && "${TP}" != "1" ]] && ARGS+=(--tensor-parallel-size "${TP}")
[[ -n "${VLLM_API_KEY:-}" ]] && ARGS+=(--api-key "${VLLM_API_KEY}")

[[ -n "${EXTRA_VLLM_ARGS:-}" ]] && ARGS+=(${EXTRA_VLLM_ARGS})

echo "Starting: vllm serve ${ARGS[*]}"
exec vllm serve "${ARGS[@]}"
