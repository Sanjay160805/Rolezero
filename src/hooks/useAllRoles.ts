import { useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { SUI_PACKAGE_ID } from '@/config/sui';

export interface RoleSummary {
  id: string;
  name: string;
  creator: string;
  startTime: number;
  expiryTime: number;
  totalFunded: number;
  remainingBalance: number;
  sponsorCount: number;
  paymentCount: number;
}

export const useAllRoles = () => {
  const client = useSuiClient();

  return useQuery({
    queryKey: ['allRoles'],
    queryFn: async () => {
      try {
        // Get all objects of Role type
        const response = await client.queryEvents({
          query: {
            MoveEventType: `${SUI_PACKAGE_ID}::role::RoleCreated`,
          },
          limit: 100,
        });

        // Parse role data from events
        const roles: RoleSummary[] = await Promise.all(
          response.data.map(async (event) => {
            const eventData = event.parsedJson as any;
            const roleId = eventData.role_id;

            try {
              // Fetch full role object
              const roleObject = await client.getObject({
                id: roleId,
                options: {
                  showContent: true,
                },
              });

              if (!roleObject.data?.content || roleObject.data.content.dataType !== 'moveObject') {
                return null;
              }

              const fields = roleObject.data.content.fields as any;

              // Get transaction count for sponsors
              const txBlocks = await client.queryTransactionBlocks({
                filter: {
                  InputObject: roleId,
                },
                options: {
                  showEvents: true,
                },
              });

              const fundingEvents = txBlocks.data.filter(tx =>
                tx.events?.some(e => e.type.includes('::role::FundEvent'))
              );

              const uniqueSponsors = new Set(
                fundingEvents.map(tx => {
                  const fundEvent = tx.events?.find(e => e.type.includes('::role::FundEvent'));
                  return (fundEvent?.parsedJson as any)?.sender || '';
                }).filter(Boolean)
              );

              return {
                id: roleId,
                name: fields.name || 'Unknown Role',
                creator: eventData.creator || fields.owner || '',
                startTime: fields.start_time || 0,
                expiryTime: fields.expiry_time || 0,
                totalFunded: fields.total_funded || 0,
                remainingBalance: fields.balance || 0,
                sponsorCount: uniqueSponsors.size,
                paymentCount: (fields.payments || []).length,
              };
            } catch (error) {
              console.error(`Error fetching role ${roleId}:`, error);
              return null;
            }
          })
        );

        // Filter out null values and sort by creation time (most recent first)
        return roles
          .filter((role): role is RoleSummary => role !== null)
          .sort((a, b) => b.startTime - a.startTime);
      } catch (error) {
        console.error('Error fetching roles:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
