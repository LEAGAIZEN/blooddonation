@echo off
title BDMS Backend
echo ===================================================
echo   Starting Blood Donation Management System Backend
echo ===================================================
echo.
cd /d "%~dp0\backend"

echo [1/3] Activating virtual environment...
if exist "..\venv\Scripts\activate.bat" (
    call "..\venv\Scripts\activate.bat"
) else if exist "venv_win\Scripts\activate.bat" (
    call "venv_win\Scripts\activate.bat"
) else (
    echo [WARNING] Virtual environment not found, trying global python.
)
echo.

echo [2/3] Checking dependencies...
python -c "import fastapi" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing required packages...
    pip install -r requirements.txt
)
echo.

echo [3/3] Launching FastAPI server (app.main)...
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend failed to start. Please check the error above.
)
pause
