import { useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { RoleData } from '@/types/role';

export const useRoleData = (roleId: string | undefined) => {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['role', roleId],
    queryFn: async () => {
      if (!roleId) return null;

      // Fetch the role object
      const roleObject = await client.getObject({
        id: roleId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      if (!roleObject.data?.content || roleObject.data.content.dataType !== 'moveObject') {
        throw new Error('Invalid role object');
      }

      const fields = roleObject.data.content.fields as any;

      // Fetch transaction history for this role
      const txBlocks = await client.queryTransactionBlocks({
        filter: {
          InputObject: roleId,
        },
        options: {
          showEffects: true,
          showInput: true,
          showEvents: true,
        },
      });

      // Parse funding history and executed payments from transactions
      const fundingHistory = txBlocks.data
        .filter(tx => tx.events?.some(e => e.type.includes('::role::FundEvent')))
        .map(tx => {
          const fundEvent = tx.events?.find(e => e.type.includes('::role::FundEvent'));
          const parsedJson = fundEvent?.parsedJson as any;
          
          // Parse timestamp properly
          let timestamp = Date.now();
          if (tx.timestampMs) {
            const tsValue = typeof tx.timestampMs === 'string' ? parseInt(tx.timestampMs) : tx.timestampMs;
            timestamp = tsValue < 10000000000 ? tsValue * 1000 : tsValue;
          }
          
          const amount = typeof parsedJson?.amount === 'string' ? parseInt(parsedJson.amount) : (parsedJson?.amount || 0);
          
          return {
            from: parsedJson?.sender || '',
            amount,
            timestamp,
            txDigest: tx.digest,
          };
        });

      const executedPayments = txBlocks.data
        .filter(tx => tx.events?.some(e => e.type.includes('::role::PaymentExecuted')))
        .map(tx => {
          const paymentEvent = tx.events?.find(e => e.type.includes('::role::PaymentExecuted'));
          const parsedJson = paymentEvent?.parsedJson as any;
          
          // Parse timestamp properly
          let timestamp = Date.now();
          if (tx.timestampMs) {
            const tsValue = typeof tx.timestampMs === 'string' ? parseInt(tx.timestampMs) : tx.timestampMs;
            timestamp = tsValue < 10000000000 ? tsValue * 1000 : tsValue;
          }
          
          const amount = typeof parsedJson?.amount === 'string' ? parseInt(parsedJson.amount) : (parsedJson?.amount || 0);
          
          return {
            recipient: parsedJson?.recipient || '',
            amount,
            timestamp,
            txDigest: tx.digest,
          };
        });

      // Parse payments with proper timestamp handling
      const payments = (fields.payments || []).map((p: any) => {
        // Blockchain returns nested structure: p.fields.{amount, recipient, scheduled_time, executed}
        const paymentFields = p.fields || p;
        
        // Handle scheduled_time - it might be a string or number
        let scheduledTime = 0;
        if (paymentFields.scheduled_time !== undefined && paymentFields.scheduled_time !== null) {
          const timeValue = typeof paymentFields.scheduled_time === 'string' ? parseInt(paymentFields.scheduled_time) : paymentFields.scheduled_time;
          // Blockchain already stores in milliseconds
          scheduledTime = timeValue;
        }
        
        // Handle amount
        const amount = typeof paymentFields.amount === 'string' ? parseInt(paymentFields.amount) : (paymentFields.amount || 0);
        
        // Handle executed flag
        const executed = paymentFields.executed === true || paymentFields.executed === 'true';
        
        return {
          recipient: paymentFields.recipient,
          amount,
          scheduledTime,
          executed, // NEW: Track if payment was already executed on-chain
        };
      });

      const roleData: RoleData = {
        id: roleId,
        name: fields.name || 'Unknown Role',
        creator: fields.owner || '', // Move contract uses 'owner' field, not 'creator'
        startTime: parseInt(fields.start_time) || 0,
        expiryTime: parseInt(fields.expiry_time) || 0,
        payments,
        leftoverRecipient: fields.leftover_recipient || '',
        totalFunded: parseInt(fields.total_funded) || 0,
        remainingBalance: parseInt(fields.balance) || 0,
        executedPayments,
        fundingHistory,
      };

      return roleData;
    },
    enabled: !!roleId,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 2000, // Data fresh for 2 seconds
    gcTime: 300000, // Cache for 5 minutes
  });
};
