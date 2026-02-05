import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SUI_PACKAGE_ID } from '@/config/sui';

const CLOCK_OBJECT_ID = '0x0000000000000000000000000000000000000000000000000000000000000006';

export const useExecutePayments = (roleId: string, roleBalance: number) => {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const client = useSuiClient();

  return useMutation({
    mutationFn: async () => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      // Validate balance before execution
      if (roleBalance <= 0) {
        throw new Error('Cannot execute payments: Role balance is zero. Please fund the role first.');
      }

      const txb = new Transaction();
      
      // Set gas budget explicitly
      txb.setGasBudget(100_000_000); // 0.1 SUI max gas

      txb.moveCall({
        target: `${SUI_PACKAGE_ID}::role::execute_payments`,
        arguments: [
          txb.object(roleId),
          txb.object(CLOCK_OBJECT_ID),
        ],
      });
      
      const result = await signAndExecute({
        transaction: txb,
      });
      
      // Wait for transaction and get full details including gas
      const txDetails = await client.waitForTransaction({
        digest: result.digest,
        options: {
          showEffects: true,
          showInput: true,
        },
      });
      
      // Calculate actual gas fee paid
      let gasMessage = '';
      if (txDetails.effects?.gasUsed) {
        const gasUsed = txDetails.effects.gasUsed;
        const computationCost = Number(gasUsed.computationCost || 0);
        const storageCost = Number(gasUsed.storageCost || 0);
        const storageRebate = Number(gasUsed.storageRebate || 0);
        const totalGas = computationCost + storageCost - storageRebate;
        const gasSUI = totalGas / 1_000_000_000;
        gasMessage = `\n\n⛽ GAS FEE PAID: ${gasSUI.toFixed(6)} SUI\n   • Computation: ${(computationCost / 1_000_000_000).toFixed(6)} SUI\n   • Storage: ${(storageCost / 1_000_000_000).toFixed(6)} SUI\n   • Rebate: -${(storageRebate / 1_000_000_000).toFixed(6)} SUI`;
      }
      
      // Show alert with transaction link and gas info
      alert(`✅ Payment executed successfully!${gasMessage}\n\nTransaction: ${result.digest}\n\nView on Explorer:\nhttps://suiscan.xyz/testnet/tx/${result.digest}`);

      return result;
    },
    onSuccess: () => {
      // Force immediate refetch to update UI
      console.log('✅ Payment execution successful! Refreshing data...');
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      queryClient.invalidateQueries({ queryKey: ['role-live-transactions', roleId] });
      
      // Force refetch after delay to allow blockchain indexing
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['role', roleId] });
        queryClient.refetchQueries({ queryKey: ['role-live-transactions', roleId] });
        console.log('🔄 Data refreshed - executed payments should now show');
      }, 2000);
    },
    onError: (error: any) => {
      console.error('❌ Failed to execute payments:', error);
      alert(`Failed to execute payments: ${error.message || error}`);
      throw error;
    },
  });
};
