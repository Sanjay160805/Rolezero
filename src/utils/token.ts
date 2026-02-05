/**
 * Format token amount with the correct token symbol
 */
export function formatTokenAmount(amount: number, token?: 'SUI' | 'USDC'): string {
  const tokenType = token || 'SUI';
  const formattedAmount = (amount / 1_000_000_000).toFixed(4);
  
  return `${formattedAmount} ${tokenType}`;
}

/**
 * Get token icon/emoji
 */
export function getTokenIcon(token?: 'SUI' | 'USDC'): string {
  switch (token) {
    case 'USDC':
      return '💵';
    case 'SUI':
    default:
      return '💎';
  }
}

/**
 * Get token display name
 */
export function getTokenName(token?: 'SUI' | 'USDC'): string {
  switch (token) {
    case 'USDC':
      return 'USDC (Stablecoin)';
    case 'SUI':
    default:
      return 'SUI (Native)';
  }
}
