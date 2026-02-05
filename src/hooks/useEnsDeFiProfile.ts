import { useEnsText } from 'wagmi';
import { normalize } from 'viem/ens';

export interface DeFiProfile {
  preferredToken?: string;
  notification?: string;
}

export const useEnsDeFiProfile = (ensName: string | undefined) => {
  const isValidEns = ensName?.endsWith('.eth') || ensName?.includes('.');

  const { data: preferredToken, isLoading: loadingToken } = useEnsText({
    name: ensName && isValidEns ? normalize(ensName) : undefined,
    key: 'defi.preferredToken',
    chainId: 1,
  });

  const { data: notification, isLoading: loadingNotification } = useEnsText({
    name: ensName && isValidEns ? normalize(ensName) : undefined,
    key: 'defi.notification',
    chainId: 1,
  });

  return {
    profile: {
      preferredToken: preferredToken || undefined,
      notification: notification || undefined,
    } as DeFiProfile,
    isLoading: loadingToken || loadingNotification,
  };
};
