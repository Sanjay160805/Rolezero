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
    queryFn: async () => {
      if (!roleId) return [];

      console.log('🔍 ========== FETCHING LIVE TRANSACTIONS ==========');
      console.log('📍 Role ID:', roleId);
      console.log('📍 Package ID:', SUI_PACKAGE_ID);
      console.log('🕐 Query time:', new Date().toISOString());

      const transactions: LiveTransaction[] = [];

      try {
        // METHOD 1: Query by InputObject (transactions that used this role)
        console.log('🔎 Method 1: Querying by InputObject...');
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
        console.log('📦 Method 1 found:', inputObjectTxs.data.length, 'transactions');

        // METHOD 2: Query by events from the package
        console.log('🔎 Method 2: Querying events by package...');
        const packageEventTxs = await client.queryEvents({
          query: {
            MoveEventModule: {
              package: SUI_PACKAGE_ID,
              module: 'role',
            }
          },
          limit: 100,
        });
        console.log('📦 Method 2 found:', packageEventTxs.data.length, 'events');

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

        console.log('📊 Total unique transactions:', allTxData.length);

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
            console.log('📋 TX', tx.digest.substring(0, 8), 'has', tx.events.length, 'events');
            
            for (const event of tx.events) {
              console.log('  📌 Event type:', event.type);
              
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
                  console.log('  ✅ Role creation event');
                }
              }

              // FundEvent
              if (event.type.includes('::role::FundEvent')) {
                const parsedJson = event.parsedJson as any;
                console.log('  📄 FundEvent data:', parsedJson);
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
                  console.log('  ✅ Funding transaction:', parsedAmount / 1_000_000_000, 'SUI');
                }
              }

              // PaymentExecuted
              if (event.type.includes('::role::PaymentExecuted')) {
                const parsedJson = event.parsedJson as any;
                console.log('  📄 PaymentExecuted data:', parsedJson);
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
                  console.log('  ✅ Payment transaction:', parsedAmount / 1_000_000_000, 'SUI to', parsedJson?.recipient?.substring(0, 8));
                }
              }
            }
          }
        }

      } catch (error) {
        console.error('❌ Error fetching transactions:', error);
      }

      // Sort by timestamp (most recent first)
      transactions.sort((a, b) => b.timestamp - a.timestamp);
      
      console.log('✅ ========== FINAL RESULTS ==========');
      console.log('📊 Total transactions for this role:', transactions.length);
      console.log('💰 Funding transactions:', transactions.filter(t => t.type === 'funding').length);
      console.log('💸 Payment transactions:', transactions.filter(t => t.type === 'payment').length);
      console.log('📋 Transactions:', transactions);
      
      return transactions;
    },
    enabled: !!roleId,
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });
}

