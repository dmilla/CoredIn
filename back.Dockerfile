# Step 1: Build the application
FROM coredin/base:latest AS builder
RUN yarn workspace @coredin/backend prepare
RUN yarn workspace @coredin/backend build

# Step 2: Set up the production environment
FROM node:22.10-alpine3.20
# Install deps required for building docker from Mac OS
RUN apk add --no-cache python3 make g++ gcc

# Step 3: Copy 
COPY --from=builder coredin/packages/backend/dist app/packages/backend/dist
COPY --from=builder coredin/packages/backend/config app/packages/backend/config
COPY --from=builder coredin/packages/backend/db app/packages/backend/db
COPY --from=builder coredin/packages/backend/package.json app/packages/backend
COPY --from=builder coredin/packages/backend/tsconfig.json app/packages/backend
COPY --from=builder coredin/packages/shared/dist app/packages/shared/dist
COPY --from=builder coredin/packages/shared/package.json app/packages/shared
COPY --from=builder coredin/package.json app/
COPY --from=builder coredin/yarn.lock app/
COPY --from=builder coredin/.yarnrc.yml app/
COPY --from=builder coredin/.yarn app/.yarn

# Step 4: Install deps required for prod (nestJs build doesn't include them)
WORKDIR /app
RUN yarn workspaces focus @coredin/backend --production

# Step 5: Install curl required for health check
RUN apk add --no-cache curl

# Step 6: Execute pending migrations and run app
EXPOSE 3000
WORKDIR /app/packages/backend
CMD yarn typeorm:migrate && node dist/main.js