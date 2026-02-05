import { getFullnodeUrl } from '@mysten/sui/client';
import { createNetworkConfig } from '@mysten/dapp-kit';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  testnet: {
    url: getFullnodeUrl('testnet'),
  },
  mainnet: {
    url: getFullnodeUrl('mainnet'),
  },
});

export { networkConfig, useNetworkVariable, useNetworkVariables };

// Sui contract constants
export const SUI_PACKAGE_ID = '0xbac14b29ce0da91b31780afabdcc989346a5227350fab6d0c15c37b6801d0c38';
export const DEVELOPER_ADDRESS = '0x7cd3b3519b8f7e5033cc3b4ce7ce846c9cd507ed47991cf44bf097895a7de547'; // Replace with your actual developer address
export const DEVELOPER_FEE_PERCENT = 0.01; // 1% developer fee
export const DEVELOPER_FEE = BigInt(10_000_000); // 0.01 SUI in MIST for contract