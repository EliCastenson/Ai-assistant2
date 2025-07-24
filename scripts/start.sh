#!/bin/bash

# AI Productivity Assistant - Startup Script
# This script starts both the frontend and backend services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}
╔══════════════════════════════════════════════════════════════╗
║                 🧠 AI Productivity Assistant                 ║
║                        Starting Services                     ║
╚══════════════════════════════════════════════════════════════╝${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill processes on specific ports
kill_port() {
    if port_in_use $1; then
        print_warning "Port $1 is in use. Attempting to free it..."
        lsof -ti :$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    
    if ! command_exists python3; then
        missing_deps+=("Python 3")
    fi
    
    if ! command_exists pip3; then
        missing_deps+=("pip3")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_warning ".env file not found. Creating from .env.example..."
            cp .env.example .env
            print_status "Please edit .env file with your API keys before running the application"
        else
            print_error ".env.example file not found. Cannot create .env file."
            exit 1
        fi
    fi
    
    # Create data directory if it doesn't exist
    if [ ! -d "data" ]; then
        print_status "Creating data directory..."
        mkdir -p data
    fi
    
    print_success "Environment setup complete"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install frontend dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    else
        print_status "Frontend dependencies already installed"
    fi
    
    # Install backend dependencies
    if [ ! -d "backend/venv" ]; then
        print_status "Creating Python virtual environment..."
        cd backend
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        cd ..
    else
        print_status "Backend virtual environment already exists"
        cd backend
        source venv/bin/activate
        pip install -r requirements.txt --quiet
        cd ..
    fi
    
    print_success "Dependencies installed successfully"
}

# Function to start backend
start_backend() {
    print_status "Starting backend server..."
    
    cd backend
    source venv/bin/activate
    
    # Kill any existing backend process
    kill_port 8000
    
    # Start backend in background
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    cd ..
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            print_success "Backend server started successfully on http://localhost:8000"
            return 0
        fi
        sleep 1
    done
    
    print_error "Backend failed to start within 30 seconds"
    return 1
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend development server..."
    
    # Kill any existing frontend process
    kill_port 1420
    
    # Start frontend in background
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:1420 >/dev/null 2>&1; then
            print_success "Frontend server started successfully on http://localhost:1420"
            return 0
        fi
        sleep 1
    done
    
    print_error "Frontend failed to start within 30 seconds"
    return 1
}

# Function to show running services
show_services() {
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                        🚀 Services Running                   ║
╠══════════════════════════════════════════════════════════════╣
║  Frontend (React + Tauri): http://localhost:1420            ║
║  Backend (FastAPI):        http://localhost:8000            ║
║  API Documentation:        http://localhost:8000/docs       ║
╠══════════════════════════════════════════════════════════════╣
║  📱 Open the app:          http://localhost:1420            ║
║  📚 API Docs:              http://localhost:8000/docs       ║
║  🔧 Health Check:          http://localhost:8000/health     ║
╚══════════════════════════════════════════════════════════════╝${NC}"
}

# Function to show usage instructions
show_usage() {
    echo -e "${YELLOW}
📖 Quick Start Guide:
1. Configure your API keys in the .env file
2. Visit http://localhost:1420 to use the app
3. Go to Settings to connect your Google account
4. Start chatting with your AI assistant!

🔑 Required API Keys (add to .env):
- OPENAI_API_KEY: For GPT-4 chat functionality
- SERPAPI_KEY: For web search (optional)
- GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET: For Google integration

⚡ Features Available:
- 💬 Chat with AI assistant (text + voice)
- ✅ Task management with priorities
- 📅 Calendar integration (Google Calendar)
- 📧 Email management (Gmail)
- 🔍 Web search with AI summaries
- 🌙 Dark/Light mode toggle

Press Ctrl+C to stop all services${NC}"
}

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down services..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on our ports
    kill_port 8000
    kill_port 1420
    
    print_success "All services stopped. Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_header
    
    # Change to script directory
    cd "$(dirname "$0")/.."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "backend/main.py" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    check_dependencies
    setup_environment
    install_dependencies
    
    # Start services
    if start_backend && start_frontend; then
        show_services
        show_usage
        
        # Keep script running
        print_status "Services are running. Press Ctrl+C to stop."
        wait
    else
        print_error "Failed to start one or more services"
        cleanup
        exit 1
    fi
}

# Run main function
main "$@"