# 🚀 Sui Roles - Automated Payment Scheduling Platform

A complete decentralized application for scheduling and automating cryptocurrency payments on the Sui blockchain. Perfect for salaries, subscriptions, vesting schedules, and recurring payments.

## ✨ Features

- ⏰ **Scheduled Payments** - Set future dates for automatic payment execution
- 💰 **Multi-Payment Roles** - Create roles with multiple scheduled payments
- 🤖 **Automated Execution** - Bot automatically executes payments when time arrives (3 execution options!)
- 📊 **Live Dashboard** - Real-time transaction monitoring and payment status
- 🔐 **Smart Contract Security** - Funds locked on blockchain until scheduled time
- 🌐 **Multi-Chain Support** - Sui (main), Ethereum, Solana wallet integration
- 📱 **Responsive UI** - Beautiful, modern interface with animations
- ✅ **Fixed Dates** - No more "Jan 1, 1970" errors - all timestamps working perfectly!

## 🎯 Use Cases

1. **💼 Employee Salaries** - Pay team members automatically on schedule
2. **👨‍💻 Contractor Payments** - Lock funds upfront, release on milestones  
3. **📅 Subscriptions** - Recurring monthly/weekly payments
4. **🎁 Token Vesting** - Distribute tokens over time
5. **👨‍👩‍👧 Allowances** - Automated family allowances

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Sui Wallet (Browser extension)
- Testnet SUI tokens from https://faucet.sui.io/

### Installation

```powershell
# Install dependencies
npm install

# Start development server  
npm run dev
```

Open http://localhost:5173 in your browser

## 📖 Complete User Flow

### Step 1: Create a Role

1. Navigate to **"Create Role"** page
2. Fill in the form:
   - **Role Name**: e.g., "Marketing Team Salary"
   - **Start Date**: When role becomes active
   - **Expiry Date**: When role ends
   - **Payment #1**:
     - Recipient: Wallet address (can use your own for testing!)
     - Amount: e.g., `0.00001` SUI
     - Scheduled Time: When to execute (e.g., 2 minutes from now for testing)
   - Add more payments if needed
3. Click **"Create Role"** and confirm in wallet
4. Copy the Role ID from success message

### Step 2: Fund the Role

1. Go to **Dashboard** (or click "View Dashboard" after creation)
2. Click **"Sponsor Now"** button
3. Enter amount to fund (must cover all scheduled payments)
4. Confirm transaction
5. Watch the balance update in real-time! ✅

### Step 3: Execute Payments (3 Options!)

#### **Option 1: Manual Dashboard Button** ✋
- Wait until scheduled time passes
- Click **"Execute Payments"** button in dashboard
- Payments with past scheduled times will execute
- See results in Live Transaction Feed

#### **Option 2: Automated Bot** 🤖
```powershell
# Set up bot (one-time)
$env:SUI_PRIVATE_KEY="your_private_key"
node payment-bot.js
```
- Bot checks every 5 minutes
- Automatically executes ready payments
- Logs all activity

#### **Option 3: Recipient Claims** 👛
- Recipient opens dashboard
- Sees payment is ready
- Clicks "Execute Payments"
- Receives payment instantly

**All 3 options work together!** Whoever executes first succeeds - others are automatically skipped.

### Step 4: Verify Success

Check these confirmations:
- ✅ Payment status shows "✓ Executed"
- ✅ Live Transaction Feed shows payment transaction
- ✅ Wallet balance increased
- ✅ SuiExplorer shows transaction

## 🧪 Testing with Single Wallet

Perfect for testing everything with just YOUR wallet:

```
1. Create role with YOUR address as recipient
2. Set scheduled time 2-3 minutes in future
3. Fund role with 0.0001 SUI
4. Wait for scheduled time
5. Click "Execute Payments"
6. Check your balance increased! 🎉
```

You're moving money from your left pocket to right pocket - perfect for testing!

## 🤖 Automated Bot Setup

### Quick Setup

```powershell
# 1. Get testnet SUI from faucet
# Visit: https://faucet.sui.io/

# 2. Export private key from Sui Wallet
# Wallet → Settings → Export Private Key

# 3. Set environment variable
$env:SUI_PRIVATE_KEY="your_private_key_here"

# 4. Run bot
node payment-bot.js
```

### Bot Features

- ✅ Checks all roles every 5 minutes
- ✅ Finds payments past scheduled time
- ✅ Executes payments automatically
- ✅ Logs everything with timestamps
- ✅ Shows SuiExplorer links
- ✅ Works 24/7 in background

See [BOT-README.md](./BOT-README.md) for full documentation.

## 📁 Project Structure

```
d:\ethereum/
├── src/
│   ├── components/
│   │   ├── Header/              # Navigation with wallet
│   │   ├── WalletModal/         # Multi-chain wallet modal
│   │   └── ui/                  # Reusable components
│   ├── pages/
│   │   ├── CreateRole/          # Create new roles
│   │   ├── RoleDashboard/       
│   │   │   ├── RoleDashboard.tsx      # Main dashboard
│   │   │   └── RoleDashboardLive.tsx  # Live monitoring
│   │   ├── RolesList/           # All roles overview
│   │   ├── SponsorPayment/      # Funding interface
│   │   └── UserProfile/         # User obligations
│   ├── hooks/
│   │   ├── useRoleData.ts           # ✅ Fixed date parsing
│   │   ├── useExecutePayments.ts    # Execute payments
│   │   ├── useLiveTransactions.ts   # ✅ Fixed live feed
│   │   └── useCreateRole.ts         # Create roles
│   ├── config/              # Blockchain configs
│   └── types/               # TypeScript types
├── move/                    # Smart contracts
│   └── sources/
│       └── role.move        # Payment role contract
├── payment-bot.js           # 🤖 Automated bot
├── BOT-README.md           # Bot documentation
└── vite.config.ts          # ✅ Fixed warnings
```

