import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { QRCodeSVG } from 'qrcode.react';
import { useFundRole } from '@/hooks/useFundRole';
import { useRoleData } from '@/hooks/useRoleData';
import { showToast } from '@/components/Toast/Toast';
import { Loader2, CheckCircle, Wallet, ArrowLeftRight, ExternalLink } from 'lucide-react';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import './SponsorPayment.css';

export const SponsorPayment: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { fundRole } = useFundRole();
  const { data: roleData } = useRoleData(roleId);

  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [waitingForWallet, setWaitingForWallet] = useState(false);

  // Auto-execute payment when wallet connects
  React.useEffect(() => {
    if (account && pendingPayment && amount) {
      const amountNum = parseFloat(amount);
      if (!isNaN(amountNum) && amountNum > 0) {
        console.log('✅ Wallet connected! Auto-executing payment...');
        setPendingPayment(false);
        setWaitingForWallet(false);
        executePayment();
      }
    }
  }, [account, pendingPayment]);

  const executePayment = async () => {
    if (!roleId) return;
    
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid positive number.',
      });
      return;
    }

    // Validate reasonable amount (prevent accidental overpayment)
    if (amountNum > 100000) {
      const confirm = window.confirm(`⚠️ WARNING: You're about to send ${amountNum.toLocaleString()} SUI!\n\nThis is a very large amount. Are you sure?`);
      if (!confirm) return;
    }
    
    setIsSubmitting(true);
    console.log('💰 Executing payment:', amountNum, 'SUI');

    try {
      const amountMist = Math.floor(amountNum * 1_000_000_000);
      const result = await fundRole(roleId, amountMist);
      console.log('✅ Payment successful!', result.digest);
      setTxSuccess(result.digest);
      showToast({
        type: 'success',
        title: 'Payment Successful!',
        message: `You funded ${amount} SUI to this role. Transaction confirmed on-chain.`,
        txDigest: result.digest,
        duration: 10000,
      });
    } catch (error) {
      console.error('❌ Payment failed:', error);
      showToast({
        type: 'error',
        title: 'Payment Failed',
        message: (error as Error).message || 'Transaction could not be completed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuiPayment = async () => {
    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0 || isNaN(amountNum)) {
      showToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount greater than 0',
      });
      return;
    }

    // Validate reasonable amount
    if (amountNum > 100000) {
      const confirm = window.confirm(`⚠️ WARNING: You're about to send ${amountNum.toLocaleString()} SUI!\n\nThis is a very large amount. Are you sure?`);
      if (!confirm) return;
    }

    if (!account) {
      // Wallet not connected - set flag to auto-execute after connection
      console.log('⏳ Wallet not connected. Please connect your wallet...');
      setPendingPayment(true);
      setWaitingForWallet(true);
      showToast({
        type: 'info',
        title: 'Connect Wallet',
        message: 'Please connect your Sui wallet. Payment will process automatically after connection.',
        duration: 8000,
      });
      return;
    }

    // Wallet already connected - execute immediately
    await executePayment();
  };

  // Success message shown, but don't block the page
  const SuccessBanner = txSuccess ? (
    <div style={{
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
      border: '2px solid rgba(16, 185, 129, 0.5)',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <CheckCircle size={32} style={{color: '#10b981', flexShrink: 0}} />
      <div style={{flex: 1}}>
        <h3 style={{color: '#10b981', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold'}}>
          ✅ Payment Successful!
        </h3>
        <p style={{marginBottom: '0.5rem'}}>Transaction: <code>{txSuccess}</code></p>
        <p style={{fontSize: '0.875rem', opacity: 0.9}}>Funds have been added to the role. You can add more funds below or view the dashboard.</p>
      </div>
      <div style={{display: 'flex', gap: '0.5rem', flexDirection: 'column'}}>
        <MovingBorderButton
          onClick={() => navigate(`/role/${roleId}/live`)}
          borderRadius="0.75rem"
          className="btn btn-primary"
          containerClassName="h-10"
        >
          View Dashboard
        </MovingBorderButton>
        <button
          onClick={() => {
            setTxSuccess(null);
            setAmount('');
          }}
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Fund Again
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="container sponsor-page">
      <div className="page-header">
        <MovingBorderButton
          onClick={() => navigate(`/role/${roleId}/live`)}
          borderRadius="0.75rem"
          className="btn btn-secondary"
        >
          ← Back to Dashboard
        </MovingBorderButton>
      </div>

      {SuccessBanner}

      <h1>Sponsor Role Payment</h1>
      {roleData && (
        <p className="subtitle">Support "{roleData.name}" with your contribution</p>
      )}

      <div className="sponsor-grid">
        {/* QR Code Section */}
        <div className="card qr-section">
          <h3>Scan to Pay</h3>
          <p className="section-description">
            Scan this QR code with your Sui wallet to send funds directly
          </p>

          <div className="qr-container">
            {roleId && (
              <QRCodeSVG
                value={roleId}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="var(--text-primary)"
                bgColor="transparent"
              />
            )}
          </div>

          <div className="role-address">
            <label>Role Address:</label>
            <code>{roleId}</code>
          </div>
        </div>

        {/* Sui Wallet Payment */}
        <div className="card payment-section">
          <div className="payment-header">
            <Wallet size={24} />
            <h3>Pay from Sui Wallet</h3>
          </div>
          
          <p className="section-description">
            {!account ? (
              <span style={{color: '#fbbf24', fontWeight: 500}}>
                💡 Click "Connect & Pay" to connect wallet and send payment in one flow!
              </span>
            ) : (
              'Connected! Enter amount and click Pay to send funds'
            )}
          </p>

          <div className="payment-form">
            <div className="form-group">
              <label>Amount (SUI)</label>
              <input
                type="number"
                placeholder="100"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <MovingBorderButton
              onClick={handleSuiPayment}
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))}
              borderRadius="0.75rem"
              className="btn btn-primary btn-large"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="spin" /> Processing Payment...
                </>
              ) : waitingForWallet ? (
                <>
                  <Loader2 className="spin" /> Waiting for Wallet...
                </>
              ) : !account ? (
                <>
                  <Wallet size={18} /> Connect & Pay {amount && `${amount} SUI`}
                </>
              ) : (
                <>
                  <Wallet size={18} /> Pay {amount && `${amount} SUI`}
                </>
              )}
            </MovingBorderButton>

            {!account && (
              <p className="warning-text">
                ⚠️ Please connect your Sui wallet to make a payment
              </p>
            )}
          </div>
        </div>

        {/* Cross-chain Payment */}
        <div className="card payment-section cross-chain-section">
          <div className="payment-header">
            <ArrowLeftRight size={24} />
            <h3>Pay from Ethereum</h3>
          </div>
          
          <p className="section-description">
            Bridge tokens from Ethereum to Sui using LI.FI Jumper
          </p>

          <a
            href={`https://jumper.exchange/?fromChain=1&toChain=101&toToken=SUI&toAddress=${roleId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-large"
          >
            <ExternalLink size={18} />
            Open LI.FI Bridge
          </a>

          <div className="info-box">
            <strong>How it works:</strong>
            <ol>
              <li>Click the button above to open LI.FI Jumper</li>
              <li>Connect your Ethereum wallet</li>
              <li>Select the token you want to bridge</li>
              <li>LI.FI will bridge and convert to SUI</li>
              <li>Funds will arrive at the Role address</li>
            </ol>
          </div>
        </div>
      </div>

      {roleData && (
        <div className="card role-summary">
          <h3>Role Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Total Funded:</span>
              <span className="value">
                {(roleData.totalFunded / 1_000_000_000).toFixed(2)} SUI
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Remaining Balance:</span>
              <span className="value">
                {(roleData.remainingBalance / 1_000_000_000).toFixed(2)} SUI
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Scheduled Payments:</span>
              <span className="value">{roleData.payments.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
