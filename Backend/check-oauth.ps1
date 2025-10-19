Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   CrossMail OAuth Diagnostic" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check .env file
Write-Host "1. Checking .env configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "GOOGLE_REDIRECT_URI=(.+)") {
        $redirectUri = $matches[1].Trim()
        Write-Host "   ✓ GOOGLE_REDIRECT_URI found" -ForegroundColor Green
        Write-Host "   URI: $redirectUri" -ForegroundColor Gray
    } else {
        Write-Host "   ✗ GOOGLE_REDIRECT_URI not found in .env" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ .env file not found" -ForegroundColor Red
}

Write-Host ""

# Check if backend is running
Write-Host "2. Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✓ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend is not running" -ForegroundColor Red
    Write-Host "   Start it with: npm start" -ForegroundColor Gray
}

Write-Host ""

# Check if ngrok is running
Write-Host "3. Checking if ngrok is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:4040/api/tunnels" -UseBasicParsing -ErrorAction Stop
    $tunnels = $response.Content | ConvertFrom-Json
    if ($tunnels.tunnels.Count -gt 0) {
        $publicUrl = $tunnels.tunnels[0].public_url
        Write-Host "   ✓ ngrok is running" -ForegroundColor Green
        Write-Host "   Public URL: $publicUrl" -ForegroundColor Gray
        
        # Check if URL matches .env
        if ($redirectUri -and $redirectUri.StartsWith($publicUrl)) {
            Write-Host "   ✓ ngrok URL matches .env" -ForegroundColor Green
        } else {
            Write-Host "   ✗ ngrok URL doesn't match .env" -ForegroundColor Red
            Write-Host "   Update .env GOOGLE_REDIRECT_URI to:" -ForegroundColor Yellow
            Write-Host "   $publicUrl/api/auth/callback" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "   ✗ ngrok is not running" -ForegroundColor Red
    Write-Host "   Start it with: C:\ngrok\ngrok.exe http 3001" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Go to: https://console.cloud.google.com/apis/credentials" -ForegroundColor Gray
Write-Host "2. Click on your OAuth 2.0 Client ID" -ForegroundColor Gray
Write-Host "3. Add this to 'Authorized redirect URIs':" -ForegroundColor Gray
Write-Host "   $redirectUri" -ForegroundColor Cyan
Write-Host "4. Click SAVE" -ForegroundColor Gray
Write-Host "5. Wait 30 seconds" -ForegroundColor Gray
Write-Host "6. Try: http://localhost:3001/api/auth/google" -ForegroundColor Gray
Write-Host ""
