# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

# Copy built assets
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Change ownership
RUN chown -R sveltekit:nodejs /app
USER sveltekit

# Configurable port - set at runtime with -e PORT
EXPOSE ${PORT:-7777}

ENV HOST=0.0.0.0
ENV PORT=${PORT:-7777}

CMD ["node", "build"]
