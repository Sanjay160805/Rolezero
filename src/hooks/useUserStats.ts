import { useQuery } from '@tanstack/react-query';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { SuiEvent } from '@mysten/sui/client';

interface FundingRequest {
  roleId: string;
  roleName: string;
  creator: string;
  currentBalance: number;
  requiredAmount: number;
  startTime: number;
  expiryTime: number;
}

interface PaymentObligation {
  roleId: string;
  roleName: string;
  recipient: string;
  amount: number;
  scheduledTime: number;
  isPaid: boolean;
}

interface Transaction {
  id: string;
  type: 'funding' | 'payment';
  roleId: string;
  roleName: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  digest: string;
}

interface DashboardData {
  fundingRequests: FundingRequest[];
  paymentObligations: PaymentObligation[];
  transactions: Transaction[];
  totalFunded: number;
  totalPaid: number;
  pendingPayments: number;
  totalUsers: number;
  totalVolume: number;
}

export function useUserStats() {
  const client = useSuiClient();
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['dashboardData', 'all-users'],
    queryFn: async (): Promise<DashboardData> => {
      // Fetch all role creation events
      const createdEvents = await client.queryEvents({
        query: {
          MoveEventType: `${import.meta.env.VITE_PACKAGE_ID}::role::RoleCreated`,
        },
      });

      // Get all roles data
      const fundingRequests: FundingRequest[] = [];
      const allPaymentObligations: PaymentObligation[] = [];
      const uniqueUsers = new Set<string>();

      for (const event of createdEvents.data) {
        const roleId = (event.parsedJson as any).role_id;
        const creator = (event.parsedJson as any).creator;
        uniqueUsers.add(creator);

        try {
          const roleObject = await client.getObject({
            id: roleId,
            options: { showContent: true },
          });

          const fields = (roleObject.data?.content as any)?.fields;
          if (fields) {
            const balance = parseInt(fields.balance) / 1_000_000_000;
            const payments = fields.scheduled_payments || [];
            const paymentsMade = fields.payments_made || [];

            // Calculate required amount (sum of all scheduled payments)
            let requiredAmount = 0;
            for (const payment of payments) {
              requiredAmount += parseInt(payment.amount) / 1_000_000_000;
            }

            // Add as funding request if underfunded
            if (balance < requiredAmount) {
              fundingRequests.push({
                roleId,
                roleName: fields.name || 'Unnamed Role',
                creator,
                currentBalance: balance,
                requiredAmount,
                startTime: parseInt(fields.start_time),
                expiryTime: parseInt(fields.expiry_time),
              });
            }

            // Collect all payment obligations
            for (const payment of payments) {
              uniqueUsers.add(payment.recipient);
              
              const isPaid = paymentsMade.some(
                (p: any) => p.recipient === payment.recipient && 
                parseInt(p.scheduled_time) === parseInt(payment.scheduled_time)
              );

              allPaymentObligations.push({
                roleId,
                roleName: fields.name || 'Unnamed Role',
                recipient: payment.recipient,
                amount: parseInt(payment.amount) / 1_000_000_000,
                scheduledTime: parseInt(payment.scheduled_time),
                isPaid,
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching role ${roleId}:`, error);
        }
      }

      // Fetch all funding events
      const fundingEvents = await client.queryEvents({
        query: {
          MoveEventType: `${import.meta.env.VITE_PACKAGE_ID}::role::RoleFunded`,
        },
      });

      // Fetch all payment events
      const paymentEvents = await client.queryEvents({
        query: {
          MoveEventType: `${import.meta.env.VITE_PACKAGE_ID}::role::PaymentMade`,
        },
      });

      const transactions: Transaction[] = [];
      let totalFunded = 0;
      let totalPaid = 0;
      let totalVolume = 0;

      // Process all funding transactions
      for (const event of fundingEvents.data) {
        const sponsor = (event.parsedJson as any).sponsor;
        const roleId = (event.parsedJson as any).role_id;
        const amount = parseInt((event.parsedJson as any).amount) / 1_000_000_000;

        uniqueUsers.add(sponsor);
        totalFunded += amount;
        totalVolume += amount;

        // Get role name
        let roleName = 'Unknown Role';
        try {
          const roleObject = await client.getObject({
            id: roleId,
            options: { showContent: true },
          });
          const fields = (roleObject.data?.content as any)?.fields;
          if (fields) {
            roleName = fields.name || 'Unnamed Role';
          }
        } catch (error) {
          console.error(`Error fetching role name:`, error);
        }

        transactions.push({
          id: `funding-${event.id?.txDigest}-${event.id?.eventSeq}`,
          type: 'funding',
          roleId,
          roleName,
          from: sponsor,
          to: roleId,
          amount,
          timestamp: parseInt(event.timestampMs || '0'),
          digest: event.id?.txDigest || '',
        });
      }

      // Process all payment transactions
      for (const event of paymentEvents.data) {
        const recipient = (event.parsedJson as any).recipient;
        const roleId = (event.parsedJson as any).role_id;
        const amount = parseInt((event.parsedJson as any).amount) / 1_000_000_000;

        uniqueUsers.add(recipient);
        totalPaid += amount;
        totalVolume += amount;

        // Get role name
        let roleName = 'Unknown Role';
        try {
          const roleObject = await client.getObject({
            id: roleId,
            options: { showContent: true },
          });
          const fields = (roleObject.data?.content as any)?.fields;
          if (fields) {
            roleName = fields.name || 'Unnamed Role';
          }
        } catch (error) {
          console.error(`Error fetching role name:`, error);
        }

        transactions.push({
          id: `payment-${event.id?.txDigest}-${event.id?.eventSeq}`,
          type: 'payment',
          roleId,
          roleName,
          from: roleId,
          to: recipient,
          amount,
          timestamp: parseInt(event.timestampMs || '0'),
          digest: event.id?.txDigest || '',
        });
      }

      // Sort transactions by timestamp (newest first)
      transactions.sort((a, b) => b.timestamp - a.timestamp);

      const pendingPayments = allPaymentObligations.filter(p => !p.isPaid).length;

      return {
        fundingRequests,
        paymentObligations: allPaymentObligations,
        transactions,
        totalFunded,
        totalPaid,
        pendingPayments,
        totalUsers: uniqueUsers.size,
        totalVolume,
      };
    },
    staleTime: 30000,
  });
}


