@echo off
title BDMS Frontend
echo ===================================================
echo   Starting Blood Donation Management System Frontend
echo ===================================================
echo.
cd /d "%~dp0\frontend"

echo [1/2] Checking node_modules...
if not exist "node_modules\" (
    echo [INFO] Installing frontend dependencies...
    npm install
)
echo.

echo [2/2] Launching Vite development server...
npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Frontend failed to start. Make sure Node.js is installed.
)
pause
