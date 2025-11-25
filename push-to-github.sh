#!/bin/bash

# Quick script to push to GitHub
# Run this after authenticating with: gh auth login

set -e

echo "📤 Pushing to GitHub"
echo "===================="
echo ""

# Check if already has remote
if git remote get-url origin &>/dev/null; then
    echo "✅ Remote 'origin' already configured"
    echo "Pushing to existing remote..."
    git push -u origin main
else
    echo "Creating new repository on GitHub..."
    
    # Try to create repo using GitHub CLI
    if command -v gh &> /dev/null && gh auth status &>/dev/null; then
        echo "Using GitHub CLI..."
        gh repo create web-ui-ux-testing-tool --public --source=. --remote=origin --push
    else
        echo "❌ GitHub CLI not authenticated"
        echo ""
        echo "Please run: gh auth login"
        echo "Then run this script again, or:"
        echo ""
        echo "1. Create repo at https://github.com/new"
        echo "2. Then run:"
        echo "   git remote add origin https://github.com/YOUR_USERNAME/web-ui-ux-testing-tool.git"
        echo "   git push -u origin main"
        exit 1
    fi
fi

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "Visit: https://github.com/$(gh repo view --json owner -q .owner.login)/web-ui-ux-testing-tool"


