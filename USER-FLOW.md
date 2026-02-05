# 🚀 Complete User Flow Guide

## Overview
This application allows users to create roles with scheduled payments on the Sui blockchain, fund them, and execute payments automatically or manually.

---

## 👥 User Types & Capabilities

### 1. **Role Creator** (Person who creates the role)
- ✅ Create new roles with scheduled payments
- ✅ View their created roles
- ✅ Extend expiry time
- ✅ Fund roles
- ✅ Execute payments (when ready)
- ✅ Monitor live transactions
- ✅ View scheduled payments

### 2. **Sponsors** (Anyone who wants to fund a role)
- ✅ View all roles
- ✅ Fund any role with SUI tokens
- ✅ Extend expiry time of any role
- ✅ Execute payments (when ready)
- ✅ Monitor live transactions

### 3. **Recipients** (People receiving payments)
- ✅ View all roles
- ✅ Execute their own payments when ready
- ✅ Monitor when they'll receive funds
- ✅ Extend expiry time

### 4. **Automated Bot** (Optional)
- ✅ Executes payments automatically every 5 minutes
- ✅ No human interaction needed
- ✅ Runs in background

---

## 📋 Complete User Flows

### Flow 1: Creating a Role with Scheduled Payments

**Step 1: Connect Wallet**
```
1. Open application: http://localhost:5173
2. Click "Connect Wallet" in header
3. Select Sui wallet (e.g., Sui Wallet, Suiet)
4. Approve connection
```

**Step 2: Navigate to Create Role**
```
1. Click "Create Role" in navigation
2. Or go directly to: /create
```

**Step 3: Fill Role Details**
```
Basic Information:
├── Role Name: e.g., "Marketing Team"
├── Description: e.g., "Monthly payments for marketing expenses"
├── Start Time: When role becomes active (future date/time)
└── Expiry Time: When role ends (must be after start time)

Example:
- Start: Feb 5, 2026 at 00:00
- Expiry: Dec 31, 2026 at 23:59
```

**Step 4: Add Scheduled Payments**
```
For each payment:
├── Recipient Address: Sui wallet address (0x...)
├── Amount: In SUI tokens (e.g., 100 SUI)
└── Scheduled Time: When payment executes (between start and expiry)

Example Payments:
Payment 1:
- Recipient: 0xabc123...
- Amount: 100 SUI
- Schedule: Feb 10, 2026 at 10:00

Payment 2:
- Recipient: 0xdef456...
- Amount: 50 SUI
- Schedule: Feb 20, 2026 at 10:00

Payment 3:
- Recipient: 0xabc123...
- Amount: 100 SUI
- Schedule: Mar 10, 2026 at 10:00
```

**Step 5: Submit & Fund**
```
1. Click "Create Role" button
2. Approve transaction in wallet
3. Initial funding: Total of all scheduled payments (250 SUI in example)
4. Wait for blockchain confirmation (~5 seconds)
5. Redirected to Role Dashboard
```

**Result:**
- ✅ Role created on Sui blockchain
- ✅ Funded with initial amount
- ✅ Scheduled payments registered
- ✅ Role ID generated (0x...)

---

### Flow 2: Funding an Existing Role

**Option A: From Dashboard**
```
1. Navigate to Role Dashboard: /role/{roleId}/live
2. Click "Sponsor Now" button
3. Redirected to sponsor page
```

**Option B: From Roles List**
```
1. Go to "Roles" page: /roles
2. Find desired role
3. Click "View Details"
4. Click "Sponsor Now"
```

**Option C: Direct Link**
```
Go directly to: /sponsor/{roleId}
```

**Funding Process:**
```
1. See role information (name, description)
2. Choose payment method:
   
   Method 1: Sui Wallet
   ├── Enter amount in SUI
   ├── Click "Pay from Sui Wallet"
   ├── Approve transaction
   └── Get transaction digest
   
   Method 2: QR Code
   ├── Scan QR code with mobile wallet
   ├── Enter amount in wallet
   └── Confirm payment

3. Success! Payment recorded on blockchain
4. View live dashboard to see transaction
```

