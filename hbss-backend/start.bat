@echo off
echo ========================================
echo HBSS LiveChat Backend Server
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo.

REM Run the server
echo Starting HBSS LiveChat Backend...
echo Server will run on http://localhost:8000
echo WebSocket endpoint: ws://localhost:8000/ws
echo.
python main.py
