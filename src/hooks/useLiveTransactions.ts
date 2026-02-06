import { useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { SUI_PACKAGE_ID } from '@/config/sui';

interface LiveTransaction {
  type: 'funding' | 'payment' | 'created';
  from: string;
  to?: string;
  amount: number;
  timestamp: number;
  txDigest: string;
  status: 'success' | 'pending' | 'failed';
}

export const useLiveTransactions = (roleId: string | undefined) => {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['role-live-transactions', roleId],
    enabled: !!roleId && !!client,
    retry: 1,
    staleTime: 30000,
    queryFn: async () => {
      if (!roleId) return [];

      const transactions: LiveTransaction[] = [];

      try {
        // Query by InputObject (transactions that used this role)
        const inputObjectTxs = await client.queryTransactionBlocks({
          filter: {
            InputObject: roleId,
          },
          options: {
            showEffects: true,
            showInput: true,
            showEvents: true,
            showObjectChanges: true,
          },
          limit: 50,
        });

        // Query by events from the package
        const packageEventTxs = await client.queryEvents({
          query: {
            MoveEventModule: {
              package: SUI_PACKAGE_ID,
              module: 'role',
            }
          },
          limit: 100,
        });

        // Combine both methods and deduplicate by digest
        const allTxDigests = new Set<string>();
        const allTxData: any[] = [];

        // Add InputObject transactions
        for (const tx of inputObjectTxs.data) {
          if (!allTxDigests.has(tx.digest)) {
            allTxDigests.add(tx.digest);
            allTxData.push(tx);
          }
        }

        // Add transactions from events (need to fetch full tx data)
        for (const event of packageEventTxs.data) {
          const digest = event.id.txDigest;
          if (!allTxDigests.has(digest)) {
            allTxDigests.add(digest);
            // Fetch full transaction data
            try {
              const txData = await client.getTransactionBlock({
                digest,
                options: {
                  showEffects: true,
                  showEvents: true,
                  showInput: true,
                },
              });
              allTxData.push(txData);
            } catch (e) {
              console.warn('Could not fetch tx:', digest);
            }
          }
        }

        // Process all transactions
        for (const tx of allTxData) {
          // Parse timestamp
          let timestamp = Date.now();
          if (tx.timestampMs) {
            const tsValue = typeof tx.timestampMs === 'string' ? parseInt(tx.timestampMs) : tx.timestampMs;
            timestamp = tsValue < 10000000000 ? tsValue * 1000 : tsValue;
          }
          
          const status = tx.effects?.status?.status === 'success' ? 'success' : 'failed';

          // Check all events
          if (tx.events && tx.events.length > 0) {
            for (const event of tx.events) {
              // RoleCreated event
              if (event.type.includes('::role::RoleCreated')) {
                const parsedJson = event.parsedJson as any;
                if (parsedJson?.role_id === roleId) {
                  transactions.push({
                    type: 'created',
                    from: parsedJson?.creator || '',
                    amount: 0,
                    timestamp,
                    txDigest: tx.digest,
                    status,
                  });
                }
              }

              // FundEvent
              if (event.type.includes('::role::FundEvent')) {
                const parsedJson = event.parsedJson as any;
                if (parsedJson?.role_id === roleId) {
                  const amount = parsedJson?.amount || 0;
                  const parsedAmount = typeof amount === 'string' ? parseInt(amount) : amount;
                  
                  transactions.push({
                    type: 'funding',
                    from: parsedJson?.sender || '',
                    amount: parsedAmount,
                    timestamp,
                    txDigest: tx.digest,
                    status,
                  });
                }
              }

              // PaymentExecuted
              if (event.type.includes('::role::PaymentExecuted')) {
                const parsedJson = event.parsedJson as any;
                if (parsedJson?.role_id === roleId) {
                  const amount = parsedJson?.amount || 0;
                  const parsedAmount = typeof amount === 'string' ? parseInt(amount) : amount;
                  
                  transactions.push({
                    type: 'payment',
                    from: parsedJson?.role_id || '',
                    to: parsedJson?.recipient || '',
                    amount: parsedAmount,
                    timestamp,
                    txDigest: tx.digest,
                    status,
                  });
                }
              }
            }
          }
        }

      } catch (error) {
        console.error('Error fetching transactions:', error);
      }

      // Sort by timestamp (most recent first)
      transactions.sort((a, b) => b.timestamp - a.timestamp);
      
      return transactions;
    },
    enabled: !!roleId,
    refetchInterval: 3000, // Refetch every 3 seconds for live updates
    staleTime: 1000, // Data fresh for 1 second (live feed)
    gcTime: 180000, // Cache for 3 minutes
  });
}

