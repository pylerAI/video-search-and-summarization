# Dockerfile specifically for Redis health check
# Uses lightweight Alpine image

FROM alpine:3.23.2

# Install necessary tools for port checking
RUN apk add --no-cache \
    bash \
    netcat-openbsd

# Copy Redis health check script
COPY --chmod=755 ./broker-health-check/scripts/check-redis-health.sh /scripts/check-redis-health.sh

# Direct entrypoint to Redis health check script
ENTRYPOINT ["/scripts/check-redis-health.sh"]
