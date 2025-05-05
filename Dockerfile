# Build stage
FROM node:20-alpine AS builder

# Add a non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json yarn.lock ./

# Install dependencies with exact versions for better reproducibility
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine AS production

# Add a non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && \
    # Clean yarn cache to reduce image size
    yarn cache clean && \
    # Set proper permissions
    chown -R appuser:appgroup /app

# Copy built application from builder stage
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# Copy MongoDB and Redis configuration if needed
COPY --from=builder --chown=appuser:appgroup /app/.env* ./

# Switch to non-root user for security
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check to ensure the application is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/health || exit 1

# Expose the application port
EXPOSE ${PORT}

# Start the application
CMD ["node", "dist/main"]
