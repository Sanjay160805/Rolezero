import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Wallet, ChevronDown, Zap, Calendar, DollarSign, Briefcase, Gift } from 'lucide-react';
import { WalletModal } from '@/components/WalletModal/WalletModal';
import './Header.css';

export const Header: React.FC = () => {
  const suiAccount = useCurrentAccount();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [templateDropdown, setTemplateDropdown] = useState(false);

  const getDisplayAddress = () => {
    if (suiAccount?.address) {
      return `${suiAccount.address.slice(0, 6)}...${suiAccount.address.slice(-4)}`;
    }
    return 'Connect Wallet';
  };

  const isConnected = !!suiAccount?.address;

  const handleTemplateSelect = (template: string) => {
    setTemplateDropdown(false);
    navigate(`/create?template=${template}`);
  };

  return (
    <>
      <header className="header">
        <div className="container header-container">
          <Link to="/" className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Sui Roles</span>
          </Link>

          <nav className="nav">
            <div 
              className="nav-dropdown"
              onMouseEnter={() => setTemplateDropdown(true)}
              onMouseLeave={() => setTemplateDropdown(false)}
              style={{position: 'relative'}}
            >
              <button className="nav-link nav-link-dropdown" style={{cursor: 'pointer', background: 'none', border: 'none', padding: 0}}>
                Create Role
                <ChevronDown size={16} style={{marginLeft: '0.25rem', opacity: 0.7}} />
              </button>
              
              {templateDropdown && (
                <div className="template-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.5rem',
                  background: 'var(--bg-glass)',
                  border: '2px solid var(--border-light)',
                  borderRadius: '20px',
                  padding: '1rem',
                  minWidth: '300px',
                  boxShadow: 'var(--shadow-xl)',
                  backdropFilter: 'blur(20px)',
                  zIndex: 1000,
                }}>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700'}}>
                    Quick Start Templates
                  </div>
                  
                  <button 
                    onClick={() => navigate('/create')}
                    className="template-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      width: '100%',
                      background: 'linear-gradient(135deg, rgba(56, 136, 255, 0.08), rgba(56, 136, 255, 0.05))',
                      border: '2px solid rgba(56, 136, 255, 0.2)',
                      borderRadius: '16px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      marginBottom: '0.75rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 136, 255, 0.15), rgba(56, 136, 255, 0.1))';
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 136, 255, 0.08), rgba(56, 136, 255, 0.05))';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Zap size={20} style={{color: 'var(--ens-primary)'}} />
                    <div style={{textAlign: 'left', flex: 1}}>
                      <div style={{fontWeight: 'bold', fontSize: '0.875rem'}}>Blank Role</div>
                      <div style={{fontSize: '0.75rem', opacity: 0.7}}>Start from scratch</div>
                    </div>
                  </button>

                  <div style={{height: '1px', background: 'var(--border-light)', margin: '0.75rem 0'}} />

                  <button 
                    onClick={() => handleTemplateSelect('salary')}
                    className="template-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      marginBottom: '0.25rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <DollarSign size={20} style={{color: '#10b981'}} />
                    <div style={{textAlign: 'left', flex: 1}}>
                      <div style={{fontWeight: 'bold', fontSize: '0.875rem'}}>Monthly Salary</div>
                      <div style={{fontSize: '0.75rem', opacity: 0.7}}>6 payments, 30-day intervals</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleTemplateSelect('subscription')}
                    className="template-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      marginBottom: '0.25rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <Calendar size={20} style={{color: '#3b82f6'}} />
                    <div style={{textAlign: 'left', flex: 1}}>
                      <div style={{fontWeight: 'bold', fontSize: '0.875rem'}}>Subscription</div>
                      <div style={{fontSize: '0.75rem', opacity: 0.7}}>12 payments, monthly recurring</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleTemplateSelect('freelance')}
                    className="template-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      marginBottom: '0.25rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <Briefcase size={20} style={{color: '#ec4899'}} />
                    <div style={{textAlign: 'left', flex: 1}}>
                      <div style={{fontWeight: 'bold', fontSize: '0.875rem'}}>Freelance Project</div>
                      <div style={{fontSize: '0.75rem', opacity: 0.7}}>3 milestones, 14-day intervals</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleTemplateSelect('allowance')}
                    className="template-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(234, 179, 8, 0.1)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <Gift size={20} style={{color: '#eab308'}} />
                    <div style={{textAlign: 'left', flex: 1}}>
                      <div style={{fontWeight: 'bold', fontSize: '0.875rem'}}>Weekly Allowance</div>
                      <div style={{fontSize: '0.75rem', opacity: 0.7}}>4 payments, 7-day intervals</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
            <Link to="/roles" className="nav-link">
              My Roles
            </Link>
          </nav>

          <div className="header-actions">
            <button
              onClick={() => setModalOpen(true)}
              className="btn btn-primary"
              style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
            >
              <Wallet size={18} />
              {isConnected && <span style={{color: 'var(--ens-secondary)', fontWeight: 'bold'}}>●</span>}
              {getDisplayAddress()}
            </button>
          </div>
        </div>
      </header>

      <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
