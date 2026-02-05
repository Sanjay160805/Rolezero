import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { SUI_PACKAGE_ID } from '@/config/sui';

export const useFundRole = () => {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const fundRole = async (roleId: string, amount: number) => {
    const tx = new Transaction();
    
    // Set gas budget explicitly
    tx.setGasBudget(100_000_000); // 0.1 SUI max gas

    // Split coins for payment
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);

    // Call the fund_role function
    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::role::fund_role`,
      arguments: [
        tx.object(roleId),
        coin,
      ],
    });

    const result = await signAndExecute({
      transaction: tx,
    });

    return {
      digest: result.digest,
    };
  };

  return { fundRole };
};
