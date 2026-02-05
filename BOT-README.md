# 🤖 Automated Payment Execution Bot

This bot automatically executes scheduled payments for Sui Roles when their time arrives.

## 🚀 Quick Start

### 1. Install Dependencies
```powershell
npm install @mysten/sui.js
```

### 2. Set Up Private Key

**Get Testnet SUI:**
- Visit https://faucet.sui.io/
- Request testnet SUI tokens

**Export Your Private Key:**
From Sui Wallet:
1. Go to Settings → Export Private Key
2. Copy the private key (without 0x prefix)

**Set Environment Variable:**
```powershell
# PowerShell (Windows)
$env:SUI_PRIVATE_KEY="your_private_key_here"

# Or permanently:
[System.Environment]::SetEnvironmentVariable('SUI_PRIVATE_KEY', 'your_private_key', 'User')
```

### 3. Run the Bot
```powershell
node payment-bot.js
```

## 📊 What It Does

- ✅ Checks all roles every 5 minutes
- ✅ Finds payments that are past their scheduled time
- ✅ Automatically executes ready payments
- ✅ Logs all activity with timestamps
- ✅ Shows transaction links on SuiExplorer

## 🔒 Security Notes

- **Never commit your private key** to version control
- Use a dedicated wallet for the bot (not your main wallet)
- Only needs small amount of SUI for gas fees (~0.01 SUI)
- Bot only executes payments - cannot steal funds

## ⚙️ Configuration

Edit these values in `payment-bot.js`:

```javascript
const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const NETWORK = 'testnet'; // or 'mainnet'
```

## 📝 Example Output

```
🤖 Payment Execution Bot Started
📍 Bot Address: 0x1234...5678
🌐 Network: testnet
⏱️  Check Interval: 300s

💰 Bot Balance: 0.0500 SUI

⏰ 18:35:00 - Checking for ready payments...
📋 Found 3 total roles

💚 Role ready: "Marketing Team"
   ID: 0xabc...def
   Ready payments: 2
   Balance: 0.1000 SUI

🚀 Executing payments for role: 0xabc...def
✅ Success! Executed 2 payment(s)
📝 Transaction: https://suiexplorer.com/txblock/...

✓ All roles checked
```

## 🛠️ Troubleshooting

**Error: SUI_PRIVATE_KEY not set**
- Make sure you exported the private key
- Check environment variable: `echo $env:SUI_PRIVATE_KEY`

**Error: Insufficient gas**
- Get more testnet SUI from https://faucet.sui.io/

**No roles found**
- Verify PACKAGE_ID matches your deployed contract
- Check if you're on the correct network (testnet/mainnet)

## 🔄 Running Continuously

### Option 1: Keep Terminal Open
Just leave the bot running in a terminal window

### Option 2: Windows Task Scheduler
Create a scheduled task to run on startup

### Option 3: Cloud Deployment
Deploy to:
- Heroku
- AWS Lambda
- Google Cloud Functions
- DigitalOcean

## 📚 Integration with Dashboard

The bot works alongside the dashboard buttons:
- **Bot**: Automatic execution every 5 minutes
- **Dashboard**: Manual execution anytime
- **Recipients**: Can claim payments themselves

Whoever executes first succeeds - others are skipped!
