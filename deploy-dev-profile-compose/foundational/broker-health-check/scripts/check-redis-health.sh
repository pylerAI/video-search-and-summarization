#!/bin/bash
set -euo pipefail

echo "Redis health check service started..."

# Configuration with defaults
MAX_RETRIES=${MAX_RETRIES:-60}                        # Max retries for Redis connection
RETRY_INTERVAL=${RETRY_INTERVAL:-2}                   # Seconds between retries

echo "Configuration:"
echo "  MAX_RETRIES: $MAX_RETRIES ($(($MAX_RETRIES * $RETRY_INTERVAL))s timeout)"
echo "  RETRY_INTERVAL: ${RETRY_INTERVAL}s"

echo "Waiting for Redis to be ready..."

# Wait for Redis to be reachable
redis_retry_count=0
echo "Waiting for Redis at localhost:6379 (max ${MAX_RETRIES} retries)..."

while [ $redis_retry_count -lt $MAX_RETRIES ]; do
    if nc -z localhost 6379 2>/dev/null; then
        echo "✓ Redis is reachable after $redis_retry_count retries"
        break
    fi
    
    redis_retry_count=$((redis_retry_count + 1))
    echo "[$redis_retry_count/$MAX_RETRIES] Waiting for Redis..."
    sleep $RETRY_INTERVAL
done

if [ $redis_retry_count -eq $MAX_RETRIES ]; then
    echo "❌ ERROR: Redis at localhost:6379 is not reachable after $MAX_RETRIES retries with $RETRY_INTERVAL seconds interval"
    exit 1
fi

echo "✅ Redis health check completed successfully"
exit 0

