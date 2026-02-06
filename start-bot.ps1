# Quick Start Payment Bot
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " SUI PAYMENT BOT - AUTOMATED SETUP" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if private key is set
if (-not $env:SUI_PRIVATE_KEY) {
    Write-Host "[!] No bot wallet found. Generating new wallet..." -ForegroundColor Yellow
    Write-Host ""
    
    node generate-bot-wallet.js
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Green
    Write-Host "1. Fund the address at https://faucet.sui.io/" -ForegroundColor White
    Write-Host "2. Copy the private key above" -ForegroundColor White
    Write-Host "3. Run:" -ForegroundColor White
    Write-Host '   $env:SUI_PRIVATE_KEY="your_private_key_here"' -ForegroundColor Yellow
    Write-Host "   .\start-bot.ps1" -ForegroundColor Yellow
    Write-Host ""
    
    exit
}

Write-Host "[✓] Private key detected!" -ForegroundColor Green
Write-Host "[→] Starting payment bot..." -ForegroundColor Cyan
Write-Host ""

node payment-bot.js
