import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Shield, ExternalLink } from 'lucide-react';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import { LetterSwapForward } from '@/components/ui/letter-swap';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <LetterSwapForward 
                label="Autonomous Payment Roles"
                staggerFrom="center"
                className="text-5xl font-bold"
              />
            </h1>
            <p className="hero-description">
              <LetterSwapForward 
                label="Create on-chain roles that automatically execute scheduled payments."
                staggerDuration={0.015}
              />
              <br />
              <LetterSwapForward 
                label="Simple, transparent, and powered by Sui blockchain."
                staggerDuration={0.015}
              />
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <MovingBorderButton
                borderRadius="1.75rem"
                onClick={() => navigate('/create')}
                className="bg-slate-900 text-white border-slate-800"
                containerClassName="h-14 w-48"
              >
                <span className="flex items-center gap-2">
                  Create Role <ArrowRight size={18} />
                </span>
              </MovingBorderButton>
              
              <MovingBorderButton
                borderRadius="1.75rem"
                onClick={() => navigate('/roles')}
                className="bg-slate-900 text-white border-slate-800"
                containerClassName="h-14 w-48"
                duration={3000}
              >
                View All Roles
              </MovingBorderButton>
            </div>
          </div>
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-check"><Check size={16} /></div>
            <h3>
              <LetterSwapForward label="ENS Integration" staggerDuration={0.02} />
            </h3>
            <p>
              <LetterSwapForward label="Use ENS names for recipients and sponsors" staggerDuration={0.015} />
            </p>
          </div>

          <div className="feature">
            <div className="feature-check"><Check size={16} /></div>
            <h3>
              <LetterSwapForward label="Scheduled Payments" staggerDuration={0.02} />
            </h3>
            <p>
              <LetterSwapForward label="Set up automatic payment execution" staggerDuration={0.015} />
            </p>
          </div>

          <div className="feature">
            <div className="feature-check"><Check size={16} /></div>
            <h3>
              <LetterSwapForward label="Cross-Chain" staggerDuration={0.02} />
            </h3>
            <p>
              <LetterSwapForward label="Bridge from Ethereum via LI.FI" staggerDuration={0.015} />
            </p>
          </div>

          <div className="feature">
            <div className="feature-check"><Check size={16} /></div>
            <h3>
              <LetterSwapForward label="Transparent" staggerDuration={0.02} />
            </h3>
            <p>
              <LetterSwapForward label="Full on-chain visibility and control" staggerDuration={0.015} />
            </p>
          </div>
        </div>

        {/* Trust & Transparency Section */}
        <div style={{
          marginTop: '4rem',
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 95, 70, 0.1) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <Shield size={48} style={{ color: '#10b981' }} />
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Complete On-Chain Transparency
            </h2>
          </div>
          
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            maxWidth: '800px',
            margin: '0 auto 2rem',
            lineHeight: '1.8',
          }}>
            Every transaction is permanently recorded on the Sui blockchain. From developer fees to payment executions,
            nothing is hidden or deleted. Full audit trail for complete trust.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#10b981',
                marginBottom: '0.5rem',
              }}>1%</div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}>Developer Fee</div>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                Transparent 1% fee (0.01 SUI) per role. Visible in every transaction.
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#10b981',
                marginBottom: '0.5rem',
              }}>100%</div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}>Transaction History</div>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                All funding and payments permanently stored. Nothing deleted.
              </div>
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#10b981',
                marginBottom: '0.5rem',
              }}>
                <ExternalLink size={40} />
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}>Blockchain Verified</div>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                Every transaction verifiable on Sui Explorer. Immutable proof.
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1.25rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '0.75rem',
          }}>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: '1.6',
            }}>
              <Shield size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: '#10b981' }} />
              <strong style={{ color: 'var(--text-primary)' }}>Trust Through Transparency:</strong> Every role tracks who funded it, 
              who received payments, and where leftover funds went. The developer fee is clearly shown in the transaction history. 
              All data is stored on-chain and can be independently verified. We don't hide anything.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
