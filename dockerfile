# STAGE 1: Install dependencies and build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies including Python
RUN apk add --no-cache python3 make g++

# Enable Corepack (Yarn) and install deps with caching
ENV NODE_ENV=production
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .

# Build the Next.js app
RUN yarn build

# STAGE 2: Run the app with Next.js
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN corepack enable

# Install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --ignore-scripts && yarn cache clean

# Copy build artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose the Next.js default port
EXPOSE 3000

# Start the server
CMD ["yarn", "start"]