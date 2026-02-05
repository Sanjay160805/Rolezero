import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { SUI_PACKAGE_ID, DEVELOPER_FEE, DEVELOPER_ADDRESS } from '@/config/sui';
import { Payment } from '@/types/role';

export const useCreateRole = () => {
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  const createRole = async (params: {
    roleName: string;
    startTime: number | bigint;
    expiryTime: number | bigint;
    payments: Array<Omit<Payment, 'amount' | 'scheduledTime'> & { amount: bigint; scheduledTime: bigint }>;
    leftoverRecipient: string;
  }) => {
    const tx = new Transaction();
    
    // Set gas budget explicitly
    tx.setGasBudget(200_000_000); // 0.2 SUI max gas (higher for role creation)

    // Prepare payment recipients and amounts (coerce to integer strings)
    const recipients = params.payments.map(p => p.recipient);
    const amounts = params.payments.map(p => {
      if (typeof p.amount === 'bigint') return p.amount.toString();
      return String(p.amount);
    });
    const scheduledTimes = params.payments.map(p => {
      if (typeof p.scheduledTime === 'bigint') return p.scheduledTime.toString();
      return String(p.scheduledTime);
    });

    // Split developer fee coin
    const [developerFeeCoin] = tx.splitCoins(tx.gas, [DEVELOPER_FEE]);

    // Call the create_role function
    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::role::create_role`,
      arguments: [
        tx.pure.string(params.roleName),
        tx.pure.u64(String(params.startTime)),
        tx.pure.u64(String(params.expiryTime)),
        tx.pure.vector('address', recipients),
        tx.pure.vector('u64', amounts),
        tx.pure.vector('u64', scheduledTimes),
        tx.pure.address(params.leftoverRecipient),
        developerFeeCoin,
        tx.pure.address(DEVELOPER_ADDRESS),
      ],
    });

    const result = await signAndExecute({
      transaction: tx,
    });

    // Get created objects from transaction
    const txResponse = await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    // Try to extract Role object ID from created objects
    let roleId: string | null = null;

    // Method 1: Try from objectChanges (preferred)
    if (txResponse.objectChanges) {
      const createdRole = txResponse.objectChanges.find((change: any) => 
        change.type === 'created' && 
        change.objectType?.includes('::role::Role')
      );
      if (createdRole && 'objectId' in createdRole) {
        roleId = (createdRole as any).objectId;
      }
    }

    // Method 2: Try from effects.created
    if (!roleId && txResponse.effects?.created) {
      const createdObjects = txResponse.effects.created;
      const roleObject = createdObjects.find((obj: any) => 
        obj.owner && typeof obj.owner === 'object' && 'Shared' in obj.owner
      );
      if (roleObject) {
        roleId = roleObject.reference?.objectId;
      }
    }

    // Method 3: Try from events
    if (!roleId && txResponse.events) {
      const roleCreatedEvent = txResponse.events.find((event: any) => 
        event.type.includes('::role::RoleCreated')
      );
      if (roleCreatedEvent && roleCreatedEvent.parsedJson) {
        const parsedJson = roleCreatedEvent.parsedJson as any;
        roleId = parsedJson.role_id || null;
      }
    }

    return {
      digest: result.digest,
      roleId,
    };
  };

  return { createRole };
};