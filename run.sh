#!/bin/bash

# Mentora - Dev Server Starter Script
# This script starts both the backend (FastAPI) and the frontend (React) development servers.

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧠 Mentora - Starting Development Servers...${NC}"

# Start FastAPI backend
echo -e "${GREEN}🚀 Starting Backend (FastAPI)...${NC}"
cd backend
if [ -d ".venv" ]; then
    ./.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
elif [ -d "venv" ]; then
    ./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
else
    echo "⚠️  Virtual environment (.venv or venv) not found in backend/. Running standard uvicorn..."
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
fi
cd ..

# Start React frontend
echo -e "${GREEN}💻 Starting Frontend (React)...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Graceful shutdown on Ctrl+C
cleanup() {
    echo -e "\n${BLUE}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep the script running
wait
