/**
 * Automated Payment Execution Bot for Sui Roles
 * 
 * This bot automatically:
 * 1. Executes scheduled payments when their time comes
 * 2. Returns leftover funds when roles expire
 * 3. Checks every 2 minutes (configurable)
 * 
 * Run with: node payment-bot.js
 */

import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';

// Configuration
const PACKAGE_ID = '0x7ac81f31d2233146edc08023c0c26533ac29687f41e594bd9ec46a4c28bcb356';
const CLOCK_OBJECT_ID = '0x0000000000000000000000000000000000000000000000000000000000000006';
const NETWORK = 'testnet';
const CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes (faster execution)

// Initialize Sui client
const client = new SuiClient({
  url: `https://fullnode.${NETWORK}.sui.io:443`,
});

// Initialize keypair from private key (stored in environment variable for security)
// Get testnet SUI from: https://faucet.sui.io/
const privateKey = process.env.SUI_PRIVATE_KEY;
if (!privateKey) {
  console.error('❌ Error: SUI_PRIVATE_KEY environment variable not set');
  console.log('To run this bot:');
  console.log('1. Create a Sui wallet and export private key');
  console.log('2. Get testnet SUI from https://faucet.sui.io/');
  console.log('3. Set environment variable: $env:SUI_PRIVATE_KEY="your_private_key"');
  console.log('4. Run: node payment-bot.js');
  process.exit(1);
}

// Parse the private key correctly
let keypair;
try {
  // The private key from generate-bot-wallet.js is in the correct format
  // It should be a string starting with 'suiprivkey'
  keypair = Ed25519Keypair.fromSecretKey(privateKey);
} catch (error) {
  console.error('❌ Error parsing private key:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Make sure you copied the FULL private key from generate-bot-wallet.js');
  console.log('2. The key should start with "suiprivkey1"');
  console.log('3. Run: node generate-bot-wallet.js to generate a new one');
  console.log('4. Then: $env:SUI_PRIVATE_KEY="paste_full_key_here"');
  process.exit(1);
}

const botAddress = keypair.getPublicKey().toSuiAddress();

console.log('🤖 Payment Execution Bot Started');
console.log(`📍 Bot Address: ${botAddress}`);
console.log(`🌐 Network: ${NETWORK}`);
console.log(`⏱️  Check Interval: ${CHECK_INTERVAL / 1000}s\n`);

// Get all roles from the package
async function getAllRoles() {
  try {
    // Query by Move event to find all created roles
    const events = await client.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::role::RoleCreated`,
      },
      limit: 100,
    });

    const roleIds = new Set();

    // Add from events
    if (events.data && events.data.length > 0) {
      events.data.forEach(event => {
        if (event.parsedJson && event.parsedJson.role_id) {
          roleIds.add(event.parsedJson.role_id);
        }
      });
      console.log(`✅ Found ${roleIds.size} roles from events`);
    } else {
      console.log(`ℹ️  No RoleCreated events found for package ${PACKAGE_ID}`);
    }

    return Array.from(roleIds);
  } catch (error) {
    console.error('❌ Error fetching roles:', error.message);
    return [];
  }
}

// Check if role has payments ready to execute OR has expired with leftover funds
async function checkRolePayments(roleId) {
  try {
    const roleObject = await client.getObject({
      id: roleId,
      options: {
        showContent: true,
      },
    });

    if (!roleObject.data?.content || roleObject.data.content.dataType !== 'moveObject') {
      return null;
    }

    const fields = roleObject.data.content.fields;
    const currentTime = Date.now();
    const startTime = parseInt(fields.start_time);
    const expiryTime = parseInt(fields.expiry_time);
    const balance = parseInt(fields.balance);
    const roleName = String.fromCharCode(...fields.name);

    // Debug: Show role timing info
    console.log(`\n📊 Role: "${roleName}" (${roleId.slice(0, 10)}...)`);
    console.log(`   Current time: ${currentTime} (${new Date(currentTime).toLocaleString()})`);
    console.log(`   Start time: ${startTime} (${new Date(startTime).toLocaleString()})`);
    console.log(`   Expiry time: ${expiryTime} (${new Date(expiryTime).toLocaleString()})`);
    console.log(`   Balance: ${(balance / 1_000_000_000).toFixed(4)} SUI`);

    // Check if role has expired with leftover funds
    if (currentTime > expiryTime && balance > 0) {
      return {
        roleId,
        roleName,
        type: 'expired',
        balance,
        leftoverRecipient: fields.leftover_recipient,
      };
    }

    // Check if role is active
    if (currentTime < startTime) {
      console.log(`   ⏳ Not started yet`);
      return null;
    }
    
    if (currentTime > expiryTime) {
      console.log(`   ⏰ Expired (no leftover)`);
      return null;
    }

    // Check for unexecuted payments that are ready
    const payments = fields.payments || [];
    console.log(`   📋 Total payments: ${payments.length}`);
    
    const readyPayments = payments.filter(p => {
      const paymentFields = p.fields || p;
      const scheduledTime = parseInt(paymentFields.scheduled_time);
      const executed = paymentFields.executed;
      const amount = parseInt(paymentFields.amount);
      
      console.log(`      Payment: ${(amount / 1_000_000_000).toFixed(4)} SUI`);
      console.log(`         Scheduled: ${scheduledTime} (${new Date(scheduledTime).toLocaleString()})`);
      console.log(`         Executed: ${executed}`);
      console.log(`         Ready: ${!executed && currentTime >= scheduledTime}`);
      
      return !executed && currentTime >= scheduledTime;
    });

    if (readyPayments.length > 0) {
      console.log(`   ✅ ${readyPayments.length} payment(s) ready for execution!`);
      return {
        roleId,
        roleName,
        type: 'payments',
        readyPayments: readyPayments.length,
        balance,
      };
    }

    console.log(`   ⏸️  No payments ready yet`);
    return null;
  } catch (error) {
    console.error(`❌ Error checking role ${roleId}:`, error.message);
    return null;
  }
}

// Execute payments for a role
async function executePayments(roleId) {
  try {
    console.log(`\n🚀 Executing payments for role: ${roleId}`);

    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::role::execute_payments`,
      arguments: [
        tx.object(roleId),
        tx.object(CLOCK_OBJECT_ID),
      ],
    });

    const result = await client.signAndExecuteTransaction({
      transaction: tx,
      signer: keypair,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    if (result.effects?.status?.status === 'success') {
      const executedCount = result.events?.filter(e => 
        e.type.includes('::role::PaymentExecuted')
      ).length || 0;

      console.log(`✅ Success! Executed ${executedCount} payment(s)`);
      console.log(`📝 Transaction: https://suiexplorer.com/txblock/${result.digest}?network=${NETWORK}`);
      return true;
    } else {
      console.log(`⚠️  Transaction failed:`, result.effects?.status?.error);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error executing payments:`, error.message);
    return false;
  }
}

// Execute expiry and transfer leftover funds
async function executeExpiry(roleId, leftoverRecipient, balance) {
  try {
    console.log(`\n💰 Executing expiry for role: ${roleId}`);
    console.log(`   Leftover: ${(balance / 1_000_000_000).toFixed(4)} SUI`);
    console.log(`   Recipient: ${leftoverRecipient}`);

    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::role::execute_expiry`,
      arguments: [
        tx.object(roleId),
        tx.object(CLOCK_OBJECT_ID),
      ],
    });

    const result = await client.signAndExecuteTransaction({
      transaction: tx,
      signer: keypair,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    if (result.effects?.status?.status === 'success') {
      const leftoverEvent = result.events?.find(e => 
        e.type.includes('::role::LeftoverTransferred')
      );

      console.log(`✅ Success! Leftover funds transferred to ${leftoverRecipient}`);
      console.log(`📝 Transaction: https://suiexplorer.com/txblock/${result.digest}?network=${NETWORK}`);
      return true;
    } else {
      console.log(`⚠️  Transaction failed:`, result.effects?.status?.error);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error executing expiry:`, error.message);
    return false;
  }
}

// Main check cycle
async function checkAndExecute() {
  console.log(`\n⏰ ${new Date().toLocaleTimeString()} - Checking for ready payments and expired roles...`);

  try {
    // Get all roles
    const roleIds = await getAllRoles();
    console.log(`📋 Found ${roleIds.length} total roles`);

    if (roleIds.length === 0) {
      console.log('ℹ️  No roles found. Make sure PACKAGE_ID is correct.');
      return;
    }

    // Check each role for ready payments or expiry
    let actionsCount = 0;
    for (const roleId of roleIds) {
      const roleInfo = await checkRolePayments(roleId);
      
      if (roleInfo) {
        actionsCount++;

        if (roleInfo.type === 'expired') {
          // Execute expiry and transfer leftover
          console.log(`\n⏳ Role expired: "${roleInfo.roleName}"`);
          console.log(`   ID: ${roleInfo.roleId}`);
          console.log(`   Leftover balance: ${(roleInfo.balance / 1_000_000_000).toFixed(4)} SUI`);
          console.log(`   Recipient: ${roleInfo.leftoverRecipient}`);

          await executeExpiry(roleId, roleInfo.leftoverRecipient, roleInfo.balance);
        } else if (roleInfo.type === 'payments') {
          // Execute scheduled payments
          console.log(`\n💚 Role ready: "${roleInfo.roleName}"`);
          console.log(`   ID: ${roleInfo.roleId}`);
          console.log(`   Ready payments: ${roleInfo.readyPayments}`);
          console.log(`   Balance: ${(roleInfo.balance / 1_000_000_000).toFixed(4)} SUI`);

          await executePayments(roleId);
        }
      }
    }

    if (actionsCount === 0) {
      console.log('✓ All roles checked - no actions needed');
    }
  } catch (error) {
    console.error('❌ Error in check cycle:', error);
  }
}

// Start the bot
async function startBot() {
  // Check bot balance
  try {
    const balance = await client.getBalance({
      owner: botAddress,
      coinType: '0x2::sui::SUI',
    });
    const suiBalance = parseInt(balance.totalBalance) / 1_000_000_000;
    console.log(`💰 Bot Balance: ${suiBalance.toFixed(4)} SUI`);
    
    if (suiBalance < 0.01) {
      console.warn('⚠️  Warning: Low balance! Get testnet SUI from https://faucet.sui.io/');
    }
  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
  }

  // Run initial check
  await checkAndExecute();

  // Set up interval
  setInterval(checkAndExecute, CHECK_INTERVAL);

  console.log(`\n✓ Bot is running! Will check every ${CHECK_INTERVAL / 1000} seconds`);
  console.log('Press Ctrl+C to stop\n');
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Bot stopped. Goodbye!');
  process.exit(0);
});

// Start
startBot().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
