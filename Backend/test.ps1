# CrossMail Backend Test Script
# Run this after the backend server is running

$BASE_URL = "http://localhost:3001"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   CrossMail Backend Test Suite" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "[Test 1] Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
    Write-Host "✓ Server is running!" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
    Write-Host "  Message: $($response.message)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Server is not running!" -ForegroundColor Red
    Write-Host "  Make sure to start the server first: npm start" -ForegroundColor Gray
    exit
}
Write-Host ""

# Test 2: Get Wallet Address
Write-Host "[Test 2] Get Wallet Address..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/wallet/address" -Method Get
    Write-Host "✓ Wallet address retrieved!" -ForegroundColor Green
    Write-Host "  Address: $($response.address)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to get wallet address" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get Wallet Balance
Write-Host "[Test 3] Get Wallet Balance (Sepolia)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/wallet/balance?network=sepolia" -Method Get
    Write-Host "✓ Balance retrieved!" -ForegroundColor Green
    Write-Host "  Address: $($response.address)" -ForegroundColor Gray
    Write-Host "  Balance: $($response.balance) ETH" -ForegroundColor Gray
    Write-Host "  Network: $($response.network)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to get balance" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 4: Get Supported Networks
Write-Host "[Test 4] Get Supported Networks..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/wallet/networks" -Method Get
    Write-Host "✓ Networks retrieved!" -ForegroundColor Green
    foreach ($network in $response.networks) {
        Write-Host "  - $($network.name) (Chain ID: $($network.chainId))" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Failed to get networks" -ForegroundColor Red
}
Write-Host ""

# Test 5: Check Authentication Status
Write-Host "[Test 5] Check Authentication Status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/status" -Method Get
    if ($response.authenticated) {
        Write-Host "✓ User is authenticated!" -ForegroundColor Green
        Write-Host "  Email: $($response.email)" -ForegroundColor Gray
    } else {
        Write-Host "⚠ Not authenticated yet" -ForegroundColor Yellow
        Write-Host "  Visit: $BASE_URL/api/auth/google to authenticate" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠ Not authenticated" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Test Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Authenticate with Gmail:" -ForegroundColor Gray
Write-Host "   $BASE_URL/api/auth/google" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. After authentication, you can:" -ForegroundColor Gray
Write-Host "   - List emails" -ForegroundColor Gray
Write-Host "   - Send emails" -ForegroundColor Gray
Write-Host "   - Send transactions with notifications" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Example transaction command:" -ForegroundColor Gray
Write-Host '   curl -X POST http://localhost:3001/api/transaction/send \' -ForegroundColor Cyan
Write-Host '     -H "Content-Type: application/json" \' -ForegroundColor Cyan
Write-Host '     -d "{\"to\":\"0xAddress\",\"amount\":\"0.001\",\"network\":\"sepolia\",\"notifyEmail\":\"your@gmail.com\"}"' -ForegroundColor Cyan
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
