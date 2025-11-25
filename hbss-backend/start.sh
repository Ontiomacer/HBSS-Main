#!/bin/bash

echo "========================================"
echo "HBSS LiveChat Backend Server"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
echo ""

# Run the server
echo "Starting HBSS LiveChat Backend..."
echo "Server will run on http://localhost:8000"
echo "WebSocket endpoint: ws://localhost:8000/ws"
echo ""
python main.py
