import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoleData } from '@/hooks/useRoleData';
import { useReverseEns } from '@/hooks/useReverseEns';
import { useEnsDeFiProfile } from '@/hooks/useEnsDeFiProfile';
import { format } from 'date-fns';
import { Loader2, ArrowUpRight, ArrowDownRight, Clock, Wallet, ExternalLink } from 'lucide-react';
import { shortenAddress } from '@/utils/ens';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import './RoleDashboard.css';

const SponsorInfo: React.FC<{ address: string }> = ({ address }) => {
  const { ensName } = useReverseEns(address);
  const { profile } = useEnsDeFiProfile(ensName);

  // Redirect to live dashboard for better real-time experience
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId: string }>();
  
  useEffect(() => {
    if (roleId) {
      console.log('Redirecting to live dashboard for better experience...');
      navigate(`/role/${roleId}/live`, { replace: true });
    }
  }, [roleId, navigate]);

  return (
    <div className="sponsor-info">
      <div className="sponsor-identity">
        <Wallet size={16} />
        <span className="sponsor-name">
          {ensName || shortenAddress(address)}
        </span>
      </div>
      
      {ensName && (profile.preferredToken || profile.notification) && (
        <div className="defi-profile">
          <div className="defi-badge">ENS DeFi Profile</div>
          {profile.preferredToken && (
            <div className="defi-field">
              <span className="label">Preferred Token:</span>
              <span className="value">{profile.preferredToken}</span>
            </div>
          )}
          {profile.notification && (
            <div className="defi-field">
              <span className="label">Notification:</span>
              <span className="value">{profile.notification}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const RoleDashboard: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  
  // Always redirect to live dashboard for better UX
  React.useEffect(() => {
    if (roleId) {
      navigate(`/role/${roleId}/live`, { replace: true });
    }
  }, [roleId, navigate]);
  const { data: roleData, isLoading, error } = useRoleData(roleId);

  if (isLoading) {
    return (
      <div className="container dashboard-loading">
        <Loader2 className="spin" size={48} />
        <p>Loading role data...</p>
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

  const totalExecuted = roleData.executedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalFunded = roleData.fundingHistory.reduce((sum, f) => sum + f.amount, 0);

  // Combine and sort timeline events
  const timelineEvents = [
    ...roleData.fundingHistory.map(f => ({
      type: 'funding' as const,
      timestamp: f.timestamp,
      data: f,
    })),
    ...roleData.executedPayments.map(p => ({
      type: 'payment' as const,
      timestamp: p.timestamp,
      data: p,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const isExpired = Date.now() > roleData.expiryTime;
  const isActive = Date.now() >= roleData.startTime && !isExpired;

  return (
    <div className="container dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>{roleData.name}</h1>
          <div className="role-status">
            <span className={`status-badge ${isActive ? 'active' : isExpired ? 'expired' : 'pending'}`}>
              {isActive ? 'Active' : isExpired ? 'Expired' : 'Pending'}
            </span>
            <span className="role-id">ID: {shortenAddress(roleData.id, 6)}</span>
          </div>
        </div>
        
        <MovingBorderButton
          borderRadius="1.5rem"
          onClick={() => navigate(`/sponsor/${roleId}`)}
          className="bg-slate-900 text-white border-slate-800"
          containerClassName="h-12 w-48"
        >
          Sponsor This Role
        </MovingBorderButton>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-label">Total Funded</div>
          <div className="stat-value">{(totalFunded / 1_000_000_000).toFixed(2)} SUI</div>
          <div className="stat-sublabel">{roleData.fundingHistory.length} transactions</div>
        </div>

        <div className="stat-card card">
          <div className="stat-label">Executed Payments</div>
          <div className="stat-value">{(totalExecuted / 1_000_000_000).toFixed(2)} SUI</div>
          <div className="stat-sublabel">{roleData.executedPayments.length} of {roleData.payments.length}</div>
        </div>

        <div className="stat-card card">
          <div className="stat-label">Remaining Balance</div>
          <div className="stat-value">{(roleData.remainingBalance / 1_000_000_000).toFixed(2)} SUI</div>
          <div className="stat-sublabel">Available funds</div>
        </div>

        <div className="stat-card card">
          <div className="stat-label">Expiry Time</div>
          <div className="stat-value">
            <Clock size={20} />
            {format(roleData.expiryTime, 'MMM d, yyyy')}
          </div>
          <div className="stat-sublabel">{format(roleData.expiryTime, 'HH:mm')}</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card sponsors-card">
          <h3>Sponsors</h3>
          
          {roleData.fundingHistory.length === 0 ? (
            <div className="empty-state">
              <p>No sponsors yet. Be the first to fund this role!</p>
            </div>
          ) : (
            <div className="sponsors-list">
              {(() => {
                // Group funding by sponsor
                const sponsorMap = new Map<string, { total: number; count: number }>();
                roleData.fundingHistory.forEach(fund => {
                  const existing = sponsorMap.get(fund.from) || { total: 0, count: 0 };
                  sponsorMap.set(fund.from, {
                    total: existing.total + fund.amount,
                    count: existing.count + 1,
                  });
                });

                // Convert to array and sort by total amount
                return Array.from(sponsorMap.entries())
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([address, data]) => (
                    <div key={address} className="sponsor-item">
                      <SponsorInfo address={address} />
                      <div className="sponsor-stats">
                        <div className="sponsor-amount">
                          {(data.total / 1_000_000_000).toFixed(4)} SUI
                        </div>
                        <div className="sponsor-count">
                          {data.count} contribution{data.count > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          )}
        </div>

        <div className="card timeline-card">
          <h3>Transaction Timeline</h3>
          
          {timelineEvents.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="timeline">
              {timelineEvents.map((event, index) => (
                <div key={index} className="timeline-item">
                  <div className={`timeline-icon ${event.type}`}>
                    {event.type === 'funding' ? (
                      <ArrowDownRight size={18} />
                    ) : (
                      <ArrowUpRight size={18} />
                    )}
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-type">
                        {event.type === 'funding' ? 'Received Funding' : 'Payment Executed'}
                      </span>
                      <span className="timeline-time">
                        {format(event.timestamp, 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>

                    {event.type === 'funding' ? (
                      <>
                        <div className="timeline-amount funding">
                          +{(event.data.amount / 1_000_000_000).toFixed(4)} SUI
                        </div>
                        <SponsorInfo address={event.data.from} />
                      </>
                    ) : (
                      <>
                        <div className="timeline-amount payment">
                          -{(event.data.amount / 1_000_000_000).toFixed(4)} SUI
                        </div>
                        <div className="timeline-recipient">
                          To: {shortenAddress(event.data.recipient)}
                        </div>
                      </>
                    )}

                    <a
                      href={`https://suiexplorer.com/txblock/${event.data.txDigest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="timeline-link"
                    >
                      View on Explorer <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card scheduled-payments-card">
          <h3>Scheduled Payments</h3>
          
          <div className="payments-list">
            {roleData.payments.map((payment, index) => {
              const isExecuted = roleData.executedPayments.some(
                ep => ep.recipient === payment.recipient && ep.amount === payment.amount
              );

              return (
                <div key={index} className={`payment-item ${isExecuted ? 'executed' : ''}`}>
                  <div className="payment-info">
                    <div className="payment-recipient">
                      {payment.ensName || shortenAddress(payment.recipient)}
                    </div>
                    <div className="payment-time">
                      {format(payment.scheduledTime, 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                  
                  <div className="payment-amount">
                    {(payment.amount / 1_000_000_000).toFixed(4)} SUI
                  </div>

                  {isExecuted && (
                    <span className="executed-badge">✓ Executed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
