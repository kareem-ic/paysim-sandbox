#!/bin/bash

# Development Script for Serverless Payments Sandbox
# This script runs the mock API server and frontend for local development

set -e

echo "🚀 Starting Serverless Payments Sandbox Development Environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install it first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Create .env file for frontend
cd ../frontend
cat > .env << EOF
VITE_API_URL=http://localhost:3000
VITE_API_KEY=mock-api-key-for-development
EOF

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down development environment..."
    kill $MOCK_SERVER_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start mock API server in background
echo "🌐 Starting mock API server..."
cd ../backend
python3 mock_server.py &
MOCK_SERVER_PID=$!

# Wait for server to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Development environment started!"
echo ""
echo "📋 Services running:"
echo "🌐 Mock API Server: http://localhost:3000"
echo "🎨 Frontend: http://localhost:5173"
echo "📚 API Docs: http://localhost:3000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for background processes
wait 