# Manual Testing Checklist

**Test Date:** ___________  
**Tester Name:** ___________  
**Environment:** [ ] Local [ ] Testnet [ ] Staging

---

## Pre-Test Setup

- [ ] Dev server running (`npm run dev`)
- [ ] Sui wallet installed and connected
- [ ] Wallet has testnet SUI (>1 SUI)
- [ ] Browser console open (F12)
- [ ] Network tab monitoring (optional)

---

## Test Flow 1: Create Role - Happy Path

**Goal:** Create a role with 2 payments successfully

1. [ ] Navigate to http://localhost:5173
2. [ ] Click "Create Role" button
3. [ ] Fill Role Name: "Test Payroll Flow 1"
4. [ ] Set Start Time: Tomorrow at 12:00 PM
5. [ ] Set Expiry Time: Next month at 12:00 PM
6. [ ] Click "Add Payment"
7. [ ] Enter Recipient 1: Your wallet address
8. [ ] Enter Amount 1: 0.5
9. [ ] Set Scheduled Time 1: Tomorrow at 1:00 PM
10. [ ] Click "Add Payment" again
11. [ ] Enter Recipient 2: Another address
12. [ ] Enter Amount 2: 0.3
13. [ ] Set Scheduled Time 2: Day after tomorrow at 1:00 PM
14. [ ] Select Token: SUI
15. [ ] Enter Leftover Recipient: Your wallet address
16. [ ] (Optional) Enter Initial Funding: 1
17. [ ] Click "Create Role"
18. [ ] Approve wallet transaction
19. [ ] Wait for confirmation (~5 seconds)
20. [ ] Verify success modal appears
21. [ ] Verify Role ID is displayed
22. [ ] Click "View Dashboard"
23. [ ] Verify redirected to dashboard page

**Expected Results:**
- ✅ Form accepts all inputs
- ✅ Validation passes
- ✅ Transaction succeeds
- ✅ Success modal shows Role ID
- ✅ No console errors

**Actual Results:**
___________________________________________________________

**Pass/Fail:** [ ] Pass [ ] Fail

**Issues Found:**
___________________________________________________________

---

## Test Flow 2: Create Role - Validation

**Goal:** Verify form validation works

1. [ ] Navigate to /create-role
2. [ ] Leave Role Name empty
3. [ ] Click "Create Role"
4. [ ] Verify error: "Role name is required"
5. [ ] Enter Role Name: "Validation Test"
6. [ ] Leave payments empty
7. [ ] Click "Create Role"
8. [ ] Verify error: "At least one payment required"
9. [ ] Add payment
10. [ ] Enter negative amount: -100
11. [ ] Verify error: "Amount must be positive"
12. [ ] Set Expiry Time before Start Time
13. [ ] Verify error: "Expiry must be after start time"
14. [ ] Fix all errors
15. [ ] Verify "Create Role" button becomes enabled

**Expected Results:**
- ✅ All validation errors show
- ✅ Button disabled when invalid
- ✅ Button enabled when valid
- ✅ No submission with errors

**Actual Results:**
___________________________________________________________

**Pass/Fail:** [ ] Pass [ ] Fail

---

## Test Flow 3: Fund Role

**Goal:** Add funds to existing role

1. [ ] Navigate to dashboard of created role
2. [ ] Note current balance: _______ SUI
3. [ ] Click "Fund Role" or navigate to /sponsor/{roleId}
4. [ ] Verify role details displayed
5. [ ] Enter funding amount: 0.5
6. [ ] Click "Fund Role"
7. [ ] Approve wallet transaction
8. [ ] Wait for confirmation
9. [ ] Verify success message
10. [ ] Navigate back to dashboard
11. [ ] Verify balance updated: _______ SUI (should be +0.5)
12. [ ] Verify transaction appears in feed

**Expected Results:**
- ✅ Current balance displays correctly
- ✅ Funding transaction succeeds
- ✅ Balance updates in real-time
- ✅ Transaction shows in feed

**Actual Results:**
___________________________________________________________

**Pass/Fail:** [ ] Pass [ ] Fail

---

## Test Flow 4: Dashboard - Live Updates

**Goal:** Verify real-time dashboard functionality

1. [ ] Navigate to dashboard of funded role
2. [ ] Open browser console
3. [ ] Check "Network" tab
4. [ ] Wait 5 seconds
5. [ ] Verify new network request made
6. [ ] Check payment statuses
7. [ ] Leave dashboard open for 30 seconds
8. [ ] Verify data refreshes (check network tab)
9. [ ] Verify no console errors during refresh
10. [ ] Verify transaction feed updates

**Expected Results:**
- ✅ Dashboard fetches data every 5 seconds
- ✅ Payment statuses correct
- ✅ No infinite loops
- ✅ No console errors

**Actual Results:**
___________________________________________________________

**Pass/Fail:** [ ] Pass [ ] Fail

---

## Test Flow 5: Execute Payments

**Goal:** Execute a ready payment

1. [ ] Create role with payment scheduled 1 minute ago
2. [ ] Fund the role sufficiently
3. [ ] Navigate to dashboard
4. [ ] Wait for auto-refresh (5 sec)
5. [ ] Verify payment shows "Ready" status
6. [ ] Verify "Execute Payments" button visible
7. [ ] Click "Execute Payments"
8. [ ] Approve wallet transaction
9. [ ] Wait for confirmation
10. [ ] Verify success message
11. [ ] Verify payment status changes to "Executed"
12. [ ] Verify balance decreased
13. [ ] Verify transaction in feed

**Expected Results:**
- ✅ Ready payments detected
- ✅ Execute button shows when ready
- ✅ Execution succeeds
- ✅ Status updates correctly
- ✅ Balance decreases

**Actual Results:**
___________________________________________________________

**Pass/Fail:** [ ] Pass [ ] Fail

---

## Test Flow 6: Extend Expiry

**Goal:** Extend role expiry date

1. [ ] Navigate to dashboard
2. [ ] Note current expiry: _____________
3. [ ] Click "Extend Expiry"
4. [ ] Enter new expiry: 3 months from now
5. [ ] Click "Extend"
6. [ ] Approve transaction
7. [ ] Verify success message
8. [ ] Verify expiry updated

**Expected Results:**
- ✅ Extension works
- ✅ Expiry updates
- ✅ Validation works

**Actual Results:**
___________________________________________________________

**Pass/Fail:** [ ] Pass [ ] Fail

---

## Test Flow 7: ENS Integration

**Goal:** Test ENS name resolution

1. [ ] Navigate to /create-role
2. [ ] Add payment
3. [ ] Enter recipient: "vitalik.eth"
4. [ ] Wait for resolution
5. [ ] Verify resolved address displays
6. [ ] Create role with ENS recipient
7. [ ] Verify dashboard shows ENS name

**Expected Results:**
- ✅ ENS names resolve
- ✅ Loading state shows
- ✅ Dashboard displays ENS

**Actual Results:**
___________________________________________________________

**Pass/Fail:** [ ] Pass [ ] Fail

---

## Test Flow 8: Multi-Chain UI

**Goal:** Verify multi-chain UI elements

1. [ ] Navigate to /create-role
2. [ ] Look for token selector
3. [ ] Verify options: SUI, USDC
4. [ ] Select USDC
5. [ ] Verify UI updates
6. [ ] Look for chain selector

**Expected Results:**
- ✅ Token selector works
- ✅ USDC option available
- ✅ Multi-chain elements present

**Actual Results:**
___________________________________________________________

**Pass/Fail:** [ ] Pass [ ] Fail

---

## Test Flow 9: Roles List

**Goal:** View and filter roles

1. [ ] Navigate to /roles
2. [ ] Verify list of roles loads
3. [ ] Verify role cards show info
4. [ ] Click a role card
5. [ ] Verify navigates to dashboard

**Expected Results:**
- ✅ Roles list loads
- ✅ Role cards display
- ✅ Navigation works

**Actual Results:**
___________________________________________________________

**Pass/Fail:** [ ] Pass [ ] Fail

---

## Test Flow 10: Mobile Experience

**Goal:** Test on mobile device or responsive mode

1. [ ] Resize browser to 375px width
2. [ ] Verify home page responsive
3. [ ] Navigate to /create-role
4. [ ] Verify form usable on mobile
5. [ ] Create a role on mobile
6. [ ] View dashboard on mobile

**Expected Results:**
- ✅ Mobile layout works
- ✅ All features accessible
- ✅ No layout breaking

**Actual Results:**
___________________________________________________________

**Pass/Fail:** [ ] Pass [ ] Fail

---

## Cross-Browser Testing

### Chrome
- [ ] All flows work
- [ ] Wallet connects
- [ ] No console errors

### Firefox
- [ ] All flows work
- [ ] Wallet connects
- [ ] No console errors

### Safari
- [ ] All flows work
- [ ] Wallet connects
- [ ] No console errors

### Edge
- [ ] All flows work
- [ ] Wallet connects
- [ ] No console errors

---

## Performance Testing

1. [ ] Home page loads < 2 seconds
2. [ ] Dashboard loads < 3 seconds
3. [ ] No memory leaks
4. [ ] Smooth animations

---

## Security Checklist

1. [ ] No private keys in console
2. [ ] Wallet prompts for every transaction
3. [ ] Input sanitization works

---

## Final Summary

**Total Tests:** 10 flows + cross-browser + performance + security  
**Tests Passed:** ___ / ___  
**Tests Failed:** ___ / ___  
**Critical Issues:** ___________  

**Overall Assessment:**  
[ ] Ready for submission  
[ ] Needs minor fixes  
[ ] Needs major work

**Tester Signature:** ___________  
**Date:** ___________
