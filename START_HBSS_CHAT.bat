@echo off
echo ========================================
echo Starting HBSS LiveChat
echo ========================================
echo.

echo Step 1: Starting Python Backend...
echo.
start cmd /k "cd hbss-backend && start.bat"

timeout /t 3 /nobreak >nul

echo Step 2: Starting Frontend...
echo.
start cmd /k "npm run dev"

echo.
echo ========================================
echo HBSS LiveChat is starting!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5174
echo.
echo Two terminal windows will open:
echo 1. Python Backend (keep it running)
echo 2. React Frontend (keep it running)
echo.
echo Press any key to exit this window...
pause >nul
