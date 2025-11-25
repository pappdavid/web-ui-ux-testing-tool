#!/bin/bash

# Build and Push Agent Worker Docker Image
# Usage: ./scripts/build-agent-worker.sh <dockerhub-username>

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}Error: Docker Hub username required${NC}"
    echo "Usage: ./scripts/build-agent-worker.sh <dockerhub-username>"
    echo "Example: ./scripts/build-agent-worker.sh davidpapp"
    exit 1
fi

DOCKERHUB_USERNAME=$1
IMAGE_NAME="${DOCKERHUB_USERNAME}/agent-worker"
TAG="latest"
FULL_IMAGE="${IMAGE_NAME}:${TAG}"

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}Building Agent Worker Docker Image${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo ""
echo "Image: ${FULL_IMAGE}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Build from project root with agentWorker Dockerfile
echo -e "${GREEN}Step 1: Building Docker image...${NC}"
docker build \
    -f src/agentWorker/Dockerfile \
    -t "${FULL_IMAGE}" \
    .

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Docker build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Check if logged in to Docker Hub
echo -e "${YELLOW}Step 2: Checking Docker Hub authentication...${NC}"
if ! docker info | grep -q "Username:"; then
    echo -e "${YELLOW}Not logged in to Docker Hub. Logging in...${NC}"
    docker login
fi

# Push to Docker Hub
echo ""
echo -e "${GREEN}Step 3: Pushing to Docker Hub...${NC}"
docker push "${FULL_IMAGE}"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Docker push failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✓ Deployment Package Ready${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Docker Image: ${FULL_IMAGE}"
echo ""
echo "Next Steps:"
echo "1. Go to https://www.runpod.io"
echo "2. Click 'Deploy' > 'Deploy a Container'"
echo "3. Use image: ${FULL_IMAGE}"
echo "4. Set environment variables (see DEPLOYMENT_RUNPOD_AGENT.md)"
echo "5. Deploy and monitor logs"
echo ""

