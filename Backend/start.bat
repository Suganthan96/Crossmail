@echo off
echo ==========================================
echo    CrossMail Backend Starter
echo ==========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/3] Installing dependencies...
    call npm install
    echo.
) else (
    echo [1/3] Dependencies already installed ✓
    echo.
)

echo [2/3] Starting Backend Server...
echo.
echo Backend will start on: http://localhost:3001
echo.
echo Next Steps:
echo 1. Open another terminal and run: ngrok http 3001
echo 2. Copy the ngrok HTTPS URL
echo 3. Update GOOGLE_REDIRECT_URI in .env file
echo 4. Add the URL to Google Cloud Console OAuth credentials
echo 5. Restart this server
echo 6. Visit: http://localhost:3001/api/auth/google
echo.
echo ==========================================
echo.

REM Start the server
call npm run dev
