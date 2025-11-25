#!/bin/bash

# Monitor Railway deployment continuously
set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-d4fce5af-640b-4097-a588-c8768d254f10}"
export RAILWAY_TOKEN="$RAILWAY_TOKEN"

echo "🚂 Railway Deployment Monitor"
echo "=============================="
echo ""
echo "Monitoring deployment status..."
echo "Press Ctrl+C to stop"
echo ""

# Check every 10 seconds
while true; do
    clear
    echo "🚂 Railway Deployment Monitor - $(date)"
    echo "========================================"
    echo ""
    
    if command -v railway &> /dev/null; then
        if railway whoami &>/dev/null; then
            echo "✅ Authenticated"
            echo ""
            
            if [ -f ".railway/project.toml" ] || [ -f "railway.toml" ]; then
                echo "📊 Project Status:"
                railway status 2>&1 | head -10
                echo ""
                
                echo "📋 Latest Logs (last 20 lines):"
                echo "-------------------------------"
                railway logs 2>&1 | tail -20
            else
                echo "⚠️  No project linked"
            fi
        else
            echo "⚠️  Not authenticated"
        fi
    else
        echo "❌ Railway CLI not installed"
        echo "   Install: npm install -g @railway/cli"
    fi
    
    echo ""
    echo "Next update in 10 seconds... (Ctrl+C to stop)"
    sleep 10
done

