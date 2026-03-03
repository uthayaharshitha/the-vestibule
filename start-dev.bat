@echo off
REM Add Node.js to PATH for this session
set PATH=%PATH%;C:\Program Files\nodejs

REM Navigate to project directory
cd /d "%~dp0"

REM Check if .env.local has placeholders
findstr "your-project-url" .env.local >nul
if %errorlevel% equ 0 (
    echo.
    echo [ERROR] .env.local still contains placeholder values!
    echo Please update .env.local with your Supabase credentials.
    echo.
    pause
    exit /b 1
)

REM Start development server
echo Starting development server...
npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server crashed or failed to start.
    pause
)
