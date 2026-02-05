import React from 'react';
import { Shield, ExternalLink, Check } from 'lucide-react';
import './AuditTrail.css';

interface Transaction {
  type: 'funding' | 'payment' | 'developer_fee' | 'return_leftover';
  timestamp: number;
  amount: string;
  from?: string;
  to?: string;
  txDigest: string;
  status: 'confirmed';
}

interface AuditTrailProps {
  roleId: string;
  developerFee: string;
  fundingHistory: Array<{
    donor: string;
    amount: string;
    timestamp: number;
    txDigest: string;
  }>;
  executedPayments: Array<{
    recipient: string;
    amount: string;
    timestamp: number;
    txDigest: string;
  }>;
  returnLeftoverTx?: {
    amount: string;
    timestamp: number;
    txDigest: string;
  };
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  roleId,
  developerFee,
  fundingHistory,
  executedPayments,
  returnLeftoverTx,
}) => {
  const allTransactions: Transaction[] = [
    // Developer fee (if role was created)
    ...(fundingHistory.length > 0 ? [{
      type: 'developer_fee' as const,
      timestamp: fundingHistory[0].timestamp,
      amount: developerFee,
      from: fundingHistory[0].donor,
      to: '0x7cd3...de547',
      txDigest: fundingHistory[0].txDigest,
      status: 'confirmed' as const,
    }] : []),
    // All funding transactions
    ...fundingHistory.map(f => ({
      type: 'funding' as const,
      timestamp: f.timestamp,
      amount: f.amount,
      from: f.donor,
      to: roleId,
      txDigest: f.txDigest,
      status: 'confirmed' as const,
    })),
    // All payment executions
    ...executedPayments.map(p => ({
      type: 'payment' as const,
      timestamp: p.timestamp,
      amount: p.amount,
      from: roleId,
      to: p.recipient,
      txDigest: p.txDigest,
      status: 'confirmed' as const,
    })),
    // Return leftover if exists
    ...(returnLeftoverTx ? [{
      type: 'return_leftover' as const,
      timestamp: returnLeftoverTx.timestamp,
      amount: returnLeftoverTx.amount,
      from: roleId,
      to: fundingHistory[0]?.donor || 'Sponsor',
      txDigest: returnLeftoverTx.txDigest,
      status: 'confirmed' as const,
    }] : []),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount) / 1_000_000_000;
    return num.toFixed(4);
  };

  const formatAddress = (address: string) => {
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'developer_fee':
        return 'Developer Fee (1%)';
      case 'funding':
        return 'Funding Received';
      case 'payment':
        return 'Payment Executed';
      case 'return_leftover':
        return 'Leftover Returned';
      default:
        return 'Transaction';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'developer_fee':
        return 'purple';
      case 'funding':
        return 'green';
      case 'payment':
        return 'blue';
      case 'return_leftover':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <div className="audit-trail">
      <div className="audit-trail-header">
        <div className="audit-trail-title">
          <Shield size={24} />
          <h3>On-Chain Audit Trail</h3>
        </div>
        <p className="audit-trail-subtitle">
          Complete transaction history permanently recorded on Sui blockchain. Every transaction is verified and immutable.
        </p>
      </div>

      {allTransactions.length === 0 ? (
        <div className="audit-trail-empty">
          <Shield size={48} />
          <p>No transactions yet</p>
          <span>All transactions will be permanently recorded here</span>
        </div>
      ) : (
        <div className="audit-trail-list">
          {allTransactions.map((tx, index) => (
            <div key={`${tx.txDigest}-${index}`} className={`audit-trail-item color-${getTransactionColor(tx.type)}`}>
              <div className="audit-trail-item-left">
                <div className={`audit-trail-badge badge-${getTransactionColor(tx.type)}`}>
                  <Check size={16} />
                </div>
                <div className="audit-trail-item-info">
                  <div className="audit-trail-item-label">
                    {getTransactionLabel(tx.type)}
                  </div>
                  <div className="audit-trail-item-details">
                    {tx.from && <span>From: {formatAddress(tx.from)}</span>}
                    {tx.to && <span>To: {formatAddress(tx.to)}</span>}
                    <span className="audit-trail-time">
                      {new Date(tx.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="audit-trail-item-right">
                <div className="audit-trail-amount">
                  {formatAmount(tx.amount)} SUI
                </div>
                <a
                  href={`https://suiscan.xyz/testnet/tx/${tx.txDigest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="audit-trail-link"
                  title="View on Sui Explorer"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="audit-trail-footer">
        <div className="audit-trail-stats">
          <div className="audit-trail-stat">
            <span className="stat-value">{fundingHistory.length}</span>
            <span className="stat-label">Funding TX</span>
          </div>
          <div className="audit-trail-stat">
            <span className="stat-value">{executedPayments.length}</span>
            <span className="stat-label">Payments TX</span>
          </div>
          <div className="audit-trail-stat">
            <span className="stat-value">{allTransactions.length}</span>
            <span className="stat-label">Total TX</span>
          </div>
        </div>
        <div className="audit-trail-trust">
          <Shield size={16} />
          <span>All transactions permanently stored on-chain. Nothing is deleted or hidden.</span>
        </div>
      </div>
    </div>
  );
};
