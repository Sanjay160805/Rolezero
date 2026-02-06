import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Shield, Zap, Lock, Coins } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground/AnimatedBackground';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to roles page with search query
      navigate(`/roles?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="home-page">
      <AnimatedBackground />
      <div className="container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Your Web3 Payment System
            </h1>
            <p className="hero-description">
              Create autonomous payment roles on Sui blockchain. Schedule payments, integrate ENS names, and manage everything on-chain with full transparency.
            </p>
            
            {/* ENS-Style Search Bar */}
            <form onSubmit={handleSearch} className="search-wrapper">
              <input
                type="text"
                className="search-input-hero"
                placeholder="Search for a role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Info Banner */}
            <div className="info-banner">
              🎉 Powered by Sui • ENS • LI.FI Bridge
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
              <button
                onClick={() => navigate('/create')}
                className="btn btn-primary"
              >
                <span className="flex items-center gap-2">
                  Create Role <ArrowRight size={18} />
                </span>
              </button>
              
              <button
                onClick={() => navigate('/roles')}
                className="btn btn-secondary"
              >
                View All Roles
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features">
          <div className="feature">
            <div className="feature-check"><Check size={20} /></div>
            <h3>ENS Integration</h3>
            <p>
              Use ENS names for recipients and sponsors. Simplified web3 identity management.
            </p>
          </div>

          <div className="feature">
            <div className="feature-check"><Zap size={20} /></div>
            <h3>Scheduled Payments</h3>
            <p>
              Automated payment execution with configurable intervals. Set it and forget it.
            </p>
          </div>

          <div className="feature">
            <div className="feature-check"><Coins size={20} /></div>
            <h3>Cross-Chain Bridge</h3>
            <p>
              Bridge funds from Ethereum to Sui using LI.FI for seamless multi-chain operations.
            </p>
          </div>

          <div className="feature">
            <div className="feature-check"><Lock size={20} /></div>
            <h3>100% On-Chain</h3>
            <p>
              Full transparency with immutable blockchain records. Every transaction is verifiable.
            </p>
          </div>
        </div>

        {/* Transparency Section - Redesigned with ENS Colors */}
        <div style={{
          marginTop: '6rem',
          padding: '3rem 2.5rem',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(56, 136, 255, 0.2)',
          borderRadius: '32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <Shield size={48} style={{ color: 'var(--ens-primary)' }} />
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Complete Transparency
            </h2>
          </div>
          
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            maxWidth: '800px',
            margin: '0 auto 3rem',
            lineHeight: '1.8',
          }}>
            Every transaction is permanently recorded on the Sui blockchain. From developer fees to payment executions,
            nothing is hidden or deleted. Full audit trail for complete trust.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginTop: '2rem',
          }}>
            <div style={{
              padding: '2rem',
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '900',
                background: 'linear-gradient(135deg, var(--ens-primary), var(--ens-primary-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.75rem',
              }}>1%</div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
              }}>Developer Fee</div>
              <div style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}>
                Transparent 1% fee (0.01 SUI) per role. Visible in every transaction.
              </div>
            </div>

            <div style={{
              padding: '2rem',
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '900',
                background: 'linear-gradient(135deg, var(--ens-primary), var(--ens-primary-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.75rem',
              }}>100%</div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
              }}>Transaction History</div>
              <div style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}>
                All funding and payments permanently stored. Nothing deleted.
              </div>
            </div>

            <div style={{
              padding: '2rem',
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: '900',
                color: 'var(--ens-primary)',
                marginBottom: '0.75rem',
              }}>
                <Shield size={48} />
              </div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
              }}>Blockchain Verified</div>
              <div style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}>
                Every transaction verifiable on Sui Explorer. Immutable proof.
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '3rem',
            padding: '1.5rem 2rem',
            background: 'linear-gradient(135deg, rgba(56, 136, 255, 0.05), rgba(56, 136, 255, 0.02))',
            border: '2px solid rgba(56, 136, 255, 0.15)',
            borderRadius: '20px',
          }}>
            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: '1.7',
            }}>
              <Shield size={18} style={{ verticalAlign: 'middle', marginRight: '0.75rem', color: 'var(--ens-primary)' }} />
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
