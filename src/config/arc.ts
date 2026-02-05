/**
 * Arc Chain Configuration
 * 
 * Arc is an EVM-compatible blockchain with native USDC support,
 * perfect for cross-chain payroll operations.
 */

export const ARC_CONFIG = {
  // Network Details
  chainId: 12345, // Arc testnet chain ID (placeholder)
  chainName: 'Arc Testnet',
  rpcUrl: 'https://arc-testnet-rpc.example.com', // Placeholder RPC
  blockExplorer: 'https://arc-explorer.example.com',
  
  // Native Token (USDC)
  nativeCurrency: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  },
  
  // Contract Addresses (to be deployed)
  contracts: {
    usdc: '0x...', // USDC token contract
    payrollRole: '0x...', // Our PayrollRole contract
  },
  
  // Integration Status
  status: {
    smartContract: 'Developed',
    testnetDeployment: 'Pending',
    usdcIntegration: 'Planned',
    frontendIntegration: 'In Progress',
  },
  
  // Features
  features: {
    usdcNative: true,
    evmCompatible: true,
    fastFinality: true,
    lowFees: true,
    crossChainReady: true,
  }
};

// Arc Chain Object for wallet integration
export const arcChain = {
  id: ARC_CONFIG.chainId,
  name: ARC_CONFIG.chainName,
  network: 'arc-testnet',
  nativeCurrency: ARC_CONFIG.nativeCurrency,
  rpcUrls: {
    default: { http: [ARC_CONFIG.rpcUrl] },
    public: { http: [ARC_CONFIG.rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: ARC_CONFIG.blockExplorer },
  },
  testnet: true,
};

/**
 * Supported chains for PayrollX
 */
export const SUPPORTED_CHAINS = {
  SUI: {
    name: 'Sui',
    icon: '💎',
    status: 'Active',
    features: ['Fast', 'Low Fees', 'Move Language'],
  },
  ARC: {
    name: 'Arc',
    icon: '🌐',
    status: 'Coming Soon',
    features: ['USDC Native', 'EVM Compatible', 'Cross-Chain Hub'],
  },
  ETHEREUM: {
    name: 'Ethereum',
    icon: '⟠',
    status: 'Planned',
    features: ['LI.FI Bridge', 'ENS Support', 'Largest Liquidity'],
  },
};

export type ChainType = keyof typeof SUPPORTED_CHAINS;
