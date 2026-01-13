# Multi-stage build for Next.js Frontend
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install additional dependencies that might be needed for build
RUN apk add --no-cache libc6-compat

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (including generated API files if they exist)
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
# Note: NEXT_PUBLIC_API_URL will be set at runtime via docker-compose

# Generate Orval API clients from backend (if backend URL provided via build arg)
# Note: Backend must be running and accessible during build
ARG BACKEND_URL
ENV BACKEND_URL=${BACKEND_URL}

# Install curl for checking backend availability
RUN apk add --no-cache curl

# Try to generate orval if backend is accessible, otherwise use existing files
# This allows building frontend after backend is running
RUN if [ -n "$BACKEND_URL" ] && curl -f --max-time 5 "${BACKEND_URL}/v3/api-docs" > /dev/null 2>&1; then \
      echo "✅ Backend available at ${BACKEND_URL}, generating Orval API clients..."; \
      sed -i "s|http://localhost:8080|${BACKEND_URL}|g" orval.config.ts || true; \
      npx orval && echo "✅ Orval generation successful!" || echo "⚠️  Orval generation had warnings"; \
    else \
      echo "⚠️  Backend not available during build (${BACKEND_URL:-not set})"; \
      echo "📝 Using pre-generated API files (should be generated before Docker build)"; \
      echo "💡 Tip: Use ./build.sh script for proper build order"; \
      if [ ! -d "src/generated/api" ] || [ -z "$(ls -A src/generated/api 2>/dev/null)" ]; then \
        echo "❌ ERROR: No generated API files found!"; \
        echo "   Please run 'npx orval' in Medinova-FE before building Docker image"; \
        echo "   Or use ./build.sh script which handles this automatically"; \
        exit 1; \
      fi; \
    fi

# Build Next.js application with increased memory
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]

