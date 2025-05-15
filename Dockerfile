# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Install dependencies for packages that require building
RUN apk add --no-cache python3 make g++

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps
# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set NODE_ENV to production
ENV NODE_ENV=production

# Use a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nestjs:nodejs /usr/src/app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /usr/src/app/src/i18n ./dist/i18n
COPY --chown=nestjs:nodejs assets ./assets

# Create directory for logs
RUN mkdir -p logs && chown -R nestjs:nodejs logs

# Switch to non-root user
USER nestjs

# Create a volume for persistent data
VOLUME ["/usr/src/app/assets", "/usr/src/app/logs"]

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/api/v1/health || exit 1

# Expose the application port
EXPOSE ${PORT:-3000}

# Start the application
CMD ["node", "dist/main"]
