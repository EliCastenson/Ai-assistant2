#!/bin/bash

# AI Productivity Assistant - macOS App Bundle Creator
# This script creates a .app bundle for macOS

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# App bundle information
APP_NAME="AI Productivity Assistant"
BUNDLE_ID="com.ai.productivity.assistant"
APP_DIR="$PROJECT_DIR/AI Productivity Assistant.app"

# Function to print status
print_status() {
    echo "🔧 $1"
}

print_success() {
    echo "✅ $1"
}

print_error() {
    echo "❌ $1"
}

# Create app bundle structure
create_app_bundle() {
    print_status "Creating macOS app bundle..."
    
    # Remove existing app bundle
    if [ -d "$APP_DIR" ]; then
        rm -rf "$APP_DIR"
    fi
    
    # Create app bundle directories
    mkdir -p "$APP_DIR/Contents/MacOS"
    mkdir -p "$APP_DIR/Contents/Resources"
    
    # Create Info.plist
    cat > "$APP_DIR/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>AI Productivity Assistant</string>
    <key>CFBundleGetInfoString</key>
    <string>AI Productivity Assistant - Local-first AI assistant for productivity management</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>$BUNDLE_ID</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$APP_NAME</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleSignature</key>
    <string>AIPA</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSUIElement</key>
    <false/>
</dict>
</plist>
EOF

    # Create the main executable script
    cat > "$APP_DIR/Contents/MacOS/AI Productivity Assistant" << 'EOF'
#!/bin/bash

# AI Productivity Assistant - macOS Launcher
# This script is executed when the .app bundle is launched

set -e

# Get the app bundle directory
APP_BUNDLE="$(dirname "$(dirname "$(dirname "$(realpath "$0")")")")"
PROJECT_DIR="$(dirname "$APP_BUNDLE")"

# Function to show macOS notification
show_notification() {
    local title="$1"
    local message="$2"
    osascript -e "display notification \"$message\" with title \"$title\""
}

# Function to show alert dialog
show_alert() {
    local title="$1"
    local message="$2"
    local type="${3:-informational}" # informational, warning, critical
    
    osascript -e "display alert \"$title\" message \"$message\" as $type"
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
        show_alert "Missing Dependencies" "Please install the following dependencies:\n\n${missing_deps[*]}\n\nNode.js: https://nodejs.org/\nPython 3: https://python.org/"
        exit 1
    fi
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Main execution
main() {
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "backend/main.py" ]; then
        show_alert "Setup Error" "Cannot find project files. Please ensure the app is in the correct location."
        exit 1
    fi
    
    # Check dependencies
    check_dependencies
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            show_notification "Setup Required" "Opening .env file for configuration"
            open -a TextEdit .env
            show_alert "Configuration Required" "Please configure your API keys in the .env file that just opened, then run the app again."
            exit 0
        else
            show_alert "Configuration Error" "Missing .env.example file"
            exit 1
        fi
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        show_notification "Installing Dependencies" "Installing frontend packages..."
        npm install >/dev/null 2>&1 || {
            show_alert "Installation Failed" "Failed to install frontend dependencies"
            exit 1
        }
    fi
    
    if [ ! -d "backend/venv" ]; then
        show_notification "Installing Dependencies" "Setting up Python environment..."
        
        cd backend
        python3 -m venv venv >/dev/null 2>&1 || {
            show_alert "Installation Failed" "Failed to create Python virtual environment"
            exit 1
        }
        
        source venv/bin/activate
        pip install -r requirements.txt >/dev/null 2>&1 || {
            show_alert "Installation Failed" "Failed to install Python dependencies"
            exit 1
        }
        
        cd ..
    fi
    
    # Check if already running
    if port_in_use 1420 && port_in_use 8000; then
        show_notification "Already Running" "Opening browser..."
        open http://localhost:1420
        exit 0
    fi
    
    # Kill any existing processes on our ports
    if port_in_use 8000; then
        lsof -ti :8000 | xargs kill -9 2>/dev/null || true
    fi
    
    if port_in_use 1420; then
        lsof -ti :1420 | xargs kill -9 2>/dev/null || true
    fi
    
    # Start backend
    show_notification "Starting Services" "Starting backend server..."
    
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
        show_alert "Startup Failed" "Backend server failed to start"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    # Start frontend
    show_notification "Starting Services" "Starting frontend application..."
    
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
        show_alert "Startup Failed" "Frontend application failed to start"
        kill $BACKEND_PID 2>/dev/null || true
        kill $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    
    # Success! Open browser
    show_notification "AI Assistant Ready" "Application started successfully!"
    sleep 1
    open http://localhost:1420
    
    # Create a PID file for cleanup
    echo "$BACKEND_PID $FRONTEND_PID" > "$PROJECT_DIR/.app_pids"
}

# Run main function
main "$@"
EOF

    # Make the executable script executable
    chmod +x "$APP_DIR/Contents/MacOS/AI Productivity Assistant"
    
    # Copy icon if it exists
    if [ -f "$PROJECT_DIR/assets/icon.icns" ]; then
        cp "$PROJECT_DIR/assets/icon.icns" "$APP_DIR/Contents/Resources/AppIcon.icns"
    elif [ -f "$PROJECT_DIR/assets/icon.png" ]; then
        # Convert PNG to ICNS if possible
        if command -v sips >/dev/null 2>&1; then
            mkdir -p /tmp/AppIcon.iconset
            sips -z 16 16     "$PROJECT_DIR/assets/icon.png" --out /tmp/AppIcon.iconset/icon_16x16.png
            sips -z 32 32     "$PROJECT_DIR/assets/icon.png" --out /tmp/AppIcon.iconset/icon_16x16@2x.png
            sips -z 32 32     "$PROJECT_DIR/assets/icon.png" --out /tmp/AppIcon.iconset/icon_32x32.png
            sips -z 64 64     "$PROJECT_DIR/assets/icon.png" --out /tmp/AppIcon.iconset/icon_32x32@2x.png
            sips -z 128 128   "$PROJECT_DIR/assets/icon.png" --out /tmp/AppIcon.iconset/icon_128x128.png
            sips -z 256 256   "$PROJECT_DIR/assets/icon.png" --out /tmp/AppIcon.iconset/icon_128x128@2x.png
            sips -z 256 256   "$PROJECT_DIR/assets/icon.png" --out /tmp/AppIcon.iconset/icon_256x256.png
            sips -z 512 512   "$PROJECT_DIR/assets/icon.png" --out /tmp/AppIcon.iconset/icon_256x256@2x.png
            sips -z 512 512   "$PROJECT_DIR/assets/icon.png" --out /tmp/AppIcon.iconset/icon_512x512.png
            sips -z 1024 1024 "$PROJECT_DIR/assets/icon.png" --out /tmp/AppIcon.iconset/icon_512x512@2x.png
            iconutil -c icns /tmp/AppIcon.iconset -o "$APP_DIR/Contents/Resources/AppIcon.icns"
            rm -rf /tmp/AppIcon.iconset
        fi
    fi
    
    print_success "macOS app bundle created successfully!"
    print_success "Location: $APP_DIR"
}

# Create stop script
create_stop_script() {
    cat > "$PROJECT_DIR/stop-ai-assistant.sh" << 'EOF'
#!/bin/bash

# Stop AI Productivity Assistant

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🛑 Stopping AI Productivity Assistant..."

# Read PID file if it exists
if [ -f "$PROJECT_DIR/.app_pids" ]; then
    PIDS=$(cat "$PROJECT_DIR/.app_pids")
    for PID in $PIDS; do
        if kill -0 $PID 2>/dev/null; then
            kill $PID 2>/dev/null || true
            echo "   Stopped process $PID"
        fi
    done
    rm -f "$PROJECT_DIR/.app_pids"
fi

# Kill any remaining processes on our ports
if command -v lsof >/dev/null 2>&1; then
    for port in 8000 1420; do
        PIDS=$(lsof -ti :$port 2>/dev/null || true)
        if [ -n "$PIDS" ]; then
            echo "$PIDS" | xargs kill -9 2>/dev/null || true
            echo "   Freed port $port"
        fi
    done
fi

echo "✅ AI Productivity Assistant stopped successfully"

# Show notification on macOS
if command -v osascript >/dev/null 2>&1; then
    osascript -e 'display notification "Application stopped successfully" with title "AI Assistant"'
fi
EOF

    chmod +x "$PROJECT_DIR/stop-ai-assistant.sh"
    print_success "Stop script created: stop-ai-assistant.sh"
}

# Main execution
main() {
    print_status "Creating macOS app bundle for AI Productivity Assistant..."
    
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "backend/main.py" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    create_app_bundle
    create_stop_script
    
    echo ""
    echo "🎉 macOS App Bundle Created Successfully!"
    echo ""
    echo "📱 To use:"
    echo "   1. Double-click 'AI Productivity Assistant.app' to launch"
    echo "   2. Or run './stop-ai-assistant.sh' to stop the application"
    echo ""
    echo "📁 Files created:"
    echo "   - AI Productivity Assistant.app (macOS application bundle)"
    echo "   - stop-ai-assistant.sh (stop script)"
    echo ""
    echo "💡 Tip: You can drag the .app to your Applications folder or dock for easy access!"
}

# Run main function
main "$@"