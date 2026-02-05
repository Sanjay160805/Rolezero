import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCreateRole } from '@/hooks/useCreateRole';
import { useResolveEnsName } from '@/hooks/useResolveEnsName';
import { DEVELOPER_FEE_PERCENT } from '@/config/sui';
import { showToast } from '@/components/Toast/Toast';
import { Plus, X, Loader2, CheckCircle } from 'lucide-react';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import './CreateRole.css';

interface PaymentInput {
  id: number;
  recipient: string;
  amount: string;
  scheduledTime: string;
  resolvedAddress?: string;
  ensName?: string;
}

export const CreateRole: React.FC = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { createRole } = useCreateRole();

  const [roleName, setRoleName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [leftoverRecipient, setLeftoverRecipient] = useState('');
  const [payments, setPayments] = useState<PaymentInput[]>([
    { id: 1, recipient: '', amount: '', scheduledTime: '' },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txResult, setTxResult] = useState<{ digest: string; roleId: string | null } | null>(null);

  // ENS resolution for leftover recipient
  const leftoverEns = useResolveEnsName(leftoverRecipient);

  // Handle leftover recipient ENS resolution
  const leftoverAddress = leftoverEns.isEnsName && leftoverEns.address
    ? leftoverEns.address
    : leftoverRecipient;

  const addPayment = () => {
    setPayments([
      ...payments,
      { id: Date.now(), recipient: '', amount: '', scheduledTime: '' },
    ]);
  };

  const removePayment = (id: number) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const updatePayment = (id: number, field: keyof PaymentInput, value: string) => {
    setPayments(payments.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // Resolve ENS names for each payment
  const PaymentRow: React.FC<{ payment: PaymentInput }> = ({ payment }) => {
    const ensResolution = useResolveEnsName(payment.recipient);

    useEffect(() => {
      if (ensResolution.isEnsName && ensResolution.address) {
        updatePayment(payment.id, 'resolvedAddress', ensResolution.address);
        updatePayment(payment.id, 'ensName', payment.recipient);
      }
    }, [ensResolution.address]);

    return (
      <div className="payment-row card">
        <div className="payment-fields">
          <div className="form-group">
            <label>Recipient (Address or ENS)</label>
            <input
              type="text"
              placeholder="0x... or alice.eth"
              value={payment.recipient}
              onChange={(e) => updatePayment(payment.id, 'recipient', e.target.value)}
            />
            {ensResolution.isLoading && (
              <div className="ens-status">
                <Loader2 className="spin" size={14} /> Resolving ENS...
              </div>
            )}
            {ensResolution.address && (
              <div className="ens-status success">
                <CheckCircle size={14} /> Resolved: {ensResolution.address.slice(0, 10)}...{ensResolution.address.slice(-8)}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Amount (SUI)</label>
            <input
              type="number"
              placeholder="100"
              step="0.01"
              value={payment.amount}
              onChange={(e) => updatePayment(payment.id, 'amount', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Scheduled Time</label>
            <input
              type="datetime-local"
              value={payment.scheduledTime}
              onChange={(e) => updatePayment(payment.id, 'scheduledTime', e.target.value)}
            />
          </div>
        </div>

        {payments.length > 1 && (
          <button
            type="button"
            className="btn-icon btn-remove"
            onClick={() => removePayment(payment.id)}
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      showToast({
        type: 'warning',
        title: 'Wallet Not Connected',
        message: 'Please connect your Sui wallet to create a role',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate leftover recipient address
      if (!leftoverAddress || leftoverAddress.length !== 66 || !leftoverAddress.startsWith('0x')) {
        showToast({
          type: 'error',
          title: 'Invalid Address',
          message: `Leftover recipient address "${leftoverAddress}" is invalid. Must be a valid Sui address (0x... 66 characters).`,
        });
        setIsSubmitting(false);
        return;
      }

      // Validate payment recipients
      for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];
        const addr = payment.resolvedAddress || payment.recipient;
        
        if (!addr || addr.length !== 66 || !addr.startsWith('0x')) {
          showToast({
            type: 'error',
            title: `Invalid Payment #${i + 1}`,
            message: `Recipient address "${addr}" is invalid. Must be a valid Sui address (0x... 66 characters).`,
          });
          setIsSubmitting(false);
          return;
        }

        if (!payment.amount || parseFloat(payment.amount) <= 0) {
          showToast({
            type: 'error',
            title: `Invalid Payment #${i + 1}`,
            message: 'Amount must be greater than 0',
          });
          setIsSubmitting(false);
          return;
        }

        if (!payment.scheduledTime) {
          showToast({
            type: 'error',
            title: `Invalid Payment #${i + 1}`,
            message: 'Scheduled time is required',
          });
          setIsSubmitting(false);
          return;
        }

        // Validate scheduled time is not in the past
        const scheduledDate = new Date(payment.scheduledTime).getTime();
        if (scheduledDate < Date.now()) {
          showToast({
            type: 'error',
            title: `Invalid Payment #${i + 1}`,
            message: 'Scheduled time cannot be in the past',
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Validate start time
      const startTimestamp = new Date(startTime).getTime();
      if (startTimestamp < Date.now()) {
        showToast({
          type: 'error',
          title: 'Invalid Start Time',
          message: 'Start time cannot be in the past',
        });
        setIsSubmitting(false);
        return;
      }

      // Validate expiry time is after start time
      const expiryTimestamp = new Date(expiryTime).getTime();
      if (expiryTimestamp <= startTimestamp) {
        showToast({
          type: 'error',
          title: 'Invalid Expiry Time',
          message: 'Expiry time must be after start time',
        });
        setIsSubmitting(false);
        return;
      }

      // Validate all payment times are between start and expiry
      for (let i = 0; i < payments.length; i++) {
        const scheduledTime = new Date(payments[i].scheduledTime).getTime();
        if (scheduledTime < startTimestamp) {
          showToast({
            type: 'error',
            title: `Invalid Payment #${i + 1}`,
            message: 'Payment is scheduled before role start time. All payments must be after start time.',
          });
          setIsSubmitting(false);
          return;
        }
        if (scheduledTime > expiryTimestamp) {
          showToast({
            type: 'error',
            title: `Invalid Payment #${i + 1}`,
            message: 'Payment is scheduled after role expiry time. All payments must be before expiry.',
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Helper function to convert SUI to MIST
      const suiToMist = (sui: string): bigint => {
        return BigInt(Math.floor(parseFloat(sui) * 1_000_000_000));
      };

      // Convert all inputs to proper format
      const processedPayments = payments.map(p => ({
        recipient: p.resolvedAddress || p.recipient,
        amount: suiToMist(p.amount),
        scheduledTime: BigInt(new Date(p.scheduledTime).getTime()),
        ensName: p.ensName,
      }));

      const result = await createRole({
        roleName,
        startTime: BigInt(new Date(startTime).getTime()),
        expiryTime: BigInt(new Date(expiryTime).getTime()),
        payments: processedPayments,
        leftoverRecipient: leftoverAddress,
      });

      setTxResult(result);
      
      showToast({
        type: 'success',
        title: 'Role Created Successfully!',
        message: `Your role "${roleName}" has been created and recorded on-chain with ${payments.length} scheduled payment${payments.length > 1 ? 's' : ''}.`,
        txDigest: result.digest,
        duration: 10000,
      });
    } catch (error) {
      console.error('❌ Error creating role:', error);
      showToast({
        type: 'error',
        title: 'Failed to Create Role',
        message: (error as Error).message || 'Transaction could not be completed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (txResult) {
    return (
      <div className="container create-role-page">
        <div className="card success-card">
          <CheckCircle size={64} className="text-rose" />
          <h2>Role Created Successfully!</h2>
          
          <div className="result-info">
            <div className="result-field">
              <label>Transaction Digest:</label>
              <code>{txResult.digest}</code>
            </div>
            
            {txResult.roleId && (
              <div className="result-field">
                <label>Role Object ID:</label>
                <code>{txResult.roleId}</code>
              </div>
            )}
          </div>

          <div className="button-group">
            <MovingBorderButton
              onClick={() => {
                if (txResult.roleId) {
                  navigate(`/role/${txResult.roleId}/live`);
                }
              }}
              borderRadius="0.75rem"
              className="btn btn-primary"
            >
              View Role Dashboard
            </MovingBorderButton>
            <MovingBorderButton
              onClick={() => window.location.reload()}
              borderRadius="0.75rem"
              className="btn btn-secondary"
            >
              Create Another Role
            </MovingBorderButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container create-role-page">
      <h1>Create New Role</h1>
      <p className="subtitle">Set up an autonomous payment role on Sui blockchain</p>

      <form onSubmit={handleSubmit} className="create-role-form">
        <div className="card">
          <h3>Role Details</h3>
          
          <div className="form-group">
            <label>Role Name *</label>
            <input
              type="text"
              placeholder="Marketing Campaign Manager"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Expiry Time *</label>
              <input
                type="datetime-local"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Leftover Recipient (Address or ENS) *</label>
            <input
              type="text"
              placeholder="0x... or treasury.eth"
              value={leftoverRecipient}
              onChange={(e) => setLeftoverRecipient(e.target.value)}
              required
            />
            {leftoverEns.isLoading && (
              <div className="ens-status">
                <Loader2 className="spin" size={14} /> Resolving ENS...
              </div>
            )}
            {leftoverEns.address && (
              <div className="ens-status success">
                <CheckCircle size={14} /> Resolved: {leftoverEns.address.slice(0, 10)}...{leftoverEns.address.slice(-8)}
              </div>
            )}
          </div>

          <div className="fee-info">
            <span>Developer Fee:</span>
            <span className="text-rose">{DEVELOPER_FEE_PERCENT * 100}%</span>
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <h3>Scheduled Payments</h3>
            <MovingBorderButton
              type="button"
              onClick={addPayment}
              borderRadius="0.75rem"
              className="btn btn-secondary"
            >
              <Plus size={18} /> Add Payment
            </MovingBorderButton>
          </div>

          <div className="payments-list">
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </div>
        </div>

        <MovingBorderButton
          type="submit"
          disabled={isSubmitting || !account}
          borderRadius="0.75rem"
          className="btn btn-primary btn-large"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="spin" /> Creating Role...
            </>
          ) : (
            'Create Role'
          )}
        </MovingBorderButton>

        {!account && (
          <p className="warning-text">⚠️ Please connect your Sui wallet to create a role</p>
        )}
      </form>
    </div>
  );
};