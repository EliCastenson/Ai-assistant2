#!/bin/bash

# AI Productivity Assistant - Desktop Launcher
# This script is designed to be launched from desktop icons

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to show notification (cross-platform)
show_notification() {
    local title="$1"
    local message="$2"
    local type="${3:-info}" # info, success, error
    
    if command -v notify-send >/dev/null 2>&1; then
        # Linux - using notify-send
        case $type in
            "success") notify-send -i "dialog-information" "$title" "$message" ;;
            "error") notify-send -i "dialog-error" "$title" "$message" ;;
            *) notify-send -i "dialog-information" "$title" "$message" ;;
        esac
    elif command -v osascript >/dev/null 2>&1; then
        # macOS - using AppleScript
        osascript -e "display notification \"$message\" with title \"$title\""
    elif command -v powershell.exe >/dev/null 2>&1; then
        # Windows (WSL) - using PowerShell
        powershell.exe -Command "
            Add-Type -AssemblyName System.Windows.Forms
            [System.Windows.Forms.MessageBox]::Show('$message', '$title')
        "
    else
        # Fallback - terminal output
        echo -e "${BLUE}[$title]${NC} $message"
    fi
}

# Function to check if a port is in use
port_in_use() {
    if command -v lsof >/dev/null 2>&1; then
        lsof -i :$1 >/dev/null 2>&1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -an | grep ":$1 " >/dev/null 2>&1
    else
        return 1
    fi
}

# Function to open URL in default browser
open_browser() {
    local url="$1"
    
    if command -v xdg-open >/dev/null 2>&1; then
        # Linux
        xdg-open "$url" >/dev/null 2>&1 &
    elif command -v open >/dev/null 2>&1; then
        # macOS
        open "$url" >/dev/null 2>&1 &
    elif command -v start >/dev/null 2>&1; then
        # Windows
        start "$url" >/dev/null 2>&1 &
    else
        show_notification "Browser Required" "Please open http://localhost:1420 in your browser" "info"
    fi
}

# Function to check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! command -v node >/dev/null 2>&1; then
        missing_deps+=("Node.js")
    fi
    
    if ! command -v python3 >/dev/null 2>&1; then
        missing_deps+=("Python 3")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        show_notification "Missing Dependencies" "Please install: ${missing_deps[*]}" "error"
        return 1
    fi
    
    return 0
}

# Function to setup environment
setup_environment() {
    cd "$PROJECT_DIR"
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            show_notification "Setup Required" "Please configure your API keys in the .env file" "info"
            
            # Try to open .env file in default editor
            if command -v xdg-open >/dev/null 2>&1; then
                xdg-open .env >/dev/null 2>&1 &
            elif command -v open >/dev/null 2>&1; then
                open .env >/dev/null 2>&1 &
            fi
            
            return 1
        else
            show_notification "Configuration Error" "Missing .env.example file" "error"
            return 1
        fi
    fi
    
    return 0
}

# Function to install dependencies
install_dependencies() {
    cd "$PROJECT_DIR"
    
    # Install frontend dependencies
    if [ ! -d "node_modules" ]; then
        show_notification "Installing Dependencies" "Installing frontend packages..." "info"
        npm install >/dev/null 2>&1 || {
            show_notification "Installation Failed" "Failed to install frontend dependencies" "error"
            return 1
        }
    fi
    
    # Install backend dependencies
    if [ ! -d "backend/venv" ]; then
        show_notification "Installing Dependencies" "Setting up Python environment..." "info"
        
        cd backend
        python3 -m venv venv >/dev/null 2>&1 || {
            show_notification "Installation Failed" "Failed to create Python virtual environment" "error"
            return 1
        }
        
        source venv/bin/activate
        pip install -r requirements.txt >/dev/null 2>&1 || {
            show_notification "Installation Failed" "Failed to install Python dependencies" "error"
            return 1
        }
        
        cd ..
    fi
    
    return 0
}

# Function to start the application
start_application() {
    cd "$PROJECT_DIR"
    
    # Check if already running
    if port_in_use 1420 && port_in_use 8000; then
        show_notification "Already Running" "Application is already running. Opening browser..." "info"
        sleep 1
        open_browser "http://localhost:1420"
        return 0
    fi
    
    # Kill any existing processes on our ports
    if port_in_use 8000; then
        if command -v lsof >/dev/null 2>&1; then
            lsof -ti :8000 | xargs kill -9 2>/dev/null || true
        fi
    fi
    
    if port_in_use 1420; then
        if command -v lsof >/dev/null 2>&1; then
            lsof -ti :1420 | xargs kill -9 2>/dev/null || true
        fi
    fi
    
    # Start backend
    show_notification "Starting Services" "Starting backend server..." "info"
    
    cd backend
    source venv/bin/activate
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 >/dev/null 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    for i in {1..30}; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done
    
    if ! curl -s http://localhost:8000/health >/dev/null 2>&1; then
        show_notification "Startup Failed" "Backend server failed to start" "error"
        kill $BACKEND_PID 2>/dev/null || true
        return 1
    fi
    
    # Start frontend
    show_notification "Starting Services" "Starting frontend application..." "info"
    
    npm run dev >/dev/null 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    for i in {1..30}; do
        if curl -s http://localhost:1420 >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done
    
    if ! curl -s http://localhost:1420 >/dev/null 2>&1; then
        show_notification "Startup Failed" "Frontend application failed to start" "error"
        kill $BACKEND_PID 2>/dev/null || true
        kill $FRONTEND_PID 2>/dev/null || true
        return 1
    fi
    
    # Success! Open browser
    show_notification "AI Assistant Ready" "Application started successfully! Opening browser..." "success"
    sleep 2
    open_browser "http://localhost:1420"
    
    # Create a PID file for cleanup
    echo "$BACKEND_PID $FRONTEND_PID" > "$PROJECT_DIR/.app_pids"
    
    return 0
}

# Function to create desktop shortcuts
create_shortcuts() {
    local desktop_dir=""
    
    # Find desktop directory
    if [ -d "$HOME/Desktop" ]; then
        desktop_dir="$HOME/Desktop"
    elif [ -d "$HOME/Escritorio" ]; then  # Spanish
        desktop_dir="$HOME/Escritorio"
    elif [ -d "$HOME/Bureau" ]; then      # French
        desktop_dir="$HOME/Bureau"
    fi
    
    if [ -n "$desktop_dir" ]; then
        # Create desktop shortcut
        local desktop_file="$desktop_dir/AI-Productivity-Assistant.desktop"
        sed "s|%PROJECT_DIR%|$PROJECT_DIR|g" "$PROJECT_DIR/launchers/AI-Productivity-Assistant.desktop" > "$desktop_file"
        chmod +x "$desktop_file"
        
        show_notification "Shortcut Created" "Desktop shortcut created successfully!" "success"
    fi
}

# Main execution
main() {
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "backend/main.py" ]; then
        show_notification "Setup Error" "Please run from the project directory" "error"
        exit 1
    fi
    
    # Check dependencies
    if ! check_dependencies; then
        exit 1
    fi
    
    # Setup environment
    if ! setup_environment; then
        exit 1
    fi
    
    # Install dependencies if needed
    if ! install_dependencies; then
        exit 1
    fi
    
    # Start the application
    if ! start_application; then
        exit 1
    fi
    
    # Offer to create desktop shortcut
    if [ "$1" = "--create-shortcut" ]; then
        create_shortcuts
    fi
}

# Handle command line arguments
case "${1:-}" in
    "--create-shortcut")
        main --create-shortcut
        ;;
    "--help"|"-h")
        echo "AI Productivity Assistant Launcher"
        echo ""
        echo "Usage:"
        echo "  $0                    Start the application"
        echo "  $0 --create-shortcut  Start app and create desktop shortcut"
        echo "  $0 --help            Show this help message"
        ;;
    *)
        main
        ;;
esac