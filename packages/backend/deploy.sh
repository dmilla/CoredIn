#!/bin/bash

# Login into AWS ECR
aws ecr get-login-password --region $COREDIN_AWS_REGION | docker login --username AWS --password-stdin $COREDIN_ECR_URL

# Tag and push docker
docker tag coredin/back:latest $COREDIN_ECR_URL/coredin/backend:x86
docker push $COREDIN_ECR_URL/coredin/backend:x86

# Force ECS task restart with new image
aws ecs update-service --cluster coredin-backend-cluster --service coredin-backend-service --force-new-deployment