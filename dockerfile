# STAGE 1: Install dependencies and build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies including Python
RUN apk add --no-cache python3 make g++

# Enable Corepack (Yarn Berry) and install deps with caching
ENV NODE_ENV=production \
    YARN_ENABLE_IMMUTABLE_INSTALLS=true \
    YARN_CACHE_FOLDER=/yarn-cache
RUN corepack enable && corepack prepare yarn@4.5.1 --activate

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# Copy source files
COPY . .

# Build the Next.js app
RUN yarn build

# STAGE 2: Run the app with Next.js
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    YARN_ENABLE_IMMUTABLE_INSTALLS=true \
    YARN_CACHE_FOLDER=/yarn-cache
RUN corepack enable && corepack prepare yarn@4.5.1 --activate

# Copy build artifacts and production dependencies from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules

# Expose the Next.js default port
EXPOSE 3000

# Start the server
CMD ["yarn", "start"]