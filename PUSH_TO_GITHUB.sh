#!/bin/bash

# Script to push code to GitHub

echo "📤 Pushing to GitHub"
echo "===================="
echo ""

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    echo ""
    echo "Option 1: Use GitHub CLI (Recommended)"
    echo "--------------------------------------"
    echo "1. Login to GitHub CLI:"
    echo "   gh auth login"
    echo ""
    echo "2. Create repository and push:"
    echo "   gh repo create web-ui-ux-testing-tool --public --source=. --remote=origin --push"
    echo ""
else
    echo "⚠️  GitHub CLI not found"
    echo ""
fi

echo "Option 2: Manual Upload"
echo "----------------------"
echo "1. Go to https://github.com/new"
echo "2. Create repository: web-ui-ux-testing-tool"
echo "3. DO NOT initialize with README/gitignore"
echo "4. Copy the commands GitHub shows you"
echo ""
echo "Or use these commands (replace YOUR_USERNAME):"
echo ""
echo "git remote add origin https://github.com/YOUR_USERNAME/web-ui-ux-testing-tool.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""


