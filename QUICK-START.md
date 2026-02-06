# ⚡ QUICK START - Payment Bot

## 1️⃣ Generate Bot Wallet (One-time)
```bash
node generate-bot-wallet.js
```
**Copy the private key and address!**

## 2️⃣ Fund Bot Wallet
1. Go to: https://faucet.sui.io/
2. Paste bot address
3. Request testnet SUI
4. Wait 10 seconds

## 3️⃣ Start Bot
```bash
# PowerShell
$env:SUI_PRIVATE_KEY="paste_your_private_key_here"
.\start-bot.ps1
```

## 4️⃣ Start Frontend
```bash
# New terminal
npm run dev
```
Open: http://localhost:5175/

---

## ✅ Bot is Working When You See:
```
🤖 Payment Execution Bot Started
📍 Bot Address: 0x...
⏱️ Check Interval: 120s

🔍 Checking for due payments...
```

---

## 🎬 Quick Demo (2 minutes)

1. **Create Role** with payment in 1 minute
2. **Show bot terminal** to judges
3. **Close browser** (to show it's automated)
4. **Wait for bot** console to show:
   ```
   ✅ Found 1 payments ready!
   💸 Executing payment to 0x123...
   ✅ Payment executed!
   ```
5. **Re-open browser** - payment done!

---

## 🐛 Troubleshooting

**Bot not starting?**
→ Check: `$env:SUI_PRIVATE_KEY` is set

**"Insufficient gas"?**
→ Fund bot at https://faucet.sui.io/

**"No roles found"?**
→ Create a role in frontend first

**Bot not executing?**
→ Check payment time is in the past

---

## 📞 Emergency Commands

**Check bot balance:**
```bash
node -e "console.log(process.env.SUI_PRIVATE_KEY)"
```

**Restart bot:**
```bash
Ctrl+C
.\start-bot.ps1
```

**Check if bot running:**
Look for console output every 2 minutes

---

## 🏆 What Makes This Special

✅ True automation (no user interaction)
✅ 24/7 operation
✅ Handles multiple roles simultaneously
✅ Auto-returns expired role funds
✅ Production-ready architecture

**This is Sui's answer to Cron jobs!** 🚀
