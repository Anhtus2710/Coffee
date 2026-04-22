@echo off
echo === Coffee Shop Port Manager ===

echo.
echo Checking port 5000 (Backend)...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo ❌ Port 5000 is in use
    echo Finding process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        echo Process ID: %%a
        tasklist /fi "pid eq %%a" 2>nul | findstr /v "INFO:"
        echo.
        set /p choice="Kill this process? (y/n): "
        if /i "!choice!"=="y" (
            taskkill /PID %%a /F >nul
            echo ✅ Process killed
        )
    )
) else (
    echo ✅ Port 5000 is free
)

echo.
echo Checking port 5173 (Frontend)...
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo ❌ Port 5173 is in use
    echo Finding process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
        echo Process ID: %%a
        tasklist /fi "pid eq %%a" 2>nul | findstr /v "INFO:"
        echo.
        set /p choice="Kill this process? (y/n): "
        if /i "!choice!"=="y" (
            taskkill /PID %%a /F >nul
            echo ✅ Process killed
        )
    )
) else (
    echo ✅ Port 5173 is free
)

echo.
echo === Setup Instructions ===
echo 1. Make sure MongoDB is running
echo 2. Run 'cd backend && npm run dev'
echo 3. Run 'cd frontend && npm run dev' (in new terminal)
echo 4. If ports are still busy, edit .env files to use different ports
echo.
pause