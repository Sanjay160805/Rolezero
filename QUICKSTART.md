# 🎯 QUICK START GUIDE

Get your Sui Roles app running in 5 minutes!

## ⚡ Super Quick Setup

### 1. Start the App (30 seconds)
```powershell
npm install
npm run dev
```
Open: http://localhost:5173

### 2. Connect Wallet (1 minute)
- Click "Connect Wallet"
- Select "Sui Wallet"
- Approve connection
- Get testnet SUI from https://faucet.sui.io/

### 3. Test the Flow (3 minutes)

**Create a test role:**
1. Go to "Create Role"
2. Fill in:
   - Name: `Test`
   - Start: Now
   - Expiry: 10 minutes from now
   - Recipient: **YOUR OWN ADDRESS** (paste from wallet)
   - Amount: `0.00001`
   - Scheduled: 2 minutes from now
3. Click "Create Role" → Confirm

**Fund it:**
1. Click "View Dashboard" or go to `/role/YOUR_ROLE_ID/live`
2. Click "Sponsor Now"
3. Send `0.0001` SUI
4. Watch balance update!

**Execute payment:**
1. Wait 2 minutes (or however long you scheduled)
2. Click "Execute Payments" button
3. Confirm transaction
4. Check "Live Transaction Feed" - you'll see the payment!
5. Check your wallet - balance increased! 🎉

## ✅ Verify It's Working

You should see:
- ✅ Balance shows correctly (not NaN)
- ✅ Dates show correctly (not Jan 1, 1970)
- ✅ "Execute Payments" button appears
- ✅ Live transactions show up
- ✅ Payment status shows "Ready" when time passes

## 🤖 Optional: Run the Bot

```powershell
# One-time setup
$env:SUI_PRIVATE_KEY="your_private_key"

# Run
node payment-bot.js
```

Bot will automatically execute payments every 5 minutes!

## 🎨 What You'll See

**Dashboard shows:**
- 📊 Total Funded
- 💸 Total Payments  
- 💰 Current Balance
- ⏰ Expiry Time
- 📅 Scheduled Payments (with status: Scheduled/Ready/Executed)
- 📡 Live Transaction Feed

**When payment is ready:**
- Payment card glows green
- Status shows "⚡ Ready to Execute"
- Banner says "Some payments are ready!"

**After execution:**
- Status changes to "✓ Executed"
- Transaction appears in Live Feed
- Your balance increases

## 🐛 Quick Troubleshooting

**"Connect Wallet" not working?**
- Install Sui Wallet extension
- Switch to Testnet in wallet
- Refresh page

**Transaction failing?**
- Get more SUI from faucet
- Check scheduled time is in the past
- Ensure role is funded

**Console errors?**
- Press F12 to open console
- Look for 🔍, 📦, ✅ emoji logs
- Share logs if you need help

## 🎓 Next Steps

1. **Try multiple payments** - Add 3-4 payments with different times
2. **Test with real addresses** - Send to a friend's wallet
3. **Run the bot** - Set it up for automatic execution
4. **Deploy to mainnet** - When ready for production

## 📚 Full Documentation

- See [COMPLETE-README.md](./COMPLETE-README.md) for full docs
- See [BOT-README.md](./BOT-README.md) for bot setup
- See original [README.md](./README.md) for project details

---

**Need help?** Check the console logs (F12) for debugging info!

**It's working if you see:**
```
Payment parsed: {recipient: "0x...", amount: 10000, scheduledTime: 1770..., scheduledDate: "Wed Feb..."}
✅ Parsed 2 transactions
```

Happy scheduling! 🚀
