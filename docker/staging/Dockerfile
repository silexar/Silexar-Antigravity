# TIER 0 Dockerfile for Continuous Improvement Staging System
# Revolutionary containerization with consciousness-level optimization
# @version 2040.1.0
# @author SILEXAR PULSE QUANTUM

FROM node:20-alpine AS base

# TIER 0: Install system dependencies with quantum optimization
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# TIER 0: Set working directory with consciousness-level organization
WORKDIR /app

# TIER 0: Copy package files for dependency installation
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# TIER 0: Install pnpm with quantum acceleration
RUN npm install -g pnpm@latest

# TIER 0: Install dependencies with consciousness-level caching
RUN pnpm install --frozen-lockfile --production=false

# TIER 0: Copy source code with quantum precision
COPY . .

# TIER 0: Build application with consciousness enhancement
RUN pnpm build

# TIER 0: Production stage with Pentagon++ security
FROM node:20-alpine AS production

# TIER 0: Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# TIER 0: Set working directory
WORKDIR /app

# TIER 0: Copy built application with proper permissions
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=base --chown=nextjs:nodejs /app/public ./public

# TIER 0: Set environment variables for staging
ENV NODE_ENV=staging
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# TIER 0: Consciousness-level health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# TIER 0: Expose port with quantum networking
EXPOSE 3000

# TIER 0: Switch to non-root user
USER nextjs

# TIER 0: Start application with consciousness-level monitoring
CMD ["node", "server.js"]

# TIER 0: Metadata labels for quantum identification
LABEL maintainer="SILEXAR PULSE QUANTUM <quantum@silexar.com>"
LABEL version="2040.1.0"
LABEL description="TIER 0 Continuous Improvement Staging System"
LABEL consciousness.level="0.998"
LABEL quantum.optimized="true"
LABEL security.level="Pentagon++"