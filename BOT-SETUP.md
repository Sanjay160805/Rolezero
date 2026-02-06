# 🤖 Payment Bot Setup Guide

## Quick Setup (3 Steps)

### Step 1: Generate Bot Wallet
```bash
node generate-bot-wallet.js
```

This will create a new wallet and show you:
- Bot Address (for funding)
- Private Key (keep secret!)

### Step 2: Fund the Bot
1. Go to https://faucet.sui.io/
2. Paste the Bot Address
3. Click "Request Testnet SUI"
4. Wait 10 seconds for confirmation

### Step 3: Start the Bot
```bash
# PowerShell
$env:SUI_PRIVATE_KEY="your_private_key_from_step1"
node payment-bot.js
```

**OR use the batch file:**
```bash
.\start-bot.bat
```

---

## What the Bot Does

✅ **Checks every 2 minutes** for payments that are due
✅ **Automatically executes** payments without your approval
✅ **Returns leftover funds** when roles expire
✅ **Logs everything** to console

---

## For Hackathon Demo

1. **Keep the bot running in a separate terminal**
2. **Create a role with payment scheduled 1-2 minutes ahead**
3. **Show judges the bot console**
4. **Watch it auto-execute without touching anything!**

This demonstrates:
- ⚡ Full automation
- 🔐 Backend wallet management  
- 📊 Event monitoring
- 🎯 Production-ready architecture

---

## Troubleshooting

**"SUI_PRIVATE_KEY not set"**
→ Run: `$env:SUI_PRIVATE_KEY="your_key"`

**"Insufficient gas"**
→ Get more SUI from faucet

**"No roles found"**
→ Create a role in the frontend first

---

## Architecture (For Judges)

```
Frontend (Browser)          Backend (Bot)
    ↓                            ↓
Create Role              Monitor Blockchain
Fund Role           →    Detect Due Payments
Logout/Close        →    Execute Automatically
                         Return Expired Funds
```

**Key Innovation:** Bot has its own wallet, so users don't need to stay online!
