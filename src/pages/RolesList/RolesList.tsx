import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useAllRoles } from '@/hooks/useAllRoles';
import { formatDate } from '@/utils/date';
import { Loader2, Clock, Wallet, Users, Receipt } from 'lucide-react';
import { shortenAddress } from '@/utils/ens';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import { SkeletonRolesList } from '@/components/Skeleton/Skeleton';
import './RolesList.css';

export const RolesList: React.FC = () => {
  const navigate = useNavigate();
  const suiAccount = useCurrentAccount();
  const { data: allRoles, isLoading, error } = useAllRoles();

  // Show all roles (developer has full access)
  const roles = allRoles || [];

  if (isLoading) {
    return <SkeletonRolesList />;
  }

  if (error) {
    return (
      <div className="container roles-list-error">
        <h2>Error Loading Roles</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  const getStatusInfo = (startTime: number, expiryTime: number) => {
    const now = Date.now();
    if (now < startTime) {
      return { status: 'pending', label: 'Pending', color: 'var(--text-tertiary)' };
    }
    if (now > expiryTime) {
      return { status: 'expired', label: 'Expired', color: 'var(--secondary)' };
    }
    return { status: 'active', label: 'Active', color: 'var(--primary)' };
  };

  return (
    <div className="container roles-list-page">
      <div className="roles-list-header">
        <div>
          <h1>All Roles</h1>
          <p>View and manage all payment roles</p>
        </div>
        <MovingBorderButton
          onClick={() => navigate('/create')}
          borderRadius="0.75rem"
          className="btn btn-primary"
        >
          Create New Role
        </MovingBorderButton>
      </div>

      {!roles || roles.length === 0 ? (
        <div className="empty-state card">
          <h2>No Roles Found</h2>
          <p>There are no payment roles yet. Create the first one!</p>
          <MovingBorderButton
            onClick={() => navigate('/create')}
            borderRadius="0.75rem"
            className="btn btn-primary"
          >
            Create Role
          </MovingBorderButton>
        </div>
      ) : (
        <div className="roles-grid">
          {roles.map((role) => {
            const statusInfo = getStatusInfo(role.startTime, role.expiryTime);
            
            return (
              <div
                key={role.id}
                className="role-card card"
                onClick={() => navigate(`/role/${role.id}`)}
              >
                <div className="role-card-header">
                  <h3>{role.name}</h3>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                <div className="role-card-id">
                  ID: {shortenAddress(role.id, 8)}
                </div>

                <div className="role-card-stats">
                  <div className="stat-item">
                    <Wallet size={16} />
                    <div>
                      <div className="stat-value">
                        {(role.totalFunded / 1_000_000_000).toFixed(2)} SUI
                      </div>
                      <div className="stat-label">Total Funded</div>
                    </div>
                  </div>

                  <div className="stat-item">
                    <Users size={16} />
                    <div>
                      <div className="stat-value">{role.sponsorCount}</div>
                      <div className="stat-label">Sponsors</div>
                    </div>
                  </div>

                  <div className="stat-item">
                    <Receipt size={16} />
                    <div>
                      <div className="stat-value">{role.paymentCount}</div>
                      <div className="stat-label">Payments</div>
                    </div>
                  </div>
                </div>

                <div className="role-card-footer">
                  <div className="expiry-info">
                    <Clock size={14} />
                    <span>Expires {formatDate(role.expiryTime)}</span>
                  </div>
                  <div className="balance-info">
                    {(role.remainingBalance / 1_000_000_000).toFixed(2)} SUI remaining
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
