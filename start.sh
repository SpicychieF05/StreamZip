#!/bin/bash

# StreamZip Quick Start Script

echo "🚀 StreamZip Quick Start"
echo "========================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if Redis is running
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis CLI not found. Make sure Redis is installed."
else
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running"
    else
        echo "❌ Redis is not running. Please start Redis first:"
        echo "   redis-server"
        exit 1
    fi
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
if [ ! -d "node_modules" ]; then
    npm install
fi

# Install backend dependencies
if [ ! -d "backend/node_modules" ]; then
    cd backend
    npm install
    cd ..
fi

# Install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "⚙️  Checking configuration..."
echo ""

# Create backend .env if not exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env from example..."
    cp backend/.env.example backend/.env
fi

# Create frontend .env.local if not exists
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend/.env.local from example..."
    cp frontend/.env.local.example frontend/.env.local
fi

# Create temp directory
mkdir -p temp
mkdir -p logs

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Starting development servers..."
echo ""
echo "Backend will run on:  http://localhost:3000"
echo "Frontend will run on: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers
npm run dev
