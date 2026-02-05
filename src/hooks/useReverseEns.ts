import { useEnsName } from 'wagmi';
import { isAddress } from 'viem';

export const useReverseEns = (address: string | undefined) => {
  const isValidAddress = address && isAddress(address);

  const { data: ensName, isLoading, error } = useEnsName({
    address: isValidAddress ? address as `0x${string}` : undefined,
    chainId: 1, // Ethereum mainnet
  });

  return {
    ensName: ensName || undefined,
    isLoading,
    error,
  };
};
