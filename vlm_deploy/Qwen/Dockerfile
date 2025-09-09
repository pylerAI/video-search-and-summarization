#Dockerfile
FROM vllm/vllm-openai:latest

RUN uv pip install --system git+https://github.com/huggingface/transformers.git

# Vision models often need these (harmless for text-only).
RUN pip install --no-cache-dir pillow torchvision

WORKDIR /app
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 8000
# Useful defaults; override at runtime
ENV MODEL_NAME="" \
    TRUST_REMOTE_CODE="true" \
    PORT="8000"

ENTRYPOINT ["/app/start.sh"]