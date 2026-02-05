# 🔍 Payment Execution Diagnostic Guide

## How Payment Execution Works

### 1. **Manual Execution (Button Click)**
When you click "Execute Payments":
1. Frontend calls `useExecutePayments` hook
2. Creates transaction calling `execute_payments` function in Move contract
3. Move contract checks each payment:
   - Is it already executed? (skip if yes)
   - Is current time >= scheduled time? (skip if no)
   - Is there enough balance? (skip if no)
4. For ready payments:
   - Takes SUI from role balance
   - **Transfers SUI directly to recipient address** using `transfer::public_transfer()`
   - Marks payment as executed
   - Emits `PaymentExecuted` event

### 2. **Automated Bot Execution**
- Bot runs every 5 minutes
- Calls same `execute_payments` function
- Works exactly like manual execution

### 3. **Key Point: NOT Automatic!**
Payments do NOT execute automatically when the time comes. Someone must:
- Click "Execute Payments" button, OR
- Run the bot, OR
- Call the function from another wallet

---

## 🐛 Troubleshooting: Payment Executed But Didn't Receive Funds

### Step 1: Verify Transaction Success
```
1. Check browser console (F12)
2. Look for: "✅ Execute payments result:"
3. Note the transaction digest
4. Go to: https://suiscan.xyz/testnet/tx/[digest]
```

### Step 2: Check Transaction Details on Sui Explorer

**What to look for:**
1. **Status**: Should be "Success" (green checkmark)
2. **Events**: Should show `PaymentExecuted` event
3. **Object Changes**: Should show coin transfer
4. **Balance Changes**: Should show SUI leaving role and arriving at recipient

### Step 3: Verify Recipient Address

**Common Issue: Wrong recipient address!**

Check these match:
```
Your Wallet Address: 0xabc123... (from wallet)
Recipient in Payment: 0xabc123... (from scheduled payment)
```

**How to check:**
1. Open Role Dashboard
2. Look at "Scheduled Payments" section
3. Check recipient address for each payment
4. Compare with your connected wallet address

**If they don't match:**
- Payment went to DIFFERENT address
- Check that wallet in Sui Explorer

### Step 4: Check Role Balance

**Issue: Insufficient balance**

```
Required: Total of all scheduled payments
Example: 
- Payment 1: 100 SUI
- Payment 2: 50 SUI
- Total needed: 150 SUI

Current Balance: Check in dashboard
If balance < 150 SUI, payments won't execute!
```

**Solution:** Fund the role with more SUI

### Step 5: Check Timing

**Issue: Payment not ready yet**

```
Current Time: Feb 4, 2026 10:00 AM
Scheduled Time: Feb 4, 2026 11:00 AM

Status: ⏰ Scheduled (yellow badge)
Action: Wait until 11:00 AM
```

**Payment status:**
- 🟢 **Ready** = Can execute NOW
- 🟡 **Scheduled** = Wait for scheduled time
- ⚪ **Executed** = Already done

### Step 6: Check if Already Executed

**Issue: Payment already executed before**

```
If status shows: ⚪ Executed
Then: Funds already sent previously
Check: Transaction history for earlier execution
```

---

## 🔍 Debugging Live Transaction Feed

### Why No Transactions Showing?

**Issue 1: Wrong Role ID**
```
Check URL: /role/{roleId}/live
roleId should be: 0x[long hexadecimal]
If missing or wrong: Transactions won't load
```

**Issue 2: No Transactions Yet**
```
New role with no activity = Empty feed
Actions needed:
1. Fund the role (creates FundEvent)
2. Execute payments (creates PaymentExecuted event)
```

**Issue 3: Event Not Matching**
```
Contract emits: PaymentExecuted
Hook searches for: ::role::PaymentExecuted

Check browser console for:
- "🔍 Fetching live transactions for role:"
- "📦 Found X transaction blocks"
- "First tx events:" [should show events]
```

### Console Debugging Commands

Open browser console (F12) and check:

```javascript
// Should see these logs:
🔍 Fetching live transactions for role: 0xabc123...
📦 Found 2 transaction blocks
Found funding tx: { timestamp: [date], amount: [number] }
Found payment tx: { timestamp: [date], amount: [number] }
✅ Parsed 2 transactions
```

**If you see:**
- "Found 0 transaction blocks" = No transactions interacted with this role yet
- No "Found funding tx" or "Found payment tx" = Events not matching

---

## 📊 Complete Diagnostic Checklist

### Before Executing Payment:

- [ ] Role is funded with sufficient balance
- [ ] Current time >= Scheduled time
- [ ] Payment status shows 🟢 Ready
- [ ] Wallet is connected
- [ ] Correct recipient address in payment

### After Clicking Execute:

- [ ] Transaction appeared in wallet for approval
- [ ] Approved transaction in wallet
- [ ] Wait 5-10 seconds for blockchain confirmation
- [ ] Check console for "✅ Execute payments result"
- [ ] Get transaction digest

### Verifying Receipt:

- [ ] Open Sui Explorer with transaction digest
- [ ] Status = Success
- [ ] See PaymentExecuted event
- [ ] See coin transfer in object changes
- [ ] Check recipient wallet balance increased

### If Still Not Received:

1. **Get transaction digest** from console or Explorer
2. **Open in Sui Explorer**: https://suiscan.xyz/testnet/tx/{digest}
3. **Check "Balance Changes" tab**
4. **Look for recipient address**
5. **Verify SUI amount sent**

---

## 🎯 Testing Procedure

### Test with Single Wallet (Recommended)

**Setup:**
```
1. Connect Sui wallet (note your address)
2. Create role:
   - Your address = Creator
   - Your address = Recipient (SAME ADDRESS!)
3. Schedule payment:
   - Recipient: YOUR address
   - Amount: 0.1 SUI
   - Time: 2 minutes from now
4. Fund role: 0.1 SUI
```

**Execute:**
```
1. Wait 2 minutes
2. Payment status should turn 🟢 Ready
3. Click "Execute Payments"
4. Approve in wallet
5. Wait 10 seconds
```

**Verify:**
```
1. Check console for transaction digest
2. Open Sui Explorer with digest
3. See "Success" status
4. See PaymentExecuted event with:
   - role_id: [your role]
   - recipient: [your address]
   - amount: 100000000 (0.1 SUI in MIST)
5. Check wallet: Should see transaction
```

**Note:** You funded 0.1 SUI and received 0.1 SUI back, so net balance = 0 (minus gas fees)

---

## 🔧 Common Issues & Solutions

### Issue: "Transaction failed"
**Causes:**
- Insufficient gas in wallet
- Role not started yet (current time < start time)
- Role expired (current time > expiry time)
- Payment not ready (current time < scheduled time)

**Solution:**
- Add SUI for gas to your wallet
- Wait for start time
- Extend expiry if expired
- Wait for scheduled time

### Issue: "No ready payments"
**Meaning:** All payments either:
- Already executed (⚪)
- Scheduled for future (🟡)
- Role not active

**Solution:**
- Wait for scheduled time
- Check if payments already executed
- Verify role is active (not expired)

### Issue: "Wallet not connected"
**Solution:**
- Click "Connect Wallet"
- Select Sui wallet
- Approve connection

### Issue: "Live feed not updating"
**Causes:**
- No transactions yet (new role)
- Role ID incorrect
- Network issues

**Solution:**
- Make a transaction (fund or execute)
- Check role ID in URL
- Refresh page
- Check console for errors

---

## 📈 How to Confirm Payments Were Sent

### Method 1: Sui Explorer (Most Reliable)

```
1. Get transaction digest from console
2. Go to: https://suiscan.xyz/testnet/tx/{digest}
   OR: https://suivision.xyz/txblock/{digest}
3. Check tabs:
   - Status: Should be Success ✅
   - Events: Should show PaymentExecuted
   - Balance Changes: Shows SUI transfers
   - Object Changes: Shows coin movements
```

### Method 2: Wallet History

```
1. Open Sui wallet
2. Go to "Activity" or "History"
3. Look for incoming transaction
4. Should see amount received
```

### Method 3: Live Transaction Feed

```
1. Go to Role Dashboard /role/{id}/live
2. Look at "Live Transaction Feed"
3. Should show:
   - Type: 📤 Payment Sent
   - From: Role address
   - To: Recipient address
   - Amount: X SUI
   - Status: Success ✅
```

### Method 4: Check Balance

```
Before Execute: Note wallet balance
After Execute: Check wallet balance
Difference: Should increase by payment amount (minus gas if you executed)
```

---

## 🤖 Automated Bot vs Manual

### Manual Execution (Button Click)
**You control when:**
- Click button when ready
- Must be online and available
- Instant when you click
- Best for: One-time payments, testing

### Automated Bot
**Runs automatically:**
- Checks every 5 minutes
- No human needed
- Executes when ready
- Best for: Recurring payments, production

### Both Work The Same Way!
- Call same `execute_payments` function
- Same blockchain transaction
- Same result (SUI transferred)
- Whoever executes first wins

---

## 🆘 Still Having Issues?

**Collect this information:**

1. **Transaction Digest**: From console or wallet
2. **Role ID**: From URL
3. **Your Wallet Address**: From wallet
4. **Recipient Address**: From scheduled payment
5. **Console Logs**: Copy all console output
6. **Screenshots**: 
   - Dashboard showing payments
   - Wallet showing balance
   - Sui Explorer showing transaction

**Check:**
- [ ] Transaction succeeded on blockchain
- [ ] Recipient address matches your wallet
- [ ] Role had sufficient balance
- [ ] Payment was ready (time passed)
- [ ] Live feed updates (may take 5-10 seconds)

---

## ✅ Success Criteria

**You'll know it worked when:**

1. ✅ Console shows: "✅ Execute payments result"
2. ✅ Transaction digest appears
3. ✅ Sui Explorer shows "Success"
4. ✅ PaymentExecuted event visible
5. ✅ Recipient received SUI (check wallet)
6. ✅ Payment status changes to ⚪ Executed
7. ✅ Live feed shows payment transaction
8. ✅ Role balance decreased

**Timeline:**
- Click execute: Immediate
- Wallet prompt: Immediate
- Approve: Immediate
- Blockchain confirm: 5-10 seconds
- UI update: 5-15 seconds (next refetch)
- Wallet update: 10-30 seconds

---

**Last Updated:** February 4, 2026
