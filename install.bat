@echo off
setlocal

:: Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python is not installed. Please install it from https://www.python.org/
    exit /b 1
)

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install it from https://nodejs.org/en
    exit /b 1
)

:: Create virtual environment if it doesn't exist
if not exist venv (
    python -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate

:: Upgrade pip to avoid outdated issues
python -m pip install --upgrade pip

:: Install Python dependencies
pip install -r requirements.txt

:: Navigate to frontend folder if it exists and install dependencies
if exist frontend (
    cd frontend
    npm install
    npm run dev
    cd ..
) else (
    echo Frontend folder not found. Skipping frontend setup.
)

:: Start backend server in a new PowerShell window
start powershell -NoExit -Command "cd %cd%; venv\Scripts\activate; uvicorn server:app --port 8000 --reload"

:: Done
echo Setup complete! Press any key to exit.
pause
