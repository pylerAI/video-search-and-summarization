#!/bin/bash
set -e

CLUSTER_ID_FILE=/tmp/kafka-data/cluster_id

if [ -f "$CLUSTER_ID_FILE" ]; then
    export KAFKA_CLUSTER_ID=$(cat "$CLUSTER_ID_FILE")
    echo "Found existing Cluster ID from file: $KAFKA_CLUSTER_ID"
else
    # Generate a new cluster ID
    TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%S.%3NZ')
    CLUSTER_STRING="spatial-ai-kafka-cluster-${TIMESTAMP}"
    export KAFKA_CLUSTER_ID=$(echo -n "$CLUSTER_STRING" | base64 | tr -d '\n')
    echo "Generated new Cluster ID: $KAFKA_CLUSTER_ID"
    
    # Ensure directory exists
    mkdir -p $(dirname "$CLUSTER_ID_FILE")
    
    # Save the cluster ID for future use
    echo "$KAFKA_CLUSTER_ID" > "$CLUSTER_ID_FILE"
fi

# Confluent Kafka expects both CLUSTER_ID and KAFKA_CLUSTER_ID
export CLUSTER_ID="$KAFKA_CLUSTER_ID"

# Execute the original Kafka startup script
exec /etc/confluent/docker/run "$@"
