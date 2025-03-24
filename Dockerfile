FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --quiet

# Copy application code
COPY . .

# Set environment variables (customize as needed)
ENV NODE_ENV=production
ENV PORT=3006

# Expose the port the app runs on
EXPOSE 3006

# Set health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3006/health || exit 1

# Start the application
CMD ["npm", "start"]