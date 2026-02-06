export interface Payment {
  recipient: string;
  amount: number;
  scheduledTime: number;
  executed?: boolean; // Track if payment was executed on-chain
  ensName?: string;
  token?: 'SUI' | 'USDC'; // Payment token type
}

export interface RoleData {
  id: string;
  name: string;
  creator: string;
  startTime: number;
  expiryTime: number;
  payments: Payment[];
  leftoverRecipient: string;
  leftoverRecipientEns?: string;
  totalFunded: number;
  remainingBalance: number;
  executedPayments: ExecutedPayment[];
  fundingHistory: FundingEvent[];
  token?: 'SUI' | 'USDC'; // Default payment token for the role
}

export interface ExecutedPayment {
  recipient: string;
  amount: number;
  timestamp: number;
  txDigest: string;
  token?: 'SUI' | 'USDC';
}

export interface FundingEvent {
  from: string;
  amount: number;
  timestamp: number;
  txDigest: string;
}
