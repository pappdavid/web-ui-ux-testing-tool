# RunPod Agent Worker Dockerfile
FROM node:18-bullseye

# Install Playwright system dependencies
RUN npx playwright@1.45.0 install-deps

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install production dependencies
RUN npm ci --only=production

# Install tsx for TypeScript execution
RUN npm install -g tsx

# Copy application code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Install Playwright browsers
RUN npx playwright@1.45.0 install chromium

# Set environment variables
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Health check (optional)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Run the agent worker
CMD ["tsx", "src/agentWorker/index.ts"]

