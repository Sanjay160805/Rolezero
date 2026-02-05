/**
 * Generate a new Sui wallet for the payment bot
 * Run: node generate-bot-wallet.js
 */

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

console.log('\n🔑 Generating new Sui wallet for payment bot...\n');

const keypair = new Ed25519Keypair();
const address = keypair.getPublicKey().toSuiAddress();
const privateKey = keypair.getSecretKey();

console.log('✅ Wallet generated successfully!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📍 Address:', address);
console.log('🔐 Private Key:', privateKey);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 Next steps:\n');
console.log('1. Get testnet SUI from faucet:');
console.log('   https://faucet.sui.io/');
console.log('   Paste address:', address);
console.log('');
console.log('2. Set environment variable in PowerShell:');
console.log('   $env:SUI_PRIVATE_KEY="' + privateKey + '"');
console.log('');
console.log('3. Run the payment bot:');
console.log('   node payment-bot.js');
console.log('');
console.log('⚠️  IMPORTANT: Save this private key securely!');
console.log('   Never commit it to git or share publicly.\n');
