import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useFundRole } from '@/hooks/useFundRole';
import { showToast } from '@/components/Toast/Toast';
import { Loader2, CheckCircle, Wallet, ArrowLeftRight, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import './SponsorPayment.css';

export const SponsorPayment: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { fundRole } = useFundRole();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [waitingForWallet, setWaitingForWallet] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAmount, setSuccessAmount] = useState('');
  const [hasPaidBefore, setHasPaidBefore] = useState(false);

  // Check if sponsor has already paid for this role
  React.useEffect(() => {
    if (account && roleId) {
      const paymentKey = `sponsor-payment-${roleId}-${account.address}`;
      const hasCompleted = localStorage.getItem(paymentKey);
      if (hasCompleted) {
        setHasPaidBefore(true);
      }
    }
  }, [account, roleId]);

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
      setSuccessAmount(amount);
      setShowSuccessModal(true); // Show modal
      
      // Store payment completion in localStorage to prevent re-showing payment page
      if (account) {
        const paymentKey = `sponsor-payment-${roleId}-${account.address}`;
        const paymentData = JSON.stringify({
          timestamp: Date.now(),
          amount: amountNum,
          txDigest: result.digest,
        });
        localStorage.setItem(paymentKey, paymentData);
        console.log('💾 Payment recorded for sponsor:', account.address);
      }
      
      // Invalidate all role-related queries to update the developer's dashboard
      console.log('🔄 Invalidating queries to update dashboard...');
      await queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      await queryClient.invalidateQueries({ queryKey: ['role-live-transactions', roleId] });
      await queryClient.invalidateQueries({ queryKey: ['allRoles'] });
      // Refetch immediately to ensure fresh data (this will trigger real-time update on developer's dashboard)
      await queryClient.refetchQueries({ queryKey: ['role', roleId] });
      await queryClient.refetchQueries({ queryKey: ['role-live-transactions', roleId] });
      console.log('✅ Dashboard data updated! Developer will see this transaction in real-time.');
      
      setAmount(''); // Clear input
      showToast({
        type: 'success',
        title: 'Payment Successful!',
        message: `You funded ${amount} SUI to this role. Transaction confirmed on-chain.`,
        txDigest: result.digest,
        duration: 10000,
      });

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
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

  // Success Modal
  const SuccessModal = showSuccessModal ? (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.3s ease-in'
      }}
      onClick={() => setShowSuccessModal(false)}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          border: '2px solid #10b981',
          borderRadius: '1.5rem',
          padding: '3rem',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Large Success Checkmark */}
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 2rem',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)'
        }}>
          <CheckCircle size={80} style={{color: 'white'}} strokeWidth={3} />
        </div>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#10b981',
          marginBottom: '1rem'
        }}>
          Payment Successful! ✅
        </h2>

        <p style={{
          fontSize: '1.25rem',
          marginBottom: '0.5rem',
          color: 'var(--text-primary)'
        }}>
          <strong>{successAmount} SUI</strong> funded successfully
        </p>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem'
        }}>
          Transaction confirmed on Sui blockchain<br />
          <span style={{color: '#10b981', fontWeight: 600}}>Redirecting to home in 3 seconds...</span>
        </p>

        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <p style={{fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem'}}>
            Transaction ID:
          </p>
          <code style={{
            fontSize: '0.75rem',
            wordBreak: 'break-all',
            color: '#10b981'
          }}>
            {txSuccess}
          </code>
        </div>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          padding: '1rem',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          ✨ Thank you for your support! The developer will see your contribution in their dashboard.
        </p>

        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
          <a
            href={`https://suiscan.xyz/testnet/tx/${txSuccess}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: '2px solid #10b981',
              borderRadius: '0.75rem',
              color: '#10b981',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <ExternalLink size={16} />
            View on Explorer
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  ) : null;

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

  // REQUIRE WALLET CONNECTION for sponsor page to identify sponsor
  if (!account && !txSuccess) {
    return (
      <div className="container sponsor-page">
        <div style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
          border: '2px solid rgba(251, 191, 36, 0.5)',
          borderRadius: '1.5rem',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 1.5rem',
            background: 'rgba(251, 191, 36, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Wallet size={60} style={{color: '#fbbf24'}} />
          </div>
          
          <h1 style={{fontSize: '2rem', marginBottom: '1rem', color: '#fbbf24', fontWeight: 'bold'}}>
            Connect Your Wallet First
          </h1>
          
          <p style={{fontSize: '1.125rem', marginBottom: '0.5rem'}}>
            Please connect your Sui wallet to sponsor this role.
          </p>
          
          <p style={{fontSize: '0.875rem', opacity: 0.8, marginBottom: '2rem'}}>
            Click "Connect Wallet" in the top-right corner to get started. This helps us identify you as a sponsor and track your contributions.
          </p>
          
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                border: 'none',
                borderRadius: '0.75rem',
                color: '#1e293b',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container sponsor-page">
      {SuccessModal}
      
      {/* Thank You Message for Sponsors Who Already Paid */}
      {hasPaidBefore && !showSuccessModal && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '1.5rem',
          padding: '3rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)'
          }}>
            <CheckCircle size={60} style={{color: 'white'}} strokeWidth={3} />
          </div>
          
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#10b981',
            marginBottom: '1rem'
          }}>
            Thank You for Your Support! 🎉
          </h2>
          
          <p style={{
            fontSize: '1.125rem',
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}>
            You've already contributed to this role.
          </p>
          
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem'
          }}>
            Your payment has been recorded and the developer has been notified. You can add more funds below if you'd like to contribute further.
          </p>
          
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            Return Home
          </button>
        </div>
      )}
      
      <div className="page-header">
        <MovingBorderButton
          onClick={() => navigate('/')}
          borderRadius="0.75rem"
          className="btn btn-secondary"
        >
          ← Back to Home
        </MovingBorderButton>
      </div>

      {SuccessBanner}

      <h1>Sponsor Role Payment</h1>
      <p className="subtitle">Support this role with your contribution</p>

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

      <div className="card info-box" style={{marginTop: '2rem'}}>
        <h4>💡 Sponsor Information</h4>
        <p>You are sponsoring a payroll role. Your contribution will help fund scheduled payments.</p>
        <p>After funding, you can close this page. The role owner will manage the payment execution.</p>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-secondary"
          style={{marginTop: '1rem'}}
        >
          <ArrowLeft size={18} /> Back to Home
        </button>
      </div>
    </div>
  );
};
