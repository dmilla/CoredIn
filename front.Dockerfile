# Step 1: Build the application
FROM coredin/base:latest AS builder
RUN yarn workspace @coredin/frontend build

# WORKDIR /coredin

# Install dependencies early so that if some files in our app
# change, Docker won't have to download the dependencies again,
# and instead will start from the next step ("COPY . .").
# COPY ./package.json .
# COPY ./yarn.lock .
# COPY ./packages/frontend/package.json ./packages/frontend/
# RUN yarn set version stable
# RUN yarn install
# workspaces focus @coredin/frontend

# You can delete the cache folder after `yarn install` is done.
# RUN rm -rf .yarn/cache

# Copy all files of our app (except files specified in the .dockerignore)
#COPY ./packages/frontend/ ./packages/frontend/
# COPY . .

# Build app
# RUN yarn set version stable
# RUN yarn install
# RUN yarn build
# workspace @coredin/frontend build

# Step 2: Set up the production environment
FROM nginx:stable-alpine
COPY --from=builder coredin/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]