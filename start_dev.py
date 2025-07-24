#!/usr/bin/env python3
"""
Development startup script for AI Assistant
Starts both backend and frontend development servers
"""
import subprocess
import sys
import time
import os
from pathlib import Path

def run_command(command, cwd=None, background=False):
    """Run a command in the specified directory"""
    try:
        if background:
            return subprocess.Popen(command, shell=True, cwd=cwd)
        else:
            subprocess.run(command, shell=True, cwd=cwd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running command: {command}")
        print(f"   Error: {e}")
        return None

def check_dependencies():
    """Check if required dependencies are available"""
    print("🔍 Checking dependencies...")
    
    # Check Python
    try:
        python_version = subprocess.check_output([sys.executable, "--version"], text=True).strip()
        print(f"   ✅ Python: {python_version}")
    except:
        print("   ❌ Python not found")
        return False
    
    # Check Node.js
    try:
        node_version = subprocess.check_output(["node", "--version"], text=True).strip()
        print(f"   ✅ Node.js: {node_version}")
    except:
        print("   ❌ Node.js not found")
        return False
    
    return True

def setup_backend():
    """Set up the backend environment"""
    print("\n🚀 Setting up backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("   ❌ Backend directory not found")
        return False
    
    # Install Python dependencies
    print("   📦 Installing Python dependencies...")
    if run_command(f"{sys.executable} -m pip install -r requirements.txt", cwd=backend_dir) is None:
        return False
    
    # Seed database
    print("   🌱 Seeding database with sample data...")
    if run_command(f"{sys.executable} seed_data.py", cwd=backend_dir) is None:
        return False
    
    print("   ✅ Backend setup complete")
    return True

def setup_frontend():
    """Set up the frontend environment"""
    print("\n🚀 Setting up frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("   ❌ Frontend directory not found")
        return False
    
    # Install Node.js dependencies
    print("   📦 Installing Node.js dependencies...")
    if run_command("npm install", cwd=frontend_dir) is None:
        return False
    
    print("   ✅ Frontend setup complete") 
    return True

def start_servers():
    """Start both backend and frontend development servers"""
    print("\n🚀 Starting development servers...")
    
    # Start backend server
    print("   🟡 Starting backend server on http://localhost:8000")
    backend_process = run_command(
        f"{sys.executable} -m uvicorn main:app --reload --host 0.0.0.0 --port 8000",
        cwd=Path("backend"),
        background=True
    )
    
    if backend_process is None:
        print("   ❌ Failed to start backend server")
        return False
    
    # Wait a moment for backend to start
    time.sleep(3)
    
    # Start frontend server
    print("   🔵 Starting frontend server on http://localhost:1420")
    frontend_process = run_command(
        "npm run dev",
        cwd=Path("frontend"),
        background=True
    )
    
    if frontend_process is None:
        print("   ❌ Failed to start frontend server")
        backend_process.terminate()
        return False
    
    print("\n✅ Development servers started successfully!")
    print("   🔗 Frontend: http://localhost:1420")
    print("   🔗 Backend API: http://localhost:8000")
    print("   🔗 API Docs: http://localhost:8000/docs")
    print("\n💡 Press Ctrl+C to stop both servers")
    
    try:
        # Wait for both processes
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("   ✅ Servers stopped")

def main():
    """Main function"""
    print("🤖 AI Assistant Development Setup")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Missing dependencies. Please install Python and Node.js")
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("\n❌ Backend setup failed")
        sys.exit(1)
    
    # Setup frontend  
    if not setup_frontend():
        print("\n❌ Frontend setup failed")
        sys.exit(1)
    
    # Start servers
    if not start_servers():
        print("\n❌ Failed to start servers")
        sys.exit(1)

if __name__ == "__main__":
    main()