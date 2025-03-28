# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with clean cache to reduce image size
RUN npm ci --quiet && npm cache clean --force

# Stage 2: Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and built node modules from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY package.json package-lock.json* ./

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3006

# OpenAI API configuration
# NOTE: The actual API key should be provided at runtime, not built into the image
# You can provide it using Docker secrets, environment variables, or config files
ENV OPENAI_API_KEY=""

# Expose the port the app runs on
EXPOSE 3006

# Set health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3006/health || exit 1

# Start the application
CMD ["npm", "start"]
