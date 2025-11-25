#!/bin/bash

# Commands to upload to GitHub
# Run these commands one by one

echo "📤 Uploading to GitHub"
echo "======================"
echo ""

echo "Step 1: Login to GitHub CLI"
echo "---------------------------"
echo "Run: gh auth login"
echo "(This will open your browser to authenticate)"
echo ""

echo "Step 2: Create repository and push"
echo "-----------------------------------"
echo "Run: gh repo create web-ui-ux-testing-tool --public --source=. --remote=origin --push"
echo ""

echo "Or use manual method:"
echo "1. Go to https://github.com/new"
echo "2. Create repo: web-ui-ux-testing-tool"
echo "3. Then run:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/web-ui-ux-testing-tool.git"
echo "   git branch -M main"
echo "   git push -u origin main"


