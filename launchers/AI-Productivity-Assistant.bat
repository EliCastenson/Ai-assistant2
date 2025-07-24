@echo off
:: AI Productivity Assistant - Windows Launcher
:: This batch file can be double-clicked to start the application

setlocal enabledelayedexpansion

:: Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."

:: Change to project directory
cd /d "%PROJECT_DIR%"

:: Check if we're in the right directory
if not exist "package.json" (
    echo Error: Please run from the project directory
    pause
    exit /b 1
)

if not exist "backend\main.py" (
    echo Error: Backend files not found
    pause
    exit /b 1
)

:: Function to show notification
echo.
echo ===============================================
echo    🧠 AI Productivity Assistant
echo ===============================================
echo.

:: Check dependencies
echo [INFO] Checking dependencies...

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>&1
if errorlevel 1 (
    where python3 >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Python is not installed or not in PATH
        echo Please install Python from https://python.org/
        pause
        exit /b 1
    ) else (
        set "PYTHON_CMD=python3"
    )
) else (
    set "PYTHON_CMD=python"
)

echo [SUCCESS] Dependencies found

:: Setup environment
echo [INFO] Setting up environment...

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [WARNING] Created .env file from template
        echo [INFO] Please configure your API keys in the .env file
        start notepad.exe .env
        echo Press any key after configuring your API keys...
        pause >nul
    ) else (
        echo [ERROR] Missing .env.example file
        pause
        exit /b 1
    )
)

:: Install dependencies
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

if not exist "backend\venv" (
    echo [INFO] Creating Python virtual environment...
    cd backend
    %PYTHON_CMD% -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create Python virtual environment
        pause
        exit /b 1
    )
    
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install Python dependencies
        pause
        exit /b 1
    )
    cd ..
)

:: Check if already running
echo [INFO] Checking if application is already running...

netstat -an | find ":1420" >nul 2>&1
if not errorlevel 1 (
    netstat -an | find ":8000" >nul 2>&1
    if not errorlevel 1 (
        echo [INFO] Application is already running. Opening browser...
        start http://localhost:1420
        exit /b 0
    )
)

:: Kill any existing processes on our ports
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":1420" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Start backend
echo [INFO] Starting backend server...
cd backend
call venv\Scripts\activate.bat
start /B %PYTHON_CMD% -m uvicorn main:app --host 0.0.0.0 --port 8000
cd ..

:: Wait for backend to start
echo [INFO] Waiting for backend to start...
set /a counter=0
:wait_backend
ping -n 2 127.0.0.1 >nul
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    set /a counter+=1
    if !counter! lss 30 goto wait_backend
    echo [ERROR] Backend failed to start within 30 seconds
    pause
    exit /b 1
)

echo [SUCCESS] Backend started successfully

:: Start frontend
echo [INFO] Starting frontend application...
start /B npm run dev

:: Wait for frontend to start
echo [INFO] Waiting for frontend to start...
set /a counter=0
:wait_frontend
ping -n 2 127.0.0.1 >nul
curl -s http://localhost:1420 >nul 2>&1
if errorlevel 1 (
    set /a counter+=1
    if !counter! lss 30 goto wait_frontend
    echo [ERROR] Frontend failed to start within 30 seconds
    pause
    exit /b 1
)

echo [SUCCESS] Frontend started successfully

:: Success! Open browser
echo.
echo ===============================================
echo    🚀 AI Assistant Ready!
echo ===============================================
echo.
echo Application started successfully!
echo Opening browser at http://localhost:1420
echo.
echo Services running:
echo   Frontend: http://localhost:1420
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo Close this window to stop the application.
echo ===============================================

:: Open browser
start http://localhost:1420

:: Keep window open and wait for user to close
echo.
echo Press any key to stop the application...
pause >nul

:: Cleanup - kill the processes
echo [INFO] Stopping services...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":1420" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [SUCCESS] Application stopped successfully
echo Goodbye!
pause