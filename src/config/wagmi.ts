import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http('https://eth.llamarpc.com', {
      timeout: 5000,
      retryCount: 1,
    }),
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com', {
      timeout: 5000,
      retryCount: 1,
    }),
  },
});
