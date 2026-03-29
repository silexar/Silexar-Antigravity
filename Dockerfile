# SILEXAR PULSE - Production Dockerfile (Next.js 16)
# Multi-stage build for optimized image size and security

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm ci && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set production environment for build optimizations
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application (standalone output)
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

# Install security updates
RUN apk upgrade --no-cache && \
    apk add --no-cache \
    dumb-init \
    curl

# Create non-root user
RUN addgroup -g 1000 silexar && \
    adduser -D -u 1000 -G silexar silexar

WORKDIR /app

# Copy Next.js standalone build
COPY --from=builder --chown=silexar:silexar /app/.next/standalone ./
COPY --from=builder --chown=silexar:silexar /app/.next/static ./.next/static
COPY --from=builder --chown=silexar:silexar /app/public ./public
COPY --from=builder --chown=silexar:silexar /app/drizzle ./drizzle

# Create necessary directories
RUN mkdir -p /app/.cache /tmp && \
    chown -R silexar:silexar /app/.cache /tmp

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Switch to non-root user
USER silexar

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js server (standalone mode)
CMD ["node", "server.js"]

# Labels
LABEL maintainer="Silexar Pulse Team"
LABEL version="2.0.0"
LABEL description="Silexar Pulse - Enterprise Advertising Management Platform"
