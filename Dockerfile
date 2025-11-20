FROM node:18-slim AS base

# Install dependencies only when needed
FROM base AS deps
# Install system dependencies for Playwright and Prisma on Debian
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    libssl3 \
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
# But we'll regenerate with correct binary targets after
RUN npm ci

# Regenerate Prisma client with correct binary targets (OpenSSL 3.x)
RUN npx prisma generate

# Install Playwright browsers (without system deps since we installed them manually)
# Playwright will download its own Chromium, but we've installed the system dependencies
RUN npx playwright install chromium

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set Docker build flag
ENV DOCKER_BUILD=true
ENV NODE_ENV=production

# Generate Prisma Client
# Prisma will auto-detect OpenSSL version, but we ensure OpenSSL 3.x is available
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build Next.js (will create standalone output)
RUN npm run build

# Verify standalone output exists
RUN test -f .next/standalone/server.js || (echo "ERROR: standalone build failed" && exit 1)

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DOCKER_BUILD=true

# Install Playwright runtime dependencies for Debian
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    libssl3 \
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
# Next.js standalone output includes server.js in the root
RUN mkdir -p ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma and Playwright dependencies
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/playwright ./node_modules/playwright
COPY --from=builder /app/prisma ./prisma

# Ensure the server.js is executable and exists
RUN test -f server.js && chmod +x server.js || (echo "ERROR: server.js not found" && ls -la && exit 1)

# Create storage directory
RUN mkdir -p /app/storage && chown -R nextjs:nodejs /app/storage

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

