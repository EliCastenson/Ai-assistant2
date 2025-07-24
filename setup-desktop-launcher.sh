#!/bin/bash

# AI Productivity Assistant - Universal Desktop Launcher Setup
# This script creates desktop launchers for Linux, macOS, and Windows

set -e

# Get the directory where this script is located
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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
║              🖥️  Desktop Launcher Setup                     ║
║                 AI Productivity Assistant                    ║
╚══════════════════════════════════════════════════════════════╝${NC}"
}

# Function to detect operating system
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Function to create icon if it doesn't exist
create_default_icon() {
    local icon_dir="$PROJECT_DIR/assets"
    local icon_file="$icon_dir/icon.png"
    
    # Create assets directory if it doesn't exist
    mkdir -p "$icon_dir"
    
    # Create a simple default icon using ImageMagick if available
    if command -v convert >/dev/null 2>&1 && [ ! -f "$icon_file" ]; then
        print_status "Creating default icon..."
        convert -size 512x512 xc:transparent \
                -fill '#3B82F6' -draw 'roundrectangle 50,50 462,462 50,50' \
                -fill white -pointsize 200 -gravity center \
                -annotate +0+0 '🧠' \
                "$icon_file" 2>/dev/null || {
            print_warning "Could not create icon with ImageMagick"
        }
    fi
    
    # If still no icon, create a simple text-based one
    if [ ! -f "$icon_file" ] && command -v convert >/dev/null 2>&1; then
        convert -size 512x512 xc:'#3B82F6' \
                -fill white -pointsize 72 -gravity center \
                -annotate +0+0 'AI\nAssistant' \
                "$icon_file" 2>/dev/null || true
    fi
}

# Function to setup Linux desktop launcher
setup_linux() {
    print_status "Setting up Linux desktop launcher..."
    
    # Make launch script executable
    chmod +x "$PROJECT_DIR/launchers/launch.sh"
    
    # Create desktop file with absolute paths
    local desktop_file="$HOME/.local/share/applications/ai-productivity-assistant.desktop"
    local desktop_dir="$HOME/Desktop"
    
    # Create applications directory if it doesn't exist
    mkdir -p "$(dirname "$desktop_file")"
    
    # Create the desktop file
    cat > "$desktop_file" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=AI Productivity Assistant
Comment=Local-first AI assistant for productivity management
GenericName=AI Assistant
Icon=$PROJECT_DIR/assets/icon.png
Exec=$PROJECT_DIR/launchers/launch.sh
Terminal=false
StartupNotify=true
Categories=Office;Productivity;
Keywords=AI;Assistant;Productivity;Tasks;Calendar;Email;
MimeType=
StartupWMClass=ai-productivity-assistant
EOF

    # Make it executable
    chmod +x "$desktop_file"
    
    # Copy to desktop if desktop directory exists
    if [ -d "$desktop_dir" ]; then
        cp "$desktop_file" "$desktop_dir/"
        chmod +x "$desktop_dir/ai-productivity-assistant.desktop"
        print_success "Desktop shortcut created: $desktop_dir/ai-productivity-assistant.desktop"
    fi
    
    print_success "Application launcher installed: $desktop_file"
    print_status "You can now find 'AI Productivity Assistant' in your applications menu"
    
    # Try to create desktop shortcut with the launcher script
    "$PROJECT_DIR/launchers/launch.sh" --create-shortcut >/dev/null 2>&1 || true
}

# Function to setup macOS launcher
setup_macos() {
    print_status "Setting up macOS application bundle..."
    
    # Make the macOS setup script executable
    chmod +x "$PROJECT_DIR/launchers/create-macos-app.sh"
    
    # Run the macOS app creation script
    "$PROJECT_DIR/launchers/create-macos-app.sh"
    
    local app_path="$PROJECT_DIR/AI Productivity Assistant.app"
    
    if [ -d "$app_path" ]; then
        print_success "macOS app bundle created: $app_path"
        
        # Ask if user wants to copy to Applications
        echo ""
        read -p "Would you like to copy the app to your Applications folder? (y/N): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp -R "$app_path" "/Applications/"
            print_success "App copied to Applications folder"
            print_status "You can now find 'AI Productivity Assistant' in Launchpad and Applications"
        fi
        
        # Ask if user wants to add to Dock
        echo ""
        read -p "Would you like to add the app to your Dock? (y/N): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            osascript -e "tell application \"Dock\" to make new item at end of items of dock with properties {name:\"AI Productivity Assistant\", path:\"$app_path\"}" 2>/dev/null || {
                print_warning "Could not add to Dock automatically. You can drag the app to your Dock manually."
            }
        fi
    else
        print_error "Failed to create macOS app bundle"
        return 1
    fi
}

# Function to setup Windows launcher
setup_windows() {
    print_status "Setting up Windows launcher..."
    
    local batch_file="$PROJECT_DIR/launchers/AI-Productivity-Assistant.bat"
    
    if [ -f "$batch_file" ]; then
        print_success "Windows batch launcher created: $batch_file"
        print_status "You can double-click the .bat file to start the application"
        
        # Try to create a desktop shortcut
        local desktop_dir="$HOME/Desktop"
        if [ -d "$desktop_dir" ]; then
            # Create a simple batch file on desktop that calls the main launcher
            cat > "$desktop_dir/AI Productivity Assistant.bat" << EOF
@echo off
cd /d "$PROJECT_DIR"
call "launchers\AI-Productivity-Assistant.bat"
EOF
            print_success "Desktop shortcut created: $desktop_dir/AI Productivity Assistant.bat"
        fi
        
        # If running in WSL, try to create Windows shortcut
        if command -v powershell.exe >/dev/null 2>&1; then
            local win_project_dir=$(wslpath -w "$PROJECT_DIR" 2>/dev/null || echo "$PROJECT_DIR")
            local win_batch_file="$win_project_dir\\launchers\\AI-Productivity-Assistant.bat"
            
            powershell.exe -Command "
                \$WshShell = New-Object -comObject WScript.Shell
                \$Shortcut = \$WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\\AI Productivity Assistant.lnk')
                \$Shortcut.TargetPath = '$win_batch_file'
                \$Shortcut.WorkingDirectory = '$win_project_dir'
                \$Shortcut.Description = 'AI Productivity Assistant - Local-first AI assistant'
                \$Shortcut.Save()
            " 2>/dev/null && print_success "Windows desktop shortcut (.lnk) created"
        fi
    else
        print_error "Windows batch file not found"
        return 1
    fi
}

# Function to create a universal launcher script
create_universal_launcher() {
    local launcher_script="$PROJECT_DIR/start-ai-assistant"
    
    cat > "$launcher_script" << 'EOF'
#!/bin/bash

# AI Productivity Assistant - Universal Launcher
# This script works on Linux, macOS, and Windows (Git Bash/WSL)

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detect OS and run appropriate launcher
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    "$PROJECT_DIR/launchers/launch.sh" "$@"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "$PROJECT_DIR/AI Productivity Assistant.app" ]; then
        open "$PROJECT_DIR/AI Productivity Assistant.app"
    else
        "$PROJECT_DIR/launchers/launch.sh" "$@"
    fi
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    cmd.exe /c "$PROJECT_DIR\\launchers\\AI-Productivity-Assistant.bat"
else
    # Fallback to the generic launcher
    "$PROJECT_DIR/launchers/launch.sh" "$@"
fi
EOF

    chmod +x "$launcher_script"
    print_success "Universal launcher created: start-ai-assistant"
}

# Function to show usage instructions
show_usage_instructions() {
    local os=$(detect_os)
    
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                    🎉 Setup Complete!                       ║
╚══════════════════════════════════════════════════════════════╝${NC}"
    
    echo ""
    echo "📱 How to launch the AI Productivity Assistant:"
    echo ""
    
    case $os in
        "linux")
            echo "🐧 Linux:"
            echo "   • Double-click the desktop shortcut"
            echo "   • Find 'AI Productivity Assistant' in your applications menu"
            echo "   • Or run: ./start-ai-assistant"
            ;;
        "macos")
            echo "🍎 macOS:"
            echo "   • Double-click 'AI Productivity Assistant.app'"
            echo "   • Find it in Applications folder (if copied)"
            echo "   • Click the Dock icon (if added)"
            echo "   • Or run: ./start-ai-assistant"
            ;;
        "windows")
            echo "🪟 Windows:"
            echo "   • Double-click 'AI Productivity Assistant.bat'"
            echo "   • Double-click the desktop shortcut"
            echo "   • Or run: ./start-ai-assistant (in Git Bash/WSL)"
            ;;
        *)
            echo "🖥️  Universal:"
            echo "   • Run: ./start-ai-assistant"
            echo "   • Or use the platform-specific launcher in the 'launchers' folder"
            ;;
    esac
    
    echo ""
    echo "🔧 Additional options:"
    echo "   • Stop the app: ./stop-ai-assistant.sh (Linux/macOS)"
    echo "   • Terminal startup: ./scripts/start.sh"
    echo ""
    echo "💡 First time setup:"
    echo "   1. The app will create a .env file for you"
    echo "   2. Add your API keys (OpenAI, Google, etc.)"
    echo "   3. Restart the application"
    echo ""
    echo "🌐 Access the app at: http://localhost:1420"
}

# Main execution
main() {
    print_header
    
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "backend/main.py" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Create default icon if needed
    create_default_icon
    
    # Create universal launcher
    create_universal_launcher
    
    # Detect OS and setup appropriate launcher
    local os=$(detect_os)
    print_status "Detected operating system: $os"
    
    case $os in
        "linux")
            setup_linux
            ;;
        "macos")
            setup_macos
            ;;
        "windows")
            setup_windows
            ;;
        *)
            print_warning "Unknown operating system. Creating universal launcher only."
            print_status "You can use ./start-ai-assistant to launch the application"
            ;;
    esac
    
    show_usage_instructions
}

# Handle command line arguments
case "${1:-}" in
    "--help"|"-h")
        echo "AI Productivity Assistant - Desktop Launcher Setup"
        echo ""
        echo "This script creates desktop launchers for your operating system."
        echo ""
        echo "Usage:"
        echo "  $0        Setup desktop launcher for current OS"
        echo "  $0 --help Show this help message"
        echo ""
        echo "Supported platforms:"
        echo "  • Linux   - Creates .desktop files and shortcuts"
        echo "  • macOS   - Creates .app bundle"
        echo "  • Windows - Creates .bat launcher and shortcuts"
        ;;
    *)
        main "$@"
        ;;
esac