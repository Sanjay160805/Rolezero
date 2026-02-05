import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SUI_PACKAGE_ID } from '@/config/sui';

const CLOCK_ID = '0x0000000000000000000000000000000000000000000000000000000000000006'; // Sui Clock object ID

export const useExecuteExpiry = (roleId: string, roleBalance: number) => {
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Validate balance before execution
      if (roleBalance <= 0) {
        throw new Error('❌ Cannot return leftover funds: Role balance is ZERO!');
      }

      const tx = new Transaction();
      
      // Set gas budget explicitly
      tx.setGasBudget(100_000_000); // 0.1 SUI max gas

      console.log('🔄 Executing expiry for role:', roleId);
      console.log('💰 Role balance to return:', (roleBalance / 1_000_000_000).toFixed(4), 'SUI');
      console.log('⛽ Note: You only pay gas fees, leftover funds are returned to recipient');

      tx.moveCall({
        target: `${SUI_PACKAGE_ID}::role::execute_expiry`,
        arguments: [
          tx.object(roleId),
          tx.object(CLOCK_ID),
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
      });

      console.log('✅ Expiry executed, transaction:', result.digest);

      await client.waitForTransaction({
        digest: result.digest,
      });

      return result;
    },
    onSuccess: (result) => {
      // Invalidate role data to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      queryClient.invalidateQueries({ queryKey: ['role-live-transactions', roleId] });
      
      alert(`Leftover funds transferred!\n\nTransaction: ${result.digest}\n\nView on Explorer:\nhttps://suiexplorer.com/txblock/${result.digest}?network=testnet`);
    },
    onError: (error: any) => {
      console.error('❌ Failed to execute expiry:', error);
      alert(`Failed to execute expiry: ${error.message}`);
    },
  });
};
