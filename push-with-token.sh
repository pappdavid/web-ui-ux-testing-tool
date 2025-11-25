#!/bin/bash

# Push to GitHub using token
# Usage: GITHUB_TOKEN=your_token ./push-with-token.sh

set -e

REPO_NAME="web-ui-ux-testing-tool"
GITHUB_TOKEN="${GITHUB_TOKEN:-${GH_TOKEN}}"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GitHub token not found"
    echo "Set GITHUB_TOKEN environment variable:"
    echo "  export GITHUB_TOKEN=your_token"
    echo "  ./push-with-token.sh"
    exit 1
fi

echo "📤 Creating repository and pushing to GitHub..."
echo ""

# Get GitHub username from token
USERNAME=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | python3 -c "import sys, json; print(json.load(sys.stdin)['login'])" 2>/dev/null || echo "")

if [ -z "$USERNAME" ]; then
    echo "❌ Invalid token or unable to get username"
    exit 1
fi

echo "✅ Authenticated as: $USERNAME"
echo ""

# Create repository via API
echo "Creating repository: $REPO_NAME"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"Web-based UI/UX Testing Tool with Playwright\",\"public\":true}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "422" ]; then
    if [ "$HTTP_CODE" = "422" ]; then
        echo "⚠️  Repository might already exist, continuing..."
    else
        echo "✅ Repository created"
    fi
    
    # Add remote if not exists
    if ! git remote get-url origin &>/dev/null; then
        git remote add origin "https://${GITHUB_TOKEN}@github.com/${USERNAME}/${REPO_NAME}.git"
    else
        git remote set-url origin "https://${GITHUB_TOKEN}@github.com/${USERNAME}/${REPO_NAME}.git"
    fi
    
    echo "Pushing code..."
    git branch -M main
    git push -u origin main
    
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Repository: https://github.com/${USERNAME}/${REPO_NAME}"
else
    echo "❌ Failed to create repository"
    echo "HTTP Code: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi


á