#!/bin/bash

# AI Productivity Assistant - Setup Script
echo "🚀 Setting up AI Productivity Assistant..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

# Check Rust
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust from https://rustup.rs/"
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
python3 -m pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

cd ..

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your API keys."
else
    echo "ℹ️  .env file already exists"
fi

# Create data directory
mkdir -p ~/.ai_assistant
echo "✅ Created data directory at ~/.ai_assistant"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your API keys:"
echo "   - OpenAI API Key (required for AI features)"
echo "   - Google OAuth2 credentials (for Calendar/Gmail)"
echo "   - SerpAPI key (optional, for enhanced search)"
echo ""
echo "2. Run the application:"
echo "   npm run dev:all"
echo ""
echo "3. Or run components separately:"
echo "   Backend: npm run backend"
echo "   Frontend: npm run dev"
echo "   Desktop: npm run tauri dev"
echo ""
echo "🔗 For detailed setup instructions, see README.md"