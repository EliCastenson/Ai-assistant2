# 🖥️ Desktop Launcher Guide

## Quick Start

The AI Productivity Assistant now has multiple ways to launch with a simple double-click interface!

### 🚀 Launch Methods

#### 1. Desktop Icon (Recommended)
- **Double-click** the `AI Productivity Assistant` icon on your desktop
- **Right-click** for additional options:
  - Start in Terminal (for debugging)
  - Stop Application

#### 2. Applications Menu
- Find "AI Productivity Assistant" in your applications menu
- Click to launch

#### 3. Command Line
```bash
# Simple launcher (recommended)
./AI-Productivity-Assistant

# Universal launcher
./start-ai-assistant

# Traditional method
./launchers/launch.sh
```

## 📁 Files Created

### Desktop Launchers
- `AI-Productivity-Assistant` - Simple double-click launcher script
- `AI-Productivity-Assistant.desktop` - Desktop shortcut file
- `start-ai-assistant` - Universal cross-platform launcher

### Desktop Integration
- `~/.local/share/applications/AI-Productivity-Assistant.desktop` - System-wide app launcher
- `~/Desktop/AI-Productivity-Assistant.desktop` - Desktop shortcut

### Icons
- `assets/icon.png` - Main application icon (512x512)
- `assets/icon-256.png` - Large icon (256x256)
- `assets/icon-128.png` - Medium icon (128x128)
- `assets/icon-64.png` - Small icon (64x64)
- `assets/icon-32.png` - Tiny icon (32x32)
- `assets/icon-16.png` - Micro icon (16x16)

## 🔧 Management Scripts

### Stop the Application
```bash
./scripts/stop.sh
```
Or right-click the desktop icon and select "Stop Application"

### Reinstall Desktop Launcher
```bash
./setup-desktop-launcher.sh
```

## 🎯 Features

### Enhanced User Experience
- **Visual notifications** when starting/stopping
- **Error handling** with user-friendly messages
- **Cross-platform compatibility** (Linux, macOS, Windows)
- **Multiple launch options** for different preferences

### Desktop Integration
- **System tray integration** ready
- **File associations** configured
- **Proper categorization** in application menus
- **Keyboard shortcuts** support

### Advanced Options
- **Terminal mode** for debugging
- **Background launching** for silent startup
- **Process management** with proper cleanup
- **Icon theme integration**

## 🐧 Linux Specific

### Requirements
- `notify-send` for desktop notifications (usually pre-installed)
- `gnome-terminal` or similar for terminal launching
- Desktop environment with `.desktop` file support

### Locations
- Application launcher: `~/.local/share/applications/`
- Desktop shortcut: `~/Desktop/`
- Icons: Project `assets/` directory

## 🚨 Troubleshooting

### Launcher Not Working
1. Make sure all scripts are executable:
   ```bash
   chmod +x AI-Productivity-Assistant
   chmod +x start-ai-assistant
   chmod +x launchers/launch.sh
   ```

2. Verify project structure:
   ```bash
   ls -la package.json backend/main.py
   ```

3. Reinstall desktop integration:
   ```bash
   ./setup-desktop-launcher.sh
   ```

### Icon Not Showing
1. Check icon file exists:
   ```bash
   ls -la assets/icon.png
   ```

2. Recreate icon if missing:
   ```bash
   python3 assets/create-icon.py
   ```

### Permission Issues
```bash
# Fix permissions
chmod +x AI-Productivity-Assistant
chmod +x ~/Desktop/AI-Productivity-Assistant.desktop
chmod +x scripts/stop.sh
```

## 🔄 Updates

When updating the application:
1. Pull latest changes
2. Run `./setup-desktop-launcher.sh` to update launchers
3. Desktop shortcuts will automatically use the latest version

## 🎨 Customization

### Change Icon
1. Replace `assets/icon.png` with your custom icon (512x512 recommended)
2. Run `python3 assets/create-icon.py` to generate all sizes
3. Restart the application

### Modify Launcher Behavior
Edit `AI-Productivity-Assistant` script to customize:
- Startup messages
- Error handling
- Notification behavior
- Launch parameters

## 📱 Platform Support

- ✅ **Linux** - Full desktop integration
- ✅ **macOS** - App bundle creation
- ✅ **Windows** - Batch file launcher
- ✅ **Cross-platform** - Universal launcher script

---

**Need help?** Check the main README.md or run `./AI-Productivity-Assistant --help`