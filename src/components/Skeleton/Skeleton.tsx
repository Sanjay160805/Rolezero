import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px',
  borderRadius = '4px',
  className = '' 
}) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <Skeleton width="40%" height="24px" />
        <Skeleton width="80px" height="24px" borderRadius="12px" />
      </div>
      <div className="skeleton-card-body">
        <Skeleton width="100%" height="16px" />
        <Skeleton width="90%" height="16px" />
        <Skeleton width="70%" height="16px" />
      </div>
    </div>
  );
};

export const SkeletonPayment: React.FC = () => {
  return (
    <div className="skeleton-payment">
      <div className="skeleton-payment-left">
        <Skeleton width="40px" height="40px" borderRadius="50%" />
        <div className="skeleton-payment-info">
          <Skeleton width="150px" height="16px" />
          <Skeleton width="100px" height="14px" />
        </div>
      </div>
      <div className="skeleton-payment-right">
        <Skeleton width="80px" height="20px" />
        <Skeleton width="60px" height="16px" />
      </div>
    </div>
  );
};

export const SkeletonTransaction: React.FC = () => {
  return (
    <div className="skeleton-transaction">
      <div className="skeleton-tx-left">
        <Skeleton width="60px" height="24px" borderRadius="12px" />
        <div className="skeleton-tx-info">
          <Skeleton width="200px" height="14px" />
          <Skeleton width="150px" height="14px" />
          <Skeleton width="120px" height="14px" />
        </div>
      </div>
      <Skeleton width="16px" height="16px" borderRadius="50%" />
    </div>
  );
};

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="skeleton-dashboard">
      {/* Stats Cards */}
      <div className="skeleton-stats-grid">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      
      {/* Payments Section */}
      <div className="skeleton-section">
        <Skeleton width="200px" height="28px" className="mb-4" />
        <SkeletonPayment />
        <SkeletonPayment />
        <SkeletonPayment />
      </div>
      
      {/* Transactions Section */}
      <div className="skeleton-section">
        <Skeleton width="180px" height="28px" className="mb-4" />
        <SkeletonTransaction />
        <SkeletonTransaction />
      </div>
    </div>
  );
};

export const SkeletonRolesList: React.FC = () => {
  return (
    <div className="skeleton-roles-list">
      <div className="skeleton-roles-grid">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};
