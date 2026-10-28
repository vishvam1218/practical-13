# ==============================================================================
# Practical 11: Containerization with Docker and Docker Compose
# Service: Backend Node.js / Express REST API
# Student: Vishvam Patel (24IT110) | CHARUSAT - ITUE301
# ==============================================================================

# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package descriptors for layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# ==============================================================================
# Stage 2: Production Minimal Runtime
FROM node:20-alpine

# Set secure production environment variables
ENV NODE_ENV=production \
    PORT=5001 \
    DOCKER_CONTAINER=true

WORKDIR /usr/src/app

# Install dumb-init for proper PID 1 signal forwarding & curl for healthcheck
RUN apk add --no-cache dumb-init curl

# Create non-root system user for security
USER node

# Copy dependencies and application source from builder with non-root ownership
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

# Expose backend port
EXPOSE 5001

# Healthcheck to verify Express API responsiveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5001/api || exit 1

# Launch using dumb-init to handle SIGINT/SIGTERM gracefully
CMD ["dumb-init", "node", "server.js"]