## 🔧 Configuration

### Update Package ID

After deploying Move contract, update in these files:

1. **src/pages/RoleDashboard/RoleCreation.jsx** (line 6)
2. **src/hooks/useExecutePayments.ts** (line 5)
3. **payment-bot.js** (line 13)

```javascript
const PACKAGE_ID = '0xYOUR_DEPLOYED_PACKAGE_ID';
```

## 🎨 Tech Stack

**Frontend:**
- ⚛️ React 18 + TypeScript
- 🎨 TailwindCSS + Custom CSS
- 🔄 Framer Motion (animations)
- 📡 TanStack Query (data fetching)
- 🎯 React Router v6

**Blockchain:**
- ⛓️ Sui Blockchain (Move)
- 👛 @mysten/dapp-kit
- 🔌 Wagmi (Ethereum)
- 🌐 Solana wallet adapter

**Smart Contracts:**
- 📝 Move language
- 🔒 On-chain scheduling
- ⏰ Clock-based execution

## ✅ Recent Fixes

### All Issues Resolved! 🎉

1. **✅ Date showing "Jan 1, 1970"**
   - Fixed nested blockchain data parsing
   - Proper timestamp handling
   - Dates now display correctly

2. **✅ Live transactions not showing**
   - Added comprehensive event matching
   - Fixed timestamp parsing
   - Real-time feed working perfectly

3. **✅ Amount showing "NaN SUI"**
   - Fixed amount field parsing
   - Handles string/number conversion
   - All amounts display correctly

4. **✅ Console warnings**
   - Added buffer polyfills
   - Added React Router future flags
   - Clean console output

5. **✅ Missing execute function**
   - Added execute payments button
   - Created automated bot
   - Three execution options working

## 🐛 Troubleshooting

### Check Console Logs (F12)

Look for these success messages:
```
🔍 Fetching live transactions for role
📦 Found X transaction blocks
Payment parsed: {recipient: "0x...", amount: 10000, scheduledTime: 1770210420000, scheduledDate: "Wed Feb 04 2026..."}
✅ Parsed X transactions
```

### Common Issues

**"Recipient: undefined" in console:**
- ✅ **FIXED** - Update applied automatically

**Wallet not connecting:**
- Install Sui Wallet extension
- Switch to Testnet
- Refresh page

**Transaction failing:**
- Check sufficient SUI for gas
- Verify role is funded
- Ensure scheduled time passed

**Bot not working:**
- Set SUI_PRIVATE_KEY environment variable
- Check bot has testnet SUI
- Verify PACKAGE_ID matches

## 📊 Features Checklist

### ✅ Fully Implemented

- [x] Create payment roles
- [x] Schedule multiple payments
- [x] Fund roles with SUI
- [x] Execute payments (3 ways!)
- [x] Automated bot
- [x] Live transaction feed
- [x] Real-time balance updates
- [x] Multi-wallet support
- [x] Beautiful UI with animations
- [x] Proper date/time display
- [x] Payment status tracking
- [x] Transaction history
- [x] Extend expiry time

### 🚧 Future Enhancements

- [ ] Email notifications
- [ ] Recurring templates
- [ ] Multi-token support
- [ ] Payment approvals
- [ ] Analytics dashboard
- [ ] Mobile app

## 📚 Smart Contract Functions

**Create Role:**
```move
public fun create_role(
    name: vector<u8>,
    start_time: u64,
    expiry_time: u64,
    recipients: vector<address>,
    amounts: vector<u64>,
    scheduled_times: vector<u64>,
    leftover_recipient: address,
    developer_fee: u64
)
```

**Fund Role:**
```move
public fun fund_role(
    role: &mut Role,
    payment: Coin<SUI>
)
```

**Execute Payments:**
```move
public fun execute_payments(
    role: &mut Role,
    clock: &Clock
)
```

## 🎓 How It Works

1. **Smart Contract Logic:**
   - Payments stored on-chain with timestamps
   - `execute_payments()` checks current time vs scheduled time
   - If time passed AND not executed → send payment
   - Sets `executed = true` to prevent double-execution

2. **Frontend:**
   - React queries blockchain for role data
   - Displays payments with status (Scheduled/Ready/Executed)
   - Button calls `execute_payments()` function
   - Live feed shows all funding and payment transactions

3. **Bot:**
   - Queries all roles every 5 minutes
   - Checks each payment's scheduled time
   - Calls `execute_payments()` for ready roles
   - Logs results and continues monitoring

## 📞 Support

Questions? Issues?
- Check console logs for detailed debugging
- Review BOT-README.md for bot setup
- Verify PACKAGE_ID is correct
- Ensure using Testnet

## 🎉 Success Indicators

Your app is working perfectly if you see:
- ✅ Correct dates (not 1970)
- ✅ Balances update in real-time
- ✅ Live transactions appear immediately
- ✅ Payments show correct status
- ✅ Execute button works
- ✅ Clean console logs

## 📝 License

MIT License - Feel free to use and modify!

---

**Built with ❤️ on Sui Blockchain**

Get testnet SUI: https://faucet.sui.io/
Sui Explorer: https://suiexplorer.com/?network=testnet
Sui Docs: https://docs.sui.io/
