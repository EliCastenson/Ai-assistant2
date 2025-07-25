# AI Assistant Desktop Application

A modern AI assistant desktop application built with Tauri, React, TypeScript, and FastAPI. Features task management, calendar integration, email organization, and a beautiful dark/light mode interface with smooth animations.

## 🚀 Features

- **Task Management**: Create, organize, and track tasks with priority levels
- **Calendar Integration**: Schedule events, meetings, and appointments
- **Email Organization**: Manage emails with read status and importance markers
- **Modern UI**: Beautiful interface with dark/light mode toggle and smooth animations
- **Real-time Data**: Live backend integration with SQLite database
- **Cross-platform**: Built with Tauri for Windows, macOS, and Linux

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** components
- **TanStack Query** for data fetching
- **Vite** for build tooling

### Backend
- **FastAPI** with Python
- **SQLAlchemy** ORM
- **SQLite** database
- **Pydantic** for data validation
- **Uvicorn** ASGI server

## 📦 Installation

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **npm** or **yarn**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-assistant-desktop
   ```

2. **Run the development setup script**
   ```bash
   python start_dev.py
   ```

   This script will:
   - Check dependencies
   - Install Python and Node.js packages
   - Set up the database with sample data
   - Start both backend and frontend servers

3. **Access the application**
   - Frontend: http://localhost:1420
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

If you prefer to set up manually:

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python seed_data.py  # Optional: add sample data
python -m uvicorn main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🎨 UI Features

### Dark/Light Mode Toggle
- Sleek animated toggle with smooth transitions
- System preference detection
- Persistent theme storage
- Beautiful gradient animations

### Tab Navigation
- Smooth tab transitions with Framer Motion
- Animated tab indicators
- Responsive design

### Interactive Components
- Hover animations on buttons and cards
- Loading spinners with smooth rotations
- Form animations (slide in/out)
- Staggered list item animations

## 📱 Application Structure

```
ai-assistant-desktop/
├── backend/
│   ├── app/
│   │   ├── api/routes/     # API endpoints
│   │   ├── core/           # Database and config
│   │   ├── models/         # Data models
│   │   └── services/       # Business logic
│   ├── main.py            # FastAPI app
│   ├── requirements.txt   # Python dependencies
│   └── seed_data.py       # Sample data script
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and API client
│   │   └── hooks/         # Custom React hooks
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # UI configuration
└── start_dev.py          # Development startup script
```

## 🔌 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `PATCH /api/tasks/{id}/toggle` - Toggle completion
- `DELETE /api/tasks/{id}` - Delete task

### Calendar
- `GET /api/calendar` - Get calendar events
- `POST /api/calendar` - Create new event
- `PUT /api/calendar/{id}` - Update event
- `DELETE /api/calendar/{id}` - Delete event

### Email
- `GET /api/email` - Get emails
- `POST /api/email` - Create new email
- `PATCH /api/email/{id}/read` - Mark as read
- `PATCH /api/email/{id}/important` - Toggle importance
- `DELETE /api/email/{id}` - Delete email

## 🎯 Usage

### Tasks Tab
- Click "Add Task" to create new tasks
- Set priority levels (High, Medium, Low)
- Check tasks to mark as complete
- Delete tasks with the trash icon

### Calendar Tab
- Click "Add Event" to schedule new events
- Set start/end times with datetime picker
- Add location and description
- View events in chronological order

### Emails Tab
- View emails in inbox format
- Click emails to read full content
- Star important emails
- Mark emails as read automatically

### Theme Toggle
- Click the animated toggle in the header
- Switches between light and dark modes
- Smooth transitions with spring animations
- Remembers your preference

## 🚀 Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm run test
```

### Building for Production
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm run build

# Tauri (for desktop app)
npm run tauri build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- UI inspired by contemporary design systems
- Icons from Lucide React
- Animations powered by Framer Motion