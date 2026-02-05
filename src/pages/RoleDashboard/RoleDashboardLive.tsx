import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRoleData } from '@/hooks/useRoleData';
import { useLiveTransactions } from '@/hooks/useLiveTransactions';
import { useExtendExpiry } from '@/hooks/useExtendExpiry';
import { useExecutePayments } from '@/hooks/useExecutePayments';
import { useExecuteExpiry } from '@/hooks/useExecuteExpiry';
import { showToast } from '@/components/Toast/Toast';
import { AuditTrail } from '@/components/AuditTrail/AuditTrail';
import { format } from 'date-fns';
import { 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Wallet, 
  ExternalLink,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Play
} from 'lucide-react';
import { shortenAddress } from '@/utils/ens';
import { formatTokenAmount, getTokenIcon } from '@/utils/token';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import './RoleDashboardLive.css';

export const RoleDashboardLive: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const suiAccount = useCurrentAccount();
  // const { address: ethAddress } = useAccount(); // Removed - not used
  const { data: roleData, isLoading, error } = useRoleData(roleId);
  const { data: liveTransactions, isLoading: txLoading } = useLiveTransactions(roleId);
  const extendExpiry = useExtendExpiry(roleId || '');
  const executePayments = useExecutePayments(roleId || '', roleData?.remainingBalance || 0);
  const executeExpiry = useExecuteExpiry(roleId || '', roleData?.remainingBalance || 0);

  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [isExtending, setIsExtending] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  if (isLoading) {
    return (
      <div className="container dashboard-loading">
        <Loader2 className="spin" size={48} />
        <p>Loading live dashboard...</p>
      </div>
    );
  }

  if (error || !roleData) {
    return (
      <div className="container dashboard-error">
        <h2>Error Loading Role</h2>
        <p>{error?.message || 'Role not found'}</p>
        <MovingBorderButton
          borderRadius="1.5rem"
          onClick={() => navigate('/')}
          className="bg-slate-900 text-white border-slate-800"
          containerClassName="h-12 w-48"
        >
          Back to Home
        </MovingBorderButton>
      </div>
    );
  }

  const isCreator = suiAccount?.address === roleData.creator;
  const isExpired = Date.now() > roleData.expiryTime;
  const isActive = Date.now() >= roleData.startTime && !isExpired;

  const handleExtendExpiry = async () => {
    if (!newExpiryDate) return;

    const newExpiry = new Date(newExpiryDate).getTime();
    if (newExpiry <= roleData.expiryTime) {
      showToast({
        type: 'error',
        title: 'Invalid Expiry Date',
        message: 'New expiry must be later than current expiry',
      });
      return;
    }

    setIsExtending(true);
    try {
      const result = await extendExpiry.mutateAsync(newExpiry);
      showToast({
        type: 'success',
        title: 'Expiry Extended!',
        message: `Expiry time updated to ${format(newExpiry, 'MMM d, yyyy HH:mm')}`,
        txDigest: result.digest,
      });
      setNewExpiryDate('');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to Extend',
        message: err.message || 'Could not extend expiry time',
      });
    } finally {
      setIsExtending(false);
    }
  };

  const getTotalFunding = () => {
    return liveTransactions
      ?.filter(tx => tx.type === 'funding' && tx.status === 'success')
      .reduce((sum, tx) => sum + tx.amount, 0) || 0;
  };

  const getTotalPayments = () => {
    return liveTransactions
      ?.filter(tx => tx.type === 'payment' && tx.status === 'success')
      .reduce((sum, tx) => sum + tx.amount, 0) || 0;
  };

  const getPendingCount = () => {
    return liveTransactions?.filter(tx => tx.status === 'pending').length || 0;
  };

  return (
    <div className="container dashboard-live-page">
      {/* Critical Warning Banner - Recipient Mismatch */}
      {suiAccount && roleData.payments.some(p => 
        p.recipient !== suiAccount.address && 
        !roleData.executedPayments.some(ep => ep.recipient === p.recipient)
      ) && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
          border: '2px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'start',
          gap: '1rem'
        }}>
          <AlertCircle size={32} style={{color: '#ef4444', flexShrink: 0}} />
          <div>
            <h3 style={{color: '#ef4444', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold'}}>
              ⚠️ Warning: Payment Recipients Don't Match Your Wallet!
            </h3>
            <p style={{marginBottom: '0.5rem'}}>
              Some scheduled payments are set to go to <strong>different addresses</strong>, not your connected wallet.
            </p>
            <p style={{fontSize: '0.875rem', opacity: 0.9}}>
              When you execute payments, funds will be sent to the recipient addresses listed below, NOT to your wallet ({shortenAddress(suiAccount.address, 8)}).
            </p>
            <div style={{marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem'}}>
              {roleData.payments.filter(p => !roleData.executedPayments.some(ep => ep.recipient === p.recipient)).map((p, i) => (
                <div key={i} style={{marginBottom: '0.5rem', fontSize: '0.875rem'}}>
                  Payment #{i+1}: <code>{shortenAddress(p.recipient, 10)}</code> - {(p.amount / 1_000_000_000).toFixed(4)} SUI
                  {p.recipient === suiAccount.address ? 
                    <span style={{color: '#10b981', marginLeft: '0.5rem'}}>✅ Your wallet</span> : 
                    <span style={{color: '#ef4444', marginLeft: '0.5rem'}}>❌ Different wallet</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h1>{roleData.name}</h1>
          <div className="role-meta">
            <span className={`status-badge ${isActive ? 'active' : isExpired ? 'expired' : 'pending'}`}>
              {isActive ? '🟢 Active' : isExpired ? '🔴 Expired' : '🟡 Pending'}
            </span>
            <span className="role-id">ID: {shortenAddress(roleId || '', 6)}</span>
            {roleData.token && (
              <span className="token-badge">
                {getTokenIcon(roleData.token)} {roleData.token}
              </span>
            )}
              const sponsorUrl = `${window.location.origin}/sponsor/${roleId}`;
              navigator.clipboard.writeText(sponsorUrl);
              alert('✅ Sponsor link copied to clipboard!\n\nShare this link with sponsors:\n' + sponsorUrl);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            containerClassName="h-12 w-56"
          >
            <ExternalLink size={18} className="mr-2" />
            Copy Sponsor Link
          </MovingBorderButton>
          
          <MovingBorderButton
            borderRadius="1.5rem"
            onClick={() => navigate(`/sponsor/${roleId}`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            containerClassName="h-12 w-48"
          >
            <TrendingUp size={18} className="mr-2" />
            Sponsor Now
          </MovingBorderButton>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="live-stats-grid">
        <div className="stat-card card gradient-blue">
          <div className="stat-icon">
            <ArrowDownRight size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Funded</div>
            <div className="stat-value">{(getTotalFunding() / 1_000_000_000).toFixed(4)} SUI</div>
            <div className="stat-sublabel">{liveTransactions?.filter(tx => tx.type === 'funding').length || 0} transactions</div>
          </div>
        </div>

        <div className="stat-card card gradient-purple">
          <div className="stat-icon">
            <ArrowUpRight size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Payments</div>
            <div className="stat-value">{(getTotalPayments() / 1_000_000_000).toFixed(4)} SUI</div>
            <div className="stat-sublabel">{liveTransactions?.filter(tx => tx.type === 'payment').length || 0} executed</div>
          </div>
        </div>

        <div className="stat-card card gradient-green">
          <div className="stat-icon">
            <Wallet size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Current Balance</div>
            <div className="stat-value">{(roleData.remainingBalance / 1_000_000_000).toFixed(4)} SUI</div>
            <div className="stat-sublabel">Available now</div>
          </div>
        </div>

        <div className="stat-card card gradient-orange">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Expires</div>
            <div className="stat-value">{format(roleData.expiryTime, 'MMM d, yyyy')}</div>
            <div className="stat-sublabel">{format(roleData.expiryTime, 'HH:mm:ss')}</div>
          </div>
        </div>
      </div>

      {/* Shareable Sponsor Link Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
        border: '2px solid rgba(168, 85, 247, 0.3)',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'}}>
          <div style={{flex: 1, minWidth: '300px'}}>
            <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
              <ExternalLink size={20} />
              <span>Share with Sponsors</span>
            </h3>
            <p style={{fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.75rem'}}>
              Copy and share this link with sponsors so they can fund this role
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              wordBreak: 'break-all',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              {window.location.origin}/sponsor/{roleId}
            </div>
          </div>
          <MovingBorderButton
            borderRadius="0.75rem"
            onClick={() => {
              const sponsorUrl = `${window.location.origin}/sponsor/${roleId}`;
              navigator.clipboard.writeText(sponsorUrl);
              showToast({
                type: 'success',
                title: 'Link Copied!',
                message: 'Sponsor link copied to clipboard. Share it with sponsors to receive funding.',
              });
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            containerClassName="h-12 w-40"
          >
            <ExternalLink size={16} className="mr-2" />
            Copy Link
          </MovingBorderButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Scheduled Payments Section */}
        <div className="card scheduled-payments-card">
          <div className="card-header">
            <h3>
              <Clock size={20} />
              Scheduled Payments
            </h3>
          </div>

          <div className="payments-list">
            {roleData.payments.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={48} />
                <p>No payments scheduled</p>
              </div>
            ) : (() => {
              // Filter to show only unexecuted payments
              const pendingPayments = roleData.payments.filter(payment => {
                const isExecuted = roleData.executedPayments.some(
                  ep => ep.recipient === payment.recipient && Math.abs(ep.amount - payment.amount) < 1000
                );
                return !isExecuted; // Only show payments that haven't been executed
              });

              if (pendingPayments.length === 0) {
                return (
                  <div className="empty-state">
                    <CheckCircle size={48} style={{color: '#10b981'}} />
                    <p style={{color: '#10b981', fontWeight: 600}}>All payments completed!</p>
                    <p style={{fontSize: '0.875rem', opacity: 0.8}}>All scheduled payments have been executed.</p>
                  </div>
                );
              }

              return pendingPayments.map((payment, index) => {
                const isReady = Date.now() >= payment.scheduledTime && isActive;
                const scheduledDate = new Date(payment.scheduledTime);

                return (
                  <div key={index} className={`payment-item ${isReady ? 'ready' : 'pending'}`}>
                    <div className="payment-info">
                      <div className="payment-recipient">
                        <Wallet size={16} />
                        {shortenAddress(payment.recipient)}
                      </div>
                      <div className="payment-time">
                        📅 {format(scheduledDate, 'MMM d, yyyy HH:mm:ss')}
                      </div>
                    </div>
                    
                    <div className="payment-amount">
                      {(payment.amount / 1_000_000_000).toFixed(4)} SUI
                    </div>

                    <div className="payment-status">
                      {isReady ? (
                        <span className="badge badge-ready">⚡ Ready to Execute</span>
                      ) : (
                        <span className="badge badge-scheduled">⏰ Scheduled</span>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {(() => {
            // Check if there are any payments ready to execute (not yet executed, time has come, role is active)
            const hasReadyPayments = roleData.payments.some(p => {
              const isExecuted = roleData.executedPayments.some(
                ep => ep.recipient === p.recipient && Math.abs(ep.amount - p.amount) < 1000
              );
              return !isExecuted && Date.now() >= p.scheduledTime && isActive;
            });

            // Check if all scheduled payments have been executed
            const allPaymentsExecuted = roleData.payments.every(p => {
              return roleData.executedPayments.some(
                ep => ep.recipient === p.recipient && Math.abs(ep.amount - p.amount) < 1000
              );
            });

            // Show success message if all payments are executed
            if (allPaymentsExecuted && roleData.payments.length > 0) {
              return (
                <div className="ready-banner" style={{background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgb(16, 185, 129)', padding: '1rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                    <CheckCircle size={20} style={{color: '#10b981'}} />
                    <strong style={{color: '#10b981'}}>✅ All Payments Executed!</strong>
                  </div>
                  <p style={{fontSize: '0.875rem', opacity: 0.9}}>
                    All scheduled payments have been successfully executed. Check the transaction history above for details.
                  </p>
                </div>
              );
            }

            // Show execute button only if there are ready payments
            if (!hasReadyPayments) return null;

            return (
            <div className="ready-banner" style={{background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgb(16, 185, 129)', padding: '1rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem'}}>
                <CheckCircle size={16} />
                <strong>Payments are ready to execute!</strong>
              </div>
              <p style={{fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.75rem'}}>
                💡 <strong>How it works:</strong> Clicking "Execute Payments" triggers the smart contract to send funds from the role balance to recipients. 
                <strong>YOU WILL PAY A GAS FEE (~0.001-0.01 SUI) from your wallet.</strong> The payment amounts come from the role's funded balance.
              </p>
              <p style={{fontSize: '0.875rem', opacity: 0.85, marginBottom: roleData.remainingBalance <= 0 ? '0.5rem' : '1rem'}}>
                📊 <strong>Current Role Balance:</strong> {(roleData.remainingBalance / 1_000_000_000).toFixed(4)} SUI
              </p>
              {roleData.remainingBalance <= 0 && (
                <div style={{background: 'rgba(239, 68, 68, 0.2)', border: '2px solid rgba(239, 68, 68, 0.5)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem'}}>
                  <AlertCircle size={16} style={{display: 'inline', marginRight: '0.5rem', color: '#ef4444'}} />
                  <strong style={{color: '#ef4444'}}>⚠️ INSUFFICIENT BALANCE!</strong>
                  <p style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>Role balance is ZERO. Please fund the role before executing payments.</p>
                </div>
              )}
              <MovingBorderButton
                borderRadius="0.75rem"
                onClick={() => executePayments.mutate()}
                disabled={executePayments.isPending || roleData.remainingBalance <= 0}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                containerClassName="h-10 w-48"
              >
                {executePayments.isPending ? (
                  <>
                    <Loader2 className="spin mr-2" size={16} />
                    Executing...
                  </>
                ) : roleData.remainingBalance <= 0 ? (
                  <>
                    <XCircle size={16} className="mr-2" />
                    Insufficient Balance
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    Execute Payments
                  </>
                )}
              </MovingBorderButton>
            </div>
            );
          })()}
        </div>

        {/* Live Transaction Feed */}
        <div className="card live-transactions-card">
          <div className="card-header">
            <h3>
              <RefreshCw size={20} className={txLoading ? 'spin' : ''} />
              Live Transaction Feed
            </h3>
            <span className="live-indicator">
              <span className="pulse"></span>
              Live
            </span>
          </div>

          {!liveTransactions || liveTransactions.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} />
              <p>No transactions yet</p>
              <p className="text-sm">Transactions will appear here in real-time</p>
            </div>
          ) : (
            <div className="transactions-feed">
              {liveTransactions.map((tx, index) => (
                <div key={`${tx.txDigest}-${index}`} className={`transaction-item ${tx.type} ${tx.status}`}>
                  <div className="tx-icon">
                    {tx.status === 'success' && <CheckCircle size={20} />}
                    {tx.status === 'pending' && <Loader2 size={20} className="spin" />}
                    {tx.status === 'failed' && <XCircle size={20} />}
                  </div>

                  <div className="tx-content">
                    <div className="tx-type-badge">
                      {tx.type === 'funding' ? (
                        <span className="badge badge-funding">📥 Funding Received</span>
                      ) : tx.type === 'payment' ? (
                        <span className="badge badge-payment">📤 Payment Sent</span>
                      ) : (
                        <span className="badge badge-created">🎉 Role Created</span>
                      )}
                    </div>

                    <div className="tx-addresses">
                      <span className="from">
                        <Wallet size={14} />
                        From: {shortenAddress(tx.from)}
                      </span>
                      {tx.to && (
                        <>
                          <span className="arrow">→</span>
                          <span className="to">
                            To: {shortenAddress(tx.to)}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="tx-details">
                      {tx.amount > 0 && (
                        <span className="tx-amount">
                          {tx.type === 'funding' ? '+' : tx.type === 'payment' ? '-' : ''}
                          {(tx.amount / 1_000_000_000).toFixed(4)} SUI
                        </span>
                      )}
                      <span className="tx-time">
                        {format(tx.timestamp, 'HH:mm:ss')}
                      </span>
                    </div>

                    <a
                      href={`https://suiexplorer.com/txblock/${tx.txDigest}?network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tx-link"
                    >
                      View Details <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className={`tx-status-indicator ${tx.status}`}></div>
                </div>
              ))}
            </div>
          )}

          {getPendingCount() > 0 && (
            <div className="pending-banner">
              <Loader2 size={16} className="spin" />
              {getPendingCount()} transaction{getPendingCount() > 1 ? 's' : ''} pending...
            </div>
          )}
        </div>

        {/* Execute Expiry - Return Leftover Funds */}
        {isExpired && roleData.remainingBalance > 0 && (
          <div className="card" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: '2px solid #34d399'}}>
            <div className="card-header">
              <h3 style={{color: '#fff'}}>
                <CheckCircle size={20} />
                Return Leftover Funds
              </h3>
            </div>

            <div style={{padding: '1.5rem'}}>
              <div style={{marginBottom: '1rem', color: 'rgba(255,255,255,0.95)', lineHeight: '1.6'}}>
                <p style={{marginBottom: '0.75rem', fontWeight: 600, fontSize: '1.1rem'}}>
                  ✅ This role has expired with leftover funds
                </p>
                <p style={{marginBottom: '0.5rem'}}>
                  <strong>Leftover Balance:</strong> {(roleData.remainingBalance / 1_000_000_000).toFixed(4)} SUI
                </p>
                <p style={{marginBottom: '0.5rem'}}>
                  <strong>Recipient:</strong> {roleData.leftoverRecipient.substring(0, 8)}...{roleData.leftoverRecipient.substring(roleData.leftoverRecipient.length - 6)}
                </p>
                <p style={{fontSize: '0.875rem', opacity: 0.9, marginTop: '0.75rem', marginBottom: '0.5rem'}}>
                  💡 <strong>How it works:</strong> This triggers the smart contract to return leftover funds to the leftover recipient. 
                  You only pay a small gas fee (~0.001 SUI).
                </p>
              </div>
              <MovingBorderButton
                borderRadius="0.75rem"
                onClick={() => executeExpiry.mutate()}
                disabled={executeExpiry.isPending}
                className="bg-white text-green-600"
                containerClassName="h-12 w-full"
              >
                {executeExpiry.isPending ? (
                  <>
                    <Loader2 className="spin mr-2" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    Return Leftover Funds Now
                  </>
                )}
              </MovingBorderButton>
            </div>
          </div>
        )}

        {/* Extend Expiry Time - Available to Everyone */}
        <div className="card expiry-card">
          <div className="card-header">
            <h3>
              <Calendar size={20} />
              Extend Expiry Time
            </h3>
            {!isCreator && (
              <span className="badge badge-info" style={{marginLeft: 'auto', fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}>
                Anyone can extend
              </span>
            )}
          </div>

          <div className="expiry-content">
            <div className="current-expiry">
              <label>Current Expiry:</label>
              <div className="expiry-value">
                {format(roleData.expiryTime, 'PPP p')}
              </div>
              <div className={`expiry-status ${isExpired ? 'expired' : isActive ? 'active' : 'upcoming'}`} style={{marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 600}}>
                {isExpired ? '❌ Expired' : isActive ? '✅ Active' : '⏳ Not Started'}
              </div>
            </div>

            <div className="new-expiry-input">
              <label htmlFor="newExpiry">New Expiry Date & Time:</label>
              <input
                type="datetime-local"
                id="newExpiry"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                min={format(roleData.expiryTime, "yyyy-MM-dd'T'HH:mm")}
                className="datetime-input"
              />
            </div>

            <MovingBorderButton
              borderRadius="0.75rem"
              onClick={handleExtendExpiry}
              disabled={!newExpiryDate || isExtending || !suiAccount}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-full"
              containerClassName="w-full"
            >
              {isExtending ? (
                <>
                  <Loader2 size={18} className="spin mr-2" />
                  Extending...
                </>
              ) : !suiAccount ? (
                <>
                  <Wallet size={18} className="mr-2" />
                  Connect Wallet to Extend
                </>
              ) : (
                <>
                  <Clock size={18} className="mr-2" />
                  Extend Expiry
                </>
              )}
            </MovingBorderButton>

            <p className="helper-text">
              💡 {isCreator ? 'As creator, you can extend the expiry time' : 'Anyone can extend the expiry time to keep this role active longer'}
            </p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="security-notice card">
        <AlertCircle size={20} />
        <div>
          <strong>Secure & Live:</strong> All transactions are verified on the Sui blockchain. 
          Data updates every 5 seconds. Only the role creator can extend expiry time.
        </div>
        <button 
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          style={{
            marginLeft: 'auto',
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          {showDebugInfo ? '🔍 Hide Debug' : '🔍 Show Debug Info'}
        </button>
      </div>

      {/* Debug Panel */}
      {showDebugInfo && (
        <div className="card" style={{
          background: 'rgba(0,0,0,0.5)',
          border: '2px solid #fbbf24',
          padding: '1.5rem'
        }}>
          <h3 style={{color: '#fbbf24', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            🔍 Debug Information
          </h3>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem'}}>
            <div>
              <strong style={{color: '#fbbf24'}}>Connection:</strong>
              <div>Wallet Connected: {suiAccount ? '✅ Yes' : '❌ No'}</div>
              <div>Wallet Address: {suiAccount?.address ? shortenAddress(suiAccount.address, 8) : 'Not connected'}</div>
              <div>Role ID: {shortenAddress(roleId || '', 8)}</div>
            </div>

            <div>
              <strong style={{color: '#fbbf24'}}>Role Status:</strong>
              <div>Is Creator: {isCreator ? '✅ Yes' : '❌ No'}</div>
              <div>Is Active: {isActive ? '✅ Yes' : '❌ No'}</div>
              <div>Is Expired: {isExpired ? '✅ Yes' : '❌ No'}</div>
              <div>Current Time: {format(Date.now(), 'PPP p')}</div>
            </div>

            <div>
              <strong style={{color: '#fbbf24'}}>Payments:</strong>
              <div>Total Scheduled: {roleData.payments.length}</div>
              <div>Executed: {roleData.executedPayments.length}</div>
              <div>Ready Now: {roleData.payments.filter(p => 
                !roleData.executedPayments.some(ep => ep.recipient === p.recipient) && 
                Date.now() >= p.scheduledTime && 
                isActive
              ).length}</div>
              <div>Balance: {(roleData.remainingBalance / 1_000_000_000).toFixed(4)} SUI</div>
            </div>

            <div>
              <strong style={{color: '#fbbf24'}}>Transactions:</strong>
              <div>Total Found: {liveTransactions?.length || 0}</div>
              <div>Funding Txs: {liveTransactions?.filter(tx => tx.type === 'funding').length || 0}</div>
              <div>Payment Txs: {liveTransactions?.filter(tx => tx.type === 'payment').length || 0}</div>
              <div>Status: {txLoading ? '🔄 Loading...' : '✅ Loaded'}</div>
            </div>
          </div>

          <div style={{marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem'}}>
            <strong style={{color: '#fbbf24'}}>🔍 Troubleshooting:</strong>
            <ul style={{marginTop: '0.5rem', paddingLeft: '1.5rem', fontSize: '0.875rem'}}>
              <li>Open browser console (F12) to see detailed logs</li>
              <li>After executing, look for transaction digest in console</li>
              <li>Check Sui Explorer: https://suiscan.xyz/testnet/tx/YOUR_DIGEST</li>
              <li>Verify recipient address matches your wallet</li>
              <li>Check role balance is sufficient for payments</li>
              <li>Live feed updates every 5 seconds - wait a moment</li>
            </ul>
          </div>

          <div style={{marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.5)'}}>
            <strong style={{color: '#60a5fa'}}>📋 Payment Details:</strong>
            {roleData.payments.map((p, i) => {
              const executed = roleData.executedPayments.some(ep => ep.recipient === p.recipient && ep.amount === p.amount);
              const ready = !executed && Date.now() >= p.scheduledTime && isActive;
              return (
                <div key={i} style={{marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.25rem', fontSize: '0.875rem'}}>
                  <div>Payment #{i+1}:</div>
                  <div>Recipient: {shortenAddress(p.recipient, 8)}</div>
                  <div>Amount: {(p.amount / 1_000_000_000).toFixed(4)} SUI</div>
                  <div>Scheduled: {format(p.scheduledTime, 'PPP p')}</div>
                  <div>Status: {executed ? '⚪ Executed' : ready ? '🟢 Ready' : '🟡 Scheduled'}</div>
                  <div>Your Wallet Matches: {suiAccount?.address === p.recipient ? '✅ Yes' : '❌ No'}</div>
                </div>
              );
            })}
          </div>

          <div style={{marginTop: '1rem', textAlign: 'center'}}>
            <a 
              href={`https://suiscan.xyz/testnet/object/${roleId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '0.5rem',
                color: '#60a5fa',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
            >
              🔗 View Role on Sui Explorer
            </a>
          </div>
        </div>
      )}

      {/* On-Chain Audit Trail */}
      <AuditTrail
        roleId={roleId || ''}
        developerFee="10000000"
        fundingHistory={roleData.fundingHistory.map(f => ({
          donor: f.from,
          amount: f.amount.toString(),
          timestamp: f.timestamp,
          txDigest: f.txDigest || 'pending'
        }))}
        executedPayments={roleData.executedPayments.map(p => ({
          recipient: p.recipient,
          amount: p.amount.toString(),
          timestamp: p.timestamp,
          txDigest: p.txDigest || 'pending'
        }))}
      />
    </div>
  );
};
