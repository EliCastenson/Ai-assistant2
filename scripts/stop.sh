#!/bin/bash

# AI Productivity Assistant - Stop Script
# This script stops the running AI Productivity Assistant

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Stopping AI Productivity Assistant..."

# Function to show notification
show_notification() {
    local title="$1"
    local message="$2"
    local type="${3:-info}"
    
    if command -v notify-send >/dev/null 2>&1; then
        case $type in
            "success") notify-send -i "dialog-information" "$title" "$message" ;;
            "error") notify-send -i "dialog-error" "$title" "$message" ;;
            *) notify-send -i "dialog-information" "$title" "$message" ;;
        esac
    fi
}

# Stop backend processes
echo -e "${YELLOW}[INFO]${NC} Stopping backend processes..."
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "uvicorn.*main:app" 2>/dev/null || true

# Stop frontend processes
echo -e "${YELLOW}[INFO]${NC} Stopping frontend processes..."
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Stop Tauri processes
echo -e "${YELLOW}[INFO]${NC} Stopping Tauri processes..."
pkill -f "tauri.*dev" 2>/dev/null || true
pkill -f "ai-productivity-assistant" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Check if any processes are still running
if pgrep -f "python.*main.py\|uvicorn.*main:app\|npm.*dev\|vite\|tauri.*dev\|ai-productivity-assistant" >/dev/null 2>&1; then
    echo -e "${YELLOW}[WARNING]${NC} Some processes may still be running. Force stopping..."
    pkill -9 -f "python.*main.py" 2>/dev/null || true
    pkill -9 -f "uvicorn.*main:app" 2>/dev/null || true
    pkill -9 -f "npm.*dev" 2>/dev/null || true
    pkill -9 -f "vite" 2>/dev/null || true
    pkill -9 -f "tauri.*dev" 2>/dev/null || true
    pkill -9 -f "ai-productivity-assistant" 2>/dev/null || true
fi

echo -e "${GREEN}[SUCCESS]${NC} AI Productivity Assistant stopped successfully!"
show_notification "AI Assistant" "Application stopped successfully" "success"

# If running in terminal, wait for user
if [ -t 1 ]; then
    echo ""
    echo "Press Enter to close..."
    read -r
fi