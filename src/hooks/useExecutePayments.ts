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
        throw new Error('❌ Cannot execute payments: Role balance is ZERO.\n\nPlease fund the role first by having sponsors contribute.');
      }

      console.log('💰 Role Balance:', roleBalance / 1_000_000_000, 'SUI');
      console.log('🔧 Executing payments for role:', roleId);

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
      
      console.log('📤 Sending transaction...');
      
      const result = await signAndExecute({
        transaction: txb,
      });
      
      console.log('✅ Transaction submitted:', result.digest);
      
      // Wait for transaction and get full details including gas
      const txDetails = await client.waitForTransaction({
        digest: result.digest,
        options: {
          showEffects: true,
          showInput: true,
          showEvents: true,
        },
      });
      
      console.log('📋 Transaction Details:', txDetails);
      
      // Check if transaction actually succeeded
      const status = txDetails.effects?.status?.status;
      if (status !== 'success') {
        const error = txDetails.effects?.status?.error || 'Unknown error';
        throw new Error(`Transaction failed: ${error}`);
      }
      
      // Count how many PaymentExecuted events were emitted
      const paymentEvents = txDetails.events?.filter((e: any) => 
        e.type.includes('::role::PaymentExecuted')
      ) || [];
      
      console.log(`✅ ${paymentEvents.length} payment(s) executed`);
      
      // Calculate actual gas fee paid
      let gasMessage = '';
      if (txDetails.effects?.gasUsed) {
        const gasUsed = txDetails.effects.gasUsed;
        const computationCost = Number(gasUsed.computationCost || 0);
        const storageCost = Number(gasUsed.storageCost || 0);
        const storageRebate = Number(gasUsed.storageRebate || 0);
        const totalGas = computationCost + storageCost - storageRebate;
        const gasSUI = totalGas / 1_000_000_000;
        gasMessage = `\n\n⛽ GAS FEE: ${gasSUI.toFixed(6)} SUI`;
      }
      
      // Show detailed alert
      if (paymentEvents.length > 0) {
        alert(`✅ SUCCESS! ${paymentEvents.length} payment(s) executed!${gasMessage}\n\nTransaction: ${result.digest}\n\nView on Explorer:\nhttps://suiscan.xyz/testnet/tx/${result.digest}`);
      } else {
        alert(`⚠️ Transaction succeeded but NO payments were executed.\n\nPossible reasons:\n• Payment scheduled time hasn't arrived yet\n• All payments already executed\n• Insufficient balance for payment amounts${gasMessage}\n\nTransaction: ${result.digest}`);
      }

      return result;
    },
    onSuccess: async () => {
      // Immediate refetch for instant feedback
      console.log('✅ Refetching role data after execution...');
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['role', roleId] }),
        queryClient.refetchQueries({ queryKey: ['role-live-transactions', roleId] }),
      ]);
      
      // Additional refetch after blockchain indexing delay (1.5s)
      setTimeout(() => {
        console.log('🔄 Second refetch after 1.5s...');
        queryClient.refetchQueries({ queryKey: ['role', roleId] });
        queryClient.refetchQueries({ queryKey: ['role-live-transactions', roleId] });
      }, 1500);
      
      // Final refetch after 3s to ensure executed payments are loaded
      setTimeout(() => {
        console.log('🔄 Final refetch after 3s...');
        queryClient.refetchQueries({ queryKey: ['role', roleId] });
        queryClient.refetchQueries({ queryKey: ['role-live-transactions', roleId] });
      }, 3000);
    },
    onError: (error: any) => {
      console.error('❌ Failed to execute payments:', error);
      alert(`Failed to execute payments: ${error.message || error}`);
      throw error;
    },
  });
};
