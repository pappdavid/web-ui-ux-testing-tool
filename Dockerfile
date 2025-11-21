FROM node:18-slim AS base

# Install dependencies only when needed
FROM base AS deps
# Install system dependencies for Playwright and Prisma on Debian
RUN apt-get update && apt-get install -y \
    libssl-dev \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Copy Prisma schema before npm ci (needed for postinstall script)
COPY prisma ./prisma

# Install dependencies (this will run prisma generate via postinstall)
RUN npm ci

# Install Playwright browsers (without system deps since we installed them manually)
# Playwright will download its own Chromium, but we've installed the system dependencies
# Set custom browser path for easier copying to production stage
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.playwright
RUN mkdir -p /app/.playwright && \
    npx playwright install chromium --with-deps || \
    npx playwright install chromium || \
    (echo "Browser installation in deps stage completed")

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set Docker build flag
ENV DOCKER_BUILD=true

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DOCKER_BUILD=true

# Install Playwright runtime dependencies for Debian
RUN apt-get update && apt-get install -y \
    libssl-dev \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
# Next.js standalone output includes public files, so we don't need to copy separately
# But we'll create the directory structure first
RUN mkdir -p ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/playwright ./node_modules/playwright
COPY --from=builder /app/prisma ./prisma

# Install Playwright browsers in production image
# Copy browsers from deps stage where they were already installed
# Set environment variable for browser location
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.playwright

# Copy browsers from deps stage (where they were installed)
# Playwright installs browsers to /app/.playwright because we set PLAYWRIGHT_BROWSERS_PATH
RUN mkdir -p /app/.playwright

# Copy browsers from deps stage
COPY --from=deps --chown=nextjs:nodejs /app/.playwright /app/.playwright

# If browsers weren't copied (directory is empty), install them using node directly
# Use node to run playwright CLI since npx might not be available
RUN if [ ! -d /app/.playwright/chromium* ] && [ -z "$(ls -A /app/.playwright 2>/dev/null)" ]; then \
    cd /app && \
    node node_modules/playwright/cli.js install chromium || \
    echo "Browser installation attempted"; \
    fi

# Ensure browsers directory is accessible
RUN chown -R nextjs:nodejs /app/.playwright || true

# Verify browsers were installed
RUN test -d /app/.playwright && ls -la /app/.playwright || echo "Browser installation verification"

# Ensure the server.js is executable and in the right location
RUN chmod +x server.js 2>/dev/null || true

# Create storage directory
RUN mkdir -p /app/storage && chown -R nextjs:nodejs /app/storage

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Ensure PLAYWRIGHT_BROWSERS_PATH is set at runtime
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.playwright

CMD ["node", "server.js"]

