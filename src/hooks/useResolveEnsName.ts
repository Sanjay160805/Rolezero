import { useEnsAddress } from 'wagmi';
import { normalize } from 'viem/ens';

export const useResolveEnsName = (name: string | undefined) => {
  const isEnsName = name?.endsWith('.eth') || name?.includes('.');
  
  const { data: address, isLoading, error } = useEnsAddress({
    name: name && isEnsName ? normalize(name) : undefined,
    chainId: 1, // Ethereum mainnet
  });

  return {
    address: address || undefined,
    isLoading,
    error,
    isEnsName,
  };
};
