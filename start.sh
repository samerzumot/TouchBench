#!/bin/bash

# TouchBench v0 - Startup Script
# This script starts both the backend and frontend servers

echo "🚀 Starting TouchBench v0..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt --quiet
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""

# Start backend
echo "🔧 Starting backend server on http://localhost:8000..."
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > /tmp/touchbench-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/ > /dev/null; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend failed to start. Check logs: /tmp/touchbench-backend.log"
    exit 1
fi

echo ""

# Start frontend
echo "🎨 Starting frontend server on http://localhost:3000..."
cd frontend
PORT=3000 npm run dev > /tmp/touchbench-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 10

# Check if frontend is running
if curl -s http://localhost:3000/ > /dev/null; then
    echo "✅ Frontend is running!"
else
    echo "❌ Frontend failed to start. Check logs: /tmp/touchbench-frontend.log"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ TouchBench v0 is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:8000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "📝 Logs:"
echo "   Backend:  /tmp/touchbench-backend.log"
echo "   Frontend: /tmp/touchbench-frontend.log"
echo ""
echo "To stop the servers, run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to view logs (servers will keep running)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Save PIDs to file for easy stopping
echo "$BACKEND_PID" > /tmp/touchbench-backend.pid
echo "$FRONTEND_PID" > /tmp/touchbench-frontend.pid

# Keep script running and show logs
tail -f /tmp/touchbench-backend.log /tmp/touchbench-frontend.log
