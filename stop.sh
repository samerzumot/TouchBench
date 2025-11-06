#!/bin/bash

# TouchBench v0 - Stop Script
# This script stops both the backend and frontend servers

echo "🛑 Stopping TouchBench v0..."

# Stop backend
if [ -f /tmp/touchbench-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/touchbench-backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        kill $BACKEND_PID
        echo "✅ Backend stopped (PID: $BACKEND_PID)"
    else
        echo "⚠️  Backend not running"
    fi
    rm /tmp/touchbench-backend.pid
fi

# Stop frontend
if [ -f /tmp/touchbench-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/touchbench-frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        kill $FRONTEND_PID
        echo "✅ Frontend stopped (PID: $FRONTEND_PID)"
    else
        echo "⚠️  Frontend not running"
    fi
    rm /tmp/touchbench-frontend.pid
fi

# Also kill any remaining uvicorn or next processes
pkill -f "uvicorn main:app" 2>/dev/null && echo "✅ Cleaned up uvicorn processes"
pkill -f "next dev" 2>/dev/null && echo "✅ Cleaned up next processes"

echo ""
echo "TouchBench v0 stopped successfully!"
