# Install ngrok script
Write-Host "Installing ngrok..." -ForegroundColor Cyan

# Download ngrok
$ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$ngrokZip = "$env:TEMP\ngrok.zip"
$ngrokDir = "C:\ngrok"

Write-Host "Downloading ngrok..."
Invoke-WebRequest -Uri $ngrokUrl -OutFile $ngrokZip

# Create directory
if (!(Test-Path $ngrokDir)) {
    New-Item -ItemType Directory -Path $ngrokDir -Force | Out-Null
}

# Extract using shell
Write-Host "Extracting..."
$shell = New-Object -ComObject Shell.Application
$zip = $shell.Namespace($ngrokZip)
foreach ($item in $zip.Items()) {
    $shell.Namespace($ngrokDir).CopyHere($item, 0x14)
}

# Verify
if (Test-Path "$ngrokDir\ngrok.exe") {
    Write-Host "✓ ngrok installed successfully!" -ForegroundColor Green
    Write-Host "Location: C:\ngrok\ngrok.exe" -ForegroundColor Yellow
    
    # Configure authtoken
    Write-Host "`nConfiguring authtoken..."
    & "$ngrokDir\ngrok.exe" config add-authtoken "34HR9eaf0WtHCmynzMNh33FgKuE_2Vp1rCBVQ8VhdXGe6chcX"
    
    Write-Host "`n✓ ngrok is ready!" -ForegroundColor Green
    Write-Host "`nTo start ngrok, run:" -ForegroundColor Cyan
    Write-Host "C:\ngrok\ngrok.exe http 3001" -ForegroundColor Yellow
} else {
    Write-Host "✗ Installation failed" -ForegroundColor Red
    Write-Host "Please download manually from: https://ngrok.com/download"
}
