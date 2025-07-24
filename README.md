# AI Productivity Assistant

A local-first, desktop AI assistant built with Tauri, React, TypeScript, and FastAPI. This assistant helps you manage tasks, schedule events, handle emails, and provides intelligent productivity insights through a modern, animated interface.

## 🚀 Features

### ✅ Core Functionality
- **Chat Interface**: Natural language interaction with GPT-4 powered AI assistant
- **Voice Input/Output**: Speech-to-text and text-to-speech capabilities
- **Task Management**: Create, organize, and track tasks with AI assistance
- **Calendar Integration**: Google Calendar sync and event management
- **Email Management**: Gmail integration with AI-powered summaries and reply suggestions
- **Web Search**: Integrated search with AI-enhanced results
- **Smart Suggestions**: Context-aware recommendations and automation

### 🎨 Modern UI/UX
- **Dark/Light Mode**: Smooth animated theme toggle
- **Responsive Design**: Works on desktop and web browsers
- **Framer Motion Animations**: Smooth, professional animations throughout
- **Glass Morphism**: Modern UI effects and styling
- **Tailwind CSS**: Beautiful, consistent design system

### 🔒 Privacy & Security
- **Local-First**: All data stored locally on your device
- **SQLite Database**: Fast, reliable local storage
- **Secure OAuth2**: Google services integration with secure token storage
- **No Cloud Dependencies**: Works completely offline for core features

## 🛠️ Tech Stack

### Frontend
- **Tauri**: Desktop app framework with web technologies
- **React 18**: Modern React with hooks and context
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Production-ready motion library
- **Lucide React**: Beautiful, customizable icons

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLAlchemy**: Modern Python SQL toolkit and ORM
- **SQLite**: Lightweight, serverless database
- **OpenAI API**: GPT-4 integration for AI capabilities
- **Google APIs**: Calendar, Gmail, and Contacts integration

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.9 or higher)
- **Rust** (latest stable version)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-productivity-assistant.git
cd ai-productivity-assistant
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- **OpenAI API Key**: Required for AI functionality
- **Google OAuth2 Credentials**: Required for Calendar/Gmail integration
- **SerpAPI Key**: Optional, for enhanced web search

### 5. Database Setup
The SQLite database will be automatically created in your home directory (`~/.ai_assistant/`) when you first run the application.

## 🚀 Running the Application

### Quick Start (Recommended)
The easiest way to get started:

```bash
# One-command startup (handles everything)
./scripts/start.sh
```

This script will:
- ✅ Check all dependencies
- 📦 Install frontend and backend dependencies automatically
- 🔧 Set up the environment (.env file)
- 🚀 Start both frontend and backend services
- 📋 Show you exactly what to do next

### Manual Development Mode
Run both frontend and backend simultaneously:
```bash
npm run dev:all
```

Or run them separately:

**Backend:**
```bash
npm run backend
# or
cd backend && python -m uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
npm run dev
```

**Tauri Desktop App:**
```bash
npm run tauri dev
```

### Production Build
```bash
npm run build
npm run tauri build
```

## 🔑 API Keys Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and generate an API key
3. Add to `.env`: `OPENAI_API_KEY=your_key_here`

### Google OAuth2 Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API, Gmail API, and Contacts API
4. Create OAuth2 credentials
5. Add authorized redirect URI: `http://localhost:8000/api/auth/google/callback`
6. Add credentials to `.env`

### SerpAPI (Optional)
1. Visit [SerpAPI](https://serpapi.com/)
2. Sign up and get your API key
3. Add to `.env`: `SERPAPI_KEY=your_key_here`

## 📱 Usage

### Getting Started
1. Launch the application
2. The AI assistant will greet you with an introduction
3. Connect your Google account for Calendar and Gmail integration
4. Start chatting with the AI to manage your productivity!

### Example Commands
- "Create a high-priority task to review quarterly reports by Friday"
- "What's on my calendar today?"
- "Summarize my last 5 emails"
- "Schedule a team meeting for tomorrow at 2 PM"
- "What are the latest trends in AI productivity tools?"

### Voice Commands
- Click the microphone icon to use voice input
- The assistant can also speak responses back to you
- Supports multiple languages and accents

## 🔧 Configuration

### Theme Customization
The app supports extensive theme customization through Tailwind CSS. You can modify colors, animations, and layouts in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Global styles and custom animations

### AI Behavior
Customize the AI assistant's behavior by modifying:
- `backend/services/ai_service.py` - AI response logic
- System prompts and response templates
- Intent analysis and action processing

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [Wiki](https://github.com/yourusername/ai-productivity-assistant/wiki)
- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/yourusername/ai-productivity-assistant/issues)
- **Discussions**: Join the community in [GitHub Discussions](https://github.com/yourusername/ai-productivity-assistant/discussions)

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Plugin system for custom integrations
- [ ] Advanced calendar conflict resolution
- [ ] Email templates and automation
- [ ] Team collaboration features
- [ ] Advanced analytics and insights
- [ ] Offline AI capabilities
- [ ] Custom voice training

### Version History
- **v0.1.0** - Initial MVP release with core features
- **v0.2.0** - Enhanced UI/UX and voice capabilities (planned)
- **v0.3.0** - Advanced integrations and automation (planned)

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Google for Calendar and Gmail APIs
- Tauri team for the amazing desktop framework
- React and TypeScript communities
- All contributors and users

---

**Built with ❤️ for productivity enthusiasts**