@echo off
REM StreamZip Quick Start Script for Windows

echo.
echo 🚀 StreamZip Quick Start
echo ========================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% detected

REM Check if Redis is running
where redis-cli >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Redis CLI not found. Make sure Redis is installed.
    echo.
    echo 📥 Install Redis for Windows:
    echo    - Download from: https://github.com/tporadowski/redis/releases
    echo    - Or use WSL: wsl -d Ubuntu redis-server
    echo.
) else (
    redis-cli ping >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Redis is running
    ) else (
        echo ❌ Redis is not running. Please start Redis first:
        echo    redis-server
        echo    or in WSL: wsl -d Ubuntu redis-server
        pause
        exit /b 1
    )
)

echo.
echo 📦 Installing dependencies...
echo.

REM Install root dependencies
if not exist "node_modules\" (
    call npm install
)

REM Install backend dependencies
if not exist "backend\node_modules\" (
    cd backend
    call npm install
    cd ..
)

REM Install frontend dependencies
if not exist "frontend\node_modules\" (
    cd frontend
    call npm install
    cd ..
)

echo.
echo ⚙️  Checking configuration...
echo.

REM Create backend .env if not exists
if not exist "backend\.env" (
    echo 📝 Creating backend\.env from example...
    copy backend\.env.example backend\.env
)

REM Create frontend .env.local if not exists
if not exist "frontend\.env.local" (
    echo 📝 Creating frontend\.env.local from example...
    copy frontend\.env.local.example frontend\.env.local
)

REM Create temp directory
if not exist "temp\" mkdir temp
if not exist "logs\" mkdir logs

echo.
echo ✅ Setup complete!
echo.
echo 🎯 Starting development servers...
echo.
echo Backend will run on:  http://localhost:3000
echo Frontend will run on: http://localhost:3001
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start both servers
call npm run dev
