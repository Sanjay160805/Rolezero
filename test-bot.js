/**
 * Test bot connection and configuration
 * Run: node test-bot.js
 */

import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const PACKAGE_ID = '0x7ac81f31d2233146edc08023c0c26533ac29687f41e594bd9ec46a4c28bcb356';
const NETWORK = 'testnet';

console.log('\n🔍 Testing Bot Configuration...\n');

// Test 1: Check private key
const privateKey = process.env.SUI_PRIVATE_KEY;
if (!privateKey) {
  console.error('❌ FAIL: SUI_PRIVATE_KEY not set');
  console.log('Run: $env:SUI_PRIVATE_KEY="your_key"');
  process.exit(1);
}
console.log('✅ Private key is set');

// Test 2: Parse keypair
let keypair;
try {
  keypair = Ed25519Keypair.fromSecretKey(privateKey);
  const address = keypair.getPublicKey().toSuiAddress();
  console.log('✅ Keypair parsed successfully');
  console.log(`📍 Bot Address: ${address}`);
} catch (error) {
  console.error('❌ FAIL: Could not parse private key');
  console.error('Error:', error.message);
  process.exit(1);
}

// Test 3: Connect to Sui network
const client = new SuiClient({
  url: `https://fullnode.${NETWORK}.sui.io:443`,
});

try {
  const balance = await client.getBalance({
    owner: keypair.getPublicKey().toSuiAddress(),
  });
  const suiBalance = (parseInt(balance.totalBalance) / 1_000_000_000).toFixed(4);
  console.log(`✅ Connected to ${NETWORK}`);
  console.log(`💰 Bot Balance: ${suiBalance} SUI`);
  
  if (parseFloat(suiBalance) === 0) {
    console.log('\n⚠️  WARNING: Bot wallet has no SUI!');
    console.log('Fund it at: https://faucet.sui.io/');
    console.log(`Address: ${keypair.getPublicKey().toSuiAddress()}`);
  }
} catch (error) {
  console.error('❌ FAIL: Could not connect to Sui network');
  console.error('Error:', error.message);
  process.exit(1);
}

// Test 4: Query for roles
try {
  console.log('\n🔍 Checking for roles...');
  const events = await client.queryEvents({
    query: {
      MoveEventType: `${PACKAGE_ID}::role::RoleCreated`,
    },
    limit: 10,
  });
  
  if (events.data && events.data.length > 0) {
    console.log(`✅ Found ${events.data.length} role(s)`);
    events.data.forEach((event, i) => {
      console.log(`   ${i + 1}. Role ID: ${event.parsedJson.role_id}`);
    });
  } else {
    console.log('⚠️  No roles found');
    console.log('This is normal if you haven\'t created any roles yet.');
    console.log('\nTo test:');
    console.log('1. Start frontend: npm run dev');
    console.log('2. Create a role with a payment');
    console.log('3. Run this test again');
  }
} catch (error) {
  console.error('❌ FAIL: Could not query events');
  console.error('Error:', error.message);
}

console.log('\n✅ All tests passed! Bot configuration is correct.\n');
console.log('Ready to run: npm run bot:start\n');
