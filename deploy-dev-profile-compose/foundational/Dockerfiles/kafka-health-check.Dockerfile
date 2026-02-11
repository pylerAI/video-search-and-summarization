# Dockerfile specifically for Kafka health check
# Uses Confluent Kafka image with all Kafka tools

FROM confluentinc/cp-kafka:8.1.1

# Install jq in a user-writable location with architecture detection
RUN mkdir -p /home/appuser/jqbin && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        JQ_URL="https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-linux-amd64"; \
    elif [ "$ARCH" = "aarch64" ]; then \
        JQ_URL="https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-linux-arm64"; \
    else \
        echo "Unsupported architecture: $ARCH" && exit 1; \
    fi && \
    curl -L -o /home/appuser/jqbin/jq "$JQ_URL" && \
    chmod +x /home/appuser/jqbin/jq

# Copy Kafka health check script
COPY --chmod=755 ./broker-health-check/scripts/check-kafka-health.sh /scripts/check-kafka-health.sh

USER appuser

# Direct entrypoint to Kafka health check script
ENTRYPOINT ["/scripts/check-kafka-health.sh"]
