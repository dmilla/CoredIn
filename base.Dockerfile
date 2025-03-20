# Step 1: Build the application
FROM node:22.10-alpine3.20 AS builder

ENV NODE_OPTIONS=--max_old_space_size=8192

WORKDIR /coredin

COPY . .

# Install deps required for building docker from Mac OS
RUN apk add --no-cache python3 make g++ gcc

RUN yarn install
RUN yarn workspace @coredin/shared build