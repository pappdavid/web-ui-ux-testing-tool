#!/bin/bash

# Test Agent Worker Locally
# Usage: ./scripts/test-agent-local.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}Testing Agent Worker Locally${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo ""

# Check if .env.local exists in project root
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env.local not found${NC}"
    echo ""
    echo "Create .env.local with:"
    echo ""
    cat << 'EOF'
RAILWAY_API_BASE_URL=http://localhost:3000
RAILWAY_INTERNAL_API_TOKEN=75f3a7ad325eb86a619c75ac1f5e3bcb8ba32225fea85958411106fb656c7250
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
OPENAI_MODEL=gpt-4o-mini
PLAYWRIGHT_BROWSERS_PATH=./.playwright
EOF
    exit 1
fi

# Check if Next.js app is running
echo -e "${BLUE}Checking if Next.js app is running on port 3000...${NC}"
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}Error: Next.js app is not running on port 3000${NC}"
    echo ""
    echo "Start the app first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Next.js app is running${NC}"
echo ""

# Load environment variables
echo -e "${BLUE}Loading environment variables from .env.local...${NC}"
export $(grep -v '^#' .env.local | xargs)

# Verify required variables
REQUIRED_VARS=("RAILWAY_API_BASE_URL" "RAILWAY_INTERNAL_API_TOKEN" "OPENAI_API_KEY")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Error: ${var} not set in .env.local${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ All required variables set${NC}"
echo ""
echo "Configuration:"
echo "  Railway API: ${RAILWAY_API_BASE_URL}"
echo "  OpenAI Model: ${OPENAI_MODEL:-gpt-4o-mini}"
echo ""

# Check if tsx is installed
if ! command -v tsx &> /dev/null; then
    echo -e "${YELLOW}Installing tsx globally...${NC}"
    npm install -g tsx
fi

# Run the worker
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Starting Agent Worker${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop${NC}"
echo ""

tsx src/agentWorker/index.ts

