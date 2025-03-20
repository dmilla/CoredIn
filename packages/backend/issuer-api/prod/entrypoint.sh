#!/bin/bash

echo "Starting Issuer API"
# We check if the ISSUER_ADDRESS env var is set (for ALB setup), and set it otherwise
if [[ -z "${ELB_ADDRESS}" ]]; then
    echo "ELB_ADDRESS not set, using ECS_CONTAINER_METADATA_URI_V4 to get the IP address of the container"
    curl ${ECS_CONTAINER_METADATA_URI_V4} > /tmp/metadata
    export ISSUER_ADDRESS=$(cat /tmp/metadata | jq -r '.Networks[0].IPv4Addresses[0]')
else
    export ISSUER_ADDRESS="${ELB_ADDRESS}"
fi
echo "ISSUER_ADDRESS: ${ISSUER_ADDRESS}"

# This will exec the CMD from the Dockerfile
exec "$@"