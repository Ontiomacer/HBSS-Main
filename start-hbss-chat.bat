@echo off
echo ========================================
echo HBSS LiveChat with Clerk Auth
echo ========================================
echo.

echo [1/3] Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Installing backend dependencies...
cd hbss-backend
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [3/3] Starting servers...
echo.
echo Backend will start on: http://localhost:8000
echo Frontend will start on: http://localhost:5174
echo.
echo Press Ctrl+C to stop the servers
echo.

start "HBSS Backend" cmd /k "python main.py"
cd ..
start "HBSS Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Servers are starting...
echo Open http://localhost:5174/hbss in your browser
echo ========================================
pause
