import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Wallet } from 'lucide-react';
import { WalletModal } from '@/components/WalletModal/WalletModal';
import { LetterSwapForward } from '@/components/ui/letter-swap';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import './Header.css';

export const Header: React.FC = () => {
  const { address } = useAccount(); // Removed isConnected - not used
  const [modalOpen, setModalOpen] = useState(false);

  const getDisplayAddress = () => {
    if (address) return `${address.slice(0, 6)}...${address.slice(-4)}`;
    return 'Connect Wallet';
  };

  return (
    <>
      <header className="header">
        <div className="container header-container">
          <Link to="/" className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">
              <LetterSwapForward label="Sui Roles" staggerDuration={0.02} />
            </span>
          </Link>

          <nav className="nav">
            <Link to="/create" className="nav-link">
              <LetterSwapForward label="Create Role" staggerDuration={0.02} />
            </Link>
            <Link to="/roles" className="nav-link">
              <LetterSwapForward label="My Roles" staggerDuration={0.02} />
            </Link>
          </nav>

          <div className="header-actions">
            <MovingBorderButton
              borderRadius="1.5rem"
              onClick={() => setModalOpen(true)}
              className="bg-slate-900 text-white border-slate-800"
              containerClassName="h-12 w-auto"
            >
              <span className="flex items-center gap-2 px-4">
                <Wallet size={18} />
                {getDisplayAddress()}
              </span>
            </MovingBorderButton>
          </div>
        </div>
      </header>

      <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