**Result:**
- ✅ Role balance increased
- ✅ Transaction appears in live feed
- ✅ More payments can now be executed

---

### Flow 3: Executing Payments (3 Methods)

#### Method 1: Manual Button Execution ⚡

**Who can execute:** Anyone with a Sui wallet

```
1. Navigate to Role Dashboard: /role/{roleId}/live
2. Check "Scheduled Payments" section
3. Look for payments with status:
   - 🟢 "Ready to Execute" = Can execute NOW
   - 🟡 "Scheduled" = Wait for scheduled time
   - ⚪ "Executed" = Already completed

4. Click "Execute Payments" button (top right)
5. Approve transaction in wallet
6. Wait ~5 seconds for confirmation

Result:
- All ready payments executed simultaneously
- Recipients receive SUI in their wallets
- Status changes to "Executed"
- Live feed updates with payment transactions
```

**Best for:**
- One-time payments
- Manual control
- Testing purposes

---

#### Method 2: Automated Bot Execution 🤖

**Setup (One-time):**
```bash
1. Create .env file in project root:
   SUI_PRIVATE_KEY=your_private_key_here
   SUI_RPC_URL=https://fullnode.mainnet.sui.io:443
   PACKAGE_ID=0x0067cc0149eabee42d24049acabd450486977295fac652f71dd5b2f4f69cbdab

2. Install dependencies:
   npm install

3. Start bot:
   node payment-bot.js
```

**How it works:**
```
Every 5 minutes, the bot:
1. Queries all roles from blockchain
2. Checks each role for ready payments
3. Automatically executes when:
   - Current time >= Scheduled time
   - Role is active (between start and expiry)
   - Payment not already executed
   - Sufficient balance in role

4. Logs all actions to console
5. Repeats every 5 minutes
```

**Console output:**
```
🤖 Starting automated payment execution bot...
✅ Connected to Sui blockchain
🔍 Checking 3 roles for ready payments...
📦 Role: Marketing Team
  └── ✅ Executed 2 payments
⏰ Next check in 5 minutes...
```

**Best for:**
- Production environments
- Automatic recurring payments
- Hands-off operation
- 24/7 reliability

---

#### Method 3: Recipient Claims 💰

**Who can execute:** Anyone (including recipients)

```
Recipients can:
1. Navigate to role dashboard
2. See their pending payments
3. Click "Execute Payments" button
4. Claim their funds

Note: When any payment in a role is executed, ALL ready payments execute together.
```

**Best for:**
- Recipients who want immediate access
- Decentralized execution
- When bot is not running

---

### Flow 4: Extending Expiry Time ⏰

**Who can extend:** **ANYONE** (Not just creator!)

**Why extend?**
- Role is about to expire
- Want to keep it active longer
- Add more time for future payments

**Process:**
```
1. Go to Role Dashboard: /role/{roleId}/live
2. Scroll to "Extend Expiry Time" section
3. See current expiry date and status:
   - ✅ Active
   - ❌ Expired  
   - ⏳ Not Started

4. Choose new expiry date/time:
   - Must be AFTER current expiry
   - Use datetime picker
   
5. Click "Extend Expiry" button
6. Approve transaction in wallet
7. Wait for confirmation

Result:
- ✅ Expiry time updated on blockchain
- ✅ Role stays active longer
- ✅ Can execute more payments
```

**Example:**
```
Current Expiry: Dec 31, 2026 at 23:59
New Expiry: Jun 30, 2027 at 23:59
Extension: +6 months
```

**Important Notes:**
- Anyone can extend (not just creator)
- Sponsors can extend to protect their investment
- Recipients can extend to ensure they get paid
- Multiple extensions allowed

---

### Flow 5: Monitoring Live Transactions 📊

**Real-time Updates (Every 5 seconds):**

**Dashboard Features:**

1. **Live Stats**
   ```
   ┌─────────────────────────┐
   │ 💰 Total Funded: 250 SUI │
   │ 📤 Total Payments: 150 SUI│
   │ 💵 Current Balance: 100 SUI│
   │ ⏰ Expires: Dec 31, 2026  │
   └─────────────────────────┘
   ```

2. **Scheduled Payments**
   ```
   Shows each payment:
   - Recipient address
   - Amount in SUI
   - Scheduled date/time
   - Status indicator:
     🟢 Ready to Execute
     🟡 Scheduled
     ⚪ Executed
   ```

3. **Live Transaction Feed**
   ```
   Real-time list showing:
   - Type: Funding or Payment
   - From/To addresses
   - Amount
   - Time ago
   - Transaction digest
   - Status: Success/Pending/Failed
   
   Updates automatically every 5 seconds
   Shows newest transactions first
   ```

4. **Action Buttons**
   ```
   - Execute Payments (when ready)
   - Sponsor Now (add more funds)
   - Extend Expiry (increase time)
   ```

---

## 🔄 Complete End-to-End Example

### Scenario: Monthly Marketing Payments

**Cast:**
- Alice (Creator) - Marketing Manager
- Bob (Sponsor) - Company CFO  
- Carol (Recipient) - Freelance Designer
- Dave (Recipient) - Content Writer

---

**Week 1: Setup**

**Day 1 - Alice creates role:**
```
1. Alice connects Sui wallet
2. Creates "Marketing Budget 2026" role
   - Start: Feb 1, 2026
   - Expiry: Dec 31, 2026
3. Adds scheduled payments:
   - Carol: 500 SUI on 1st of each month
   - Dave: 300 SUI on 1st of each month
   - Total: 9,600 SUI (12 months × 800 SUI)
4. Funds with 1,000 SUI initially
5. Role created! ID: 0xabc123...
```

**Day 2 - Bob funds the role:**
```
1. Bob views roles list
2. Finds "Marketing Budget 2026"
3. Goes to sponsor page
4. Adds 8,600 SUI funding
5. Now fully funded: 9,600 SUI total
```

---

**Week 2: First Payment**

**Feb 1, 2026 - Automated execution:**
```
Bot checks every 5 minutes:
├── 00:00 - First payment ready!
├── 00:01 - Bot detects ready payment
├── 00:02 - Executes transaction
├── 00:03 - Carol receives 500 SUI
├── 00:04 - Dave receives 300 SUI
└── 00:05 - Live feed updates

Result:
- Remaining balance: 8,800 SUI
- Both recipients paid
- Next payment: March 1
```

**Manual alternative:**
```
Instead of bot, Carol could:
1. Check dashboard at 00:01
2. See "Ready to Execute"
3. Click "Execute Payments"
4. Everyone gets paid immediately
```

---

**Week 20: Mid-year Extension**

**Jun 15, 2026 - Bob extends expiry:**
```
1. Bob notices role expires Dec 31
2. Company wants payments through 2027
3. Goes to dashboard
4. Extends expiry to Dec 31, 2027
5. Adds another 9,600 SUI funding
6. Now funded through 2027!
```

---

**Month 12: Final Payment**

**Dec 1, 2026:**
```
- Carol and Dave receive final 2026 payment
- Role still active (extended to 2027)
- Continues for another 12 months
- Total paid in 2026: 9,600 SUI
- Success! All payments on time
```

---

## 🎯 Testing Flow (Single User)

**For developers/testers:**

```
1. Connect ONE Sui wallet

2. Create role with YOUR address as recipient:
   - Creator: Your address
   - Recipient: Your address (same!)
   - Amount: 0.1 SUI
   - Schedule: 1 minute from now

3. Fund role: Pay 0.1 SUI

4. Wait 1 minute

5. Execute payment:
   - Option A: Click button
   - Option B: Run bot
   - Option C: Wait for bot

6. Check wallet: You received 0.1 SUI back!

7. Test extending:
   - Set new expiry
   - Submit transaction
   - Verify on dashboard

8. Monitor live feed:
   - See funding transaction
   - See payment transaction
   - Check timestamps
   - Verify amounts
```

---

## 🔧 Technical Components

### Frontend Pages:
1. **Home** (`/`) - Landing page with features
2. **Create Role** (`/create`) - Form to create new roles
3. **Roles List** (`/roles`) - Browse all roles
4. **Role Dashboard** (`/role/:id`) - Static role details
5. **Live Dashboard** (`/role/:id/live`) - Real-time monitoring
6. **Sponsor Payment** (`/sponsor/:id`) - Funding interface
7. **User Profile** (`/user/:address`) - User stats

### Key Features:
- ✅ Wallet connection (Sui + Ethereum)
- ✅ Multi-chain support
- ✅ Real-time updates (5-second polling)
- ✅ QR code generation
- ✅ Live transaction feed
- ✅ Scheduled payments with status
- ✅ Payment execution (3 methods)
- ✅ Expiry extension (anyone can extend)
- ✅ Automated bot
- ✅ ENS integration
- ✅ Responsive design
- ✅ Error handling

### Smart Contract Functions:
```move
1. create_role() - Create new role
2. fund_role() - Add funds to role
3. execute_payments() - Execute ready payments
4. extend_expiry() - Extend expiry time
5. claim_payment() - Recipient claims funds
```

---

## ✅ Verification Checklist

**After setup, verify:**

- [ ] Wallet connects successfully
- [ ] Can create role
- [ ] Role appears in list
- [ ] Can fund role
- [ ] Funding shows in live feed
- [ ] Scheduled payments visible
- [ ] Payment status updates correctly
- [ ] Can execute payments manually
- [ ] Bot executes automatically (if running)
- [ ] Live feed updates every 5 seconds
- [ ] Can extend expiry (any user)
- [ ] Extension updates on blockchain
- [ ] Balance calculations correct
- [ ] Dates display properly
- [ ] No console errors

---

## 🚨 Common Issues & Solutions

### Issue: Dates showing "Jan 1, 1970"
**Solution:** Data parsing fixed - should show correct dates

### Issue: Amounts showing "NaN SUI"
**Solution:** Fixed to access p.fields.amount correctly

### Issue: Live transactions not showing
**Solution:** Enhanced event matching and timestamp parsing

### Issue: Can't extend expiry
**Solution:** Now available to EVERYONE, not just creator

### Issue: Payments not executing
**Solution:** Check:
1. Current time >= Scheduled time
2. Role is active (not expired)
3. Sufficient balance
4. Wallet connected

### Issue: Bot not working
**Solution:** Check:
1. .env file configured
2. Private key valid
3. RPC URL accessible
4. Sufficient gas in bot wallet

---

## 📚 Additional Documentation

- [COMPLETE-README.md](./COMPLETE-README.md) - Full project documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick setup guide
- [BOT-README.md](./BOT-README.md) - Bot configuration
- [CHANGES.md](./CHANGES.md) - Change log

---

## 🎉 Success Metrics

**You'll know it's working when:**

1. ✅ Roles create successfully
2. ✅ Payments execute on schedule
3. ✅ Live feed updates in real-time
4. ✅ Anyone can extend expiry
5. ✅ Bot runs without errors
6. ✅ Recipients receive funds correctly
7. ✅ Balances calculate accurately
8. ✅ No console errors

---

## 🤝 Support

If you encounter issues:
1. Check console for errors
2. Verify wallet connection
3. Ensure sufficient gas
4. Check blockchain confirmations
5. Review bot logs (if using bot)

---

**Last Updated:** February 4, 2026
**Version:** 2.0
**Status:** ✅ All Features Working
