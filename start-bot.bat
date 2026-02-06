@echo off
echo.
echo ================================================
echo  SUI PAYMENT BOT - AUTOMATED SETUP
echo ================================================
echo.

REM Check if private key is set
if not defined SUI_PRIVATE_KEY (
    echo [!] No bot wallet found. Generating new wallet...
    echo.
    node generate-bot-wallet.js
    echo.
    echo ================================================
    echo.
    echo Copy the private key above and run:
    echo   SET SUI_PRIVATE_KEY=your_private_key_here
    echo   start-bot.bat
    echo.
    echo Or manually set it in PowerShell:
    echo   $env:SUI_PRIVATE_KEY="your_private_key_here"
    echo   node payment-bot.js
    echo.
    pause
    exit /b
)

echo [✓] Private key detected!
echo [→] Starting payment bot...
echo.
node payment-bot.js
