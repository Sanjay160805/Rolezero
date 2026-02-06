import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserStats } from '@/hooks/useUserStats';
import { shortenAddress } from '@/utils/ens';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import { LetterSwapForward } from '@/components/ui/letter-swap';
import { formatDate, formatDateTime } from '@/utils/date';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  CheckCircle,
  Clock,
  ExternalLink,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  BarChart3
} from 'lucide-react';
import './UserProfile.css';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { data: dashboardData, isLoading } = useUserStats();
  const [filter, setFilter] = useState<'all' | 'funding' | 'payment'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="container profile-page">
        <div className="loading-state">
          <Loader2 size={48} className="spin" />
          <LetterSwapForward label="Loading Platform Data..." />
        </div>
      </div>
    );
  }

  const filteredTransactions = dashboardData?.transactions.filter(tx => {
    // Filter by type
    if (filter !== 'all' && tx.type !== filter) return false;
    
    // Filter by search term (address, role name, or tx digest)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        tx.from.toLowerCase().includes(search) ||
        tx.to.toLowerCase().includes(search) ||
        tx.roleName.toLowerCase().includes(search) ||
        tx.digest.toLowerCase().includes(search)
      );
    }
    
    return true;
  }) || [];

  return (
    <div className="container profile-page">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1>
            <LetterSwapForward label="Global Transaction Dashboard" />
          </h1>
          <p className="dashboard-subtitle">
            <LetterSwapForward label="Real-time transaction monitoring across all users" />
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon users">
            <Users size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData?.totalUsers || 0}</div>
            <div className="stat-label">
              <LetterSwapForward label="Total Users" />
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon volume">
            <BarChart3 size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData?.totalVolume.toFixed(2) || '0.00'}</div>
            <div className="stat-label">
              <LetterSwapForward label="Total Volume (SUI)" />
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon funding">
            <TrendingUp size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData?.totalFunded.toFixed(2) || '0.00'}</div>
            <div className="stat-label">
              <LetterSwapForward label="Total Funded" />
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon payment">
            <TrendingDown size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData?.totalPaid.toFixed(2) || '0.00'}</div>
            <div className="stat-label">
              <LetterSwapForward label="Total Paid Out" />
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon pending">
            <Clock size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData?.pendingPayments || 0}</div>
            <div className="stat-label">
              <LetterSwapForward label="Pending Payments" />
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon activity">
            <Activity size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardData?.transactions.length || 0}</div>
            <div className="stat-label">
              <LetterSwapForward label="Total Transactions" />
            </div>
          </div>
        </div>
      </div>

      {/* Funding Requests Section */}
      {dashboardData?.fundingRequests && dashboardData.fundingRequests.length > 0 && (
        <div className="section card">
          <div className="section-header">
            <h2>
              <LetterSwapForward label="Roles Needing Funding" />
            </h2>
          </div>

          <div className="requests-list">
            {dashboardData.fundingRequests.map((request) => {
              const fundingProgress = (request.currentBalance / request.requiredAmount) * 100;
              const shortfall = request.requiredAmount - request.currentBalance;

              return (
                <div key={request.roleId} className="request-item">
                  <div className="request-header">
                    <div className="request-info">
                      <h3>{request.roleName}</h3>
                      <span className="request-status">
                        <AlertCircle size={14} />
                        Needs {shortfall.toFixed(2)} SUI
                      </span>
                    </div>
                    <MovingBorderButton
                      onClick={() => navigate(`/sponsor/${request.roleId}`)}
                      borderRadius="0.5rem"
                      className="btn btn-primary btn-small"
                    >
                      Fund Now
                    </MovingBorderButton>
                  </div>

                  <div className="funding-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                      />
                    </div>
                    <div className="progress-labels">
                      <span>{request.currentBalance.toFixed(2)} SUI</span>
                      <span>{request.requiredAmount.toFixed(2)} SUI</span>
                    </div>
                  </div>

                  <div className="request-footer">
                    <span>Expires: {formatDate(request.expiryTime)}</span>
                    <span 
                      className="view-link"
                      onClick={() => navigate(`/role/${request.roleId}`)}
                    >
                      <ExternalLink size={14} /> View Role
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Obligations Section */}
      {dashboardData?.paymentObligations && dashboardData.paymentObligations.length > 0 && (
        <div className="section card">
          <div className="section-header">
            <h2>
              <LetterSwapForward label="Incoming Payments" />
            </h2>
          </div>

          <div className="obligations-list">
            {dashboardData.paymentObligations
              .sort((a, b) => a.scheduledTime - b.scheduledTime)
              .map((obligation, index) => {
                const isPast = obligation.scheduledTime < Date.now();
                const isUpcoming = !obligation.isPaid && obligation.scheduledTime > Date.now();
                return (
                  <div key={`${obligation.roleId}-${index}`} className="obligation-item">
                    <div className="obligation-info">
                      <div className="obligation-header">
                        <TrendingDown size={20} className="obligation-icon" />
                        <div>
                          <h4>{obligation.roleName}</h4>
                          <span className="obligation-date">
                            {formatDateTime(obligation.scheduledTime)}
                          </span>
                        </div>
                      </div>
                      <span className={`obligation-status ${obligation.isPaid ? 'paid' : isPast ? 'overdue' : 'pending'}`}>
                        {obligation.isPaid ? (
                          <>
                            <CheckCircle size={14} /> Paid
                          </>
                        ) : isPast ? (
                          <>
                            <AlertCircle size={14} /> Overdue
                          </>
                        ) : (
                          <>
                            <Clock size={14} /> Pending
                          </>
                        )}
                      </span>
                    </div>
                    <div className="obligation-amount">
                      <span className="amount">{obligation.amount.toFixed(2)} SUI</span>
                      <MovingBorderButton
                        onClick={() => navigate(`/role/${obligation.roleId}`)}
                        borderRadius="0.5rem"
                        className="btn btn-secondary btn-small"
                      >
                        View
                      </MovingBorderButton>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="section card">
        <div className="section-header">
          <h2>
            <LetterSwapForward label="All Platform Transactions" />
          </h2>
          <div className="header-controls">
            <input
              type="text"
              placeholder="Search address, role, or tx..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="filter-buttons">
              <MovingBorderButton
                onClick={() => setFilter('all')}
                borderRadius="0.5rem"
                className={`btn btn-small ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                All
              </MovingBorderButton>
              <MovingBorderButton
                onClick={() => setFilter('funding')}
                borderRadius="0.5rem"
                className={`btn btn-small ${filter === 'funding' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Funding
              </MovingBorderButton>
              <MovingBorderButton
                onClick={() => setFilter('payment')}
                borderRadius="0.5rem"
                className={`btn btn-small ${filter === 'payment' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Payments
              </MovingBorderButton>
            </div>
          </div>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="transactions-list">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  {transaction.type === 'funding' ? (
                    <ArrowUpRight size={24} className="icon-funding" />
                  ) : (
                    <ArrowDownLeft size={24} className="icon-payment" />
                  )}
                </div>

                <div className="transaction-info">
                  <div className="transaction-header">
                    <h4>{transaction.roleName}</h4>
                    <span className={`transaction-type ${transaction.type}`}>
                      {transaction.type === 'funding' ? 'Funding' : 'Payment'}
                    </span>
                  </div>
                  <div className="transaction-details">
                    <span className="transaction-date">
                      {formatDateTime(transaction.timestamp)}
                    </span>
                  </div>
                  <div className="transaction-addresses">
                    <span className="address-label">From:</span>
                    <span className="address-value">{shortenAddress(transaction.from)}</span>
                    <span className="address-arrow">→</span>
                    <span className="address-label">To:</span>
                    <span className="address-value">{shortenAddress(transaction.to)}</span>
                  </div>
                  <div className="transaction-digest-row">
                    <span className="digest-label">Tx:</span>
                    <span className="transaction-digest">{shortenAddress(transaction.digest)}</span>
                  </div>
                </div>

                <div className="transaction-amount">
                  <span className={`amount ${transaction.type}`}>
                    {transaction.amount.toFixed(2)} SUI
                  </span>
                  <MovingBorderButton
                    onClick={() => navigate(`/role/${transaction.roleId}`)}
                    borderRadius="0.5rem"
                    className="btn btn-secondary btn-small"
                  >
                    View Role
                  </MovingBorderButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-small">
            <p>No {filter !== 'all' ? filter : ''} transactions found</p>
            {(filter !== 'all' || searchTerm) && (
              <MovingBorderButton
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                borderRadius="0.75rem"
                className="btn btn-secondary"
              >
                Clear Filters
              </MovingBorderButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

