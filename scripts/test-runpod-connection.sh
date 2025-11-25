#!/bin/bash

# Test RunPod Serverless Connection
# Verifies your RunPod endpoint is accessible

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Your RunPod credentials
RUNPOD_ENDPOINT="https://82nsylciwb4j4p.api.runpod.ai"
RUNPOD_API_KEY="<YOUR_RUNPOD_API_KEY>"

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}Testing RunPod Serverless Connection${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo ""

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${RUNPOD_ENDPOINT}/health" \
  -H "Authorization: Bearer ${RUNPOD_API_KEY}")

HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Health check passed${NC}"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
  exit 1
fi

echo ""

# Test run endpoint with a dummy request
echo -e "${YELLOW}Testing /run endpoint...${NC}"
RUN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${RUNPOD_ENDPOINT}/run" \
  -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"input":{"agentSessionId":"test-connection"}}')

HTTP_CODE=$(echo "$RUN_RESPONSE" | tail -n 1)
BODY=$(echo "$RUN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 202 ]; then
  echo -e "${GREEN}✓ /run endpoint accessible${NC}"
  echo "Response: $BODY"
else
  echo -e "${YELLOW}! /run endpoint responded with HTTP $HTTP_CODE${NC}"
  echo "Response: $BODY"
  echo ""
  echo -e "${YELLOW}Note: This is expected if no workers are running yet.${NC}"
fi

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Connection Test Complete${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Your RunPod endpoint is configured correctly!"
echo ""
echo "Next steps:"
echo "1. Set these variables in Railway dashboard"
echo "2. Wait for Railway to redeploy"
echo "3. Test by creating an agent session"
echo ""

