import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SUI_PACKAGE_ID } from '@/config/sui';
const CLOCK_ID = '0x0000000000000000000000000000000000000000000000000000000000000006'; // Sui Clock object ID

export const useExtendExpiry = (roleId: string) => {
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newExpiryTime: number) => {
      const tx = new Transaction();
      
      // Set gas budget explicitly
      tx.setGasBudget(100_000_000); // 0.1 SUI max gas

      tx.moveCall({
        target: `${SUI_PACKAGE_ID}::role::extend_expiry`,
        arguments: [
          tx.object(roleId),
          tx.pure.u64(newExpiryTime),
          tx.object(CLOCK_ID),
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
      });

      await client.waitForTransaction({
        digest: result.digest,
      });

      return result;
    },
    onSuccess: () => {
      // Invalidate role data to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      queryClient.invalidateQueries({ queryKey: ['role-live-transactions', roleId] });
    },
  });
};
