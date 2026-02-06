import { getFullnodeUrl } from '@mysten/sui/client';
import { createNetworkConfig } from '@mysten/dapp-kit';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  testnet: {
    url: getFullnodeUrl('testnet'),
  },
  mainnet: {
    url: getFullnodeUrl('mainnet'),
  },
  devnet: {
    url: getFullnodeUrl('devnet'),
  },
});

export { networkConfig, useNetworkVariable, useNetworkVariables };

// Sui contract constants
export const SUI_PACKAGE_ID = '0x7ac81f31d2233146edc08023c0c26533ac29687f41e594bd9ec46a4c28bcb356';
export const DEVELOPER_ADDRESS = '0x7cd3b3519b8f7e5033cc3b4ce7ce846c9cd507ed47991cf44bf097895a7de547'; // Replace with your actual developer address
export const DEVELOPER_FEE_PERCENT = 0.01; // 1% developer fee
export const DEVELOPER_FEE = BigInt(10_000_000); // 0.01 SUI in MIST for contract