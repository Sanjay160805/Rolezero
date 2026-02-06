import React from 'react';
import { useConnect, useAccount } from 'wagmi';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { ConnectButton as SuiConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { X, Wallet, Info } from 'lucide-react';
import './WalletModal.css';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connect, connectors } = useConnect();
  const { isConnected: isEvmConnected } = useAccount();
  const { publicKey: solanaPublicKey, connect: connectSolana, wallets: solanaWallets } = useSolanaWallet();
  const suiAccount = useCurrentAccount();

  if (!isOpen) return null;

  const handleMetaMaskConnect = async () => {
    try {
      const win = window as any;
      const provider = win.ethereum?.providers?.find((p: any) => p.isMetaMask && !p.isPhantom) || win.ethereum;
      if (!provider) {
        window.open('https://metamask.io/download/', '_blank');
        return;
      }
      const connector = connectors.find((c: any) => c.id === 'injected' || c.id === 'metaMask');
      if (connector) {
        await connect({ connector });
        onClose();
      }
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
    }
  };

  const handlePhantomConnect = async () => {
    try {
      const phantomWallet = solanaWallets.find(w => w.adapter.name === 'Phantom');
      if (!phantomWallet) {
        window.open('https://phantom.app/', '_blank');
        return;
      }
      await connectSolana();
      onClose();
    } catch (error) {
      console.error('Failed to connect Phantom:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ens-wallet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ens-modal-header">
          <h2>Connect a Wallet</h2>
          <button className="ens-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="ens-modal-content">
          {/* Left Side - Wallet List */}
          <div className="ens-wallet-list">
            {/* Ethereum (EVM) */}
            <div className="ens-section-label">Ethereum</div>
            
            <button 
              className="ens-wallet-item" 
              onClick={handleMetaMaskConnect}
              disabled={isEvmConnected}
            >
              <div className="ens-wallet-icon">
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                  <path d="M32.958 3.958l-11.25 8.334 2.083-4.959 9.167-3.375z" fill="#E17726"/>
                  <path d="M7.042 3.958l11.166 8.417-1.958-5.042-9.208-3.375z" fill="#E27625"/>
                  <path d="M28.125 27.083l-3 4.584 6.417 1.791 1.833-6.291-5.25-.084z" fill="#E27625"/>
                  <path d="M31.583 16.375l-6.333-1.875 1.917 2.708-2.709 5.292 3.584-.042h5.333l-1.792-6.083z" fill="#CC6228"/>
                  <path d="M20.875 21.083l.417-7.25 1.875-5.125h-8.334l1.875 5.125.417 7.25.167 2.167.042 5h1.5l.041-5 .167-2.167z" fill="#F5841F"/>
                </svg>
              </div>
              <span className="ens-wallet-name">MetaMask</span>
              {isEvmConnected && <span className="ens-connected-badge">Connected</span>}
            </button>

            {/* Solana */}
            <div className="ens-section-label">Solana</div>
            
            <button 
              className="ens-wallet-item"
              onClick={handlePhantomConnect}
              disabled={!!solanaPublicKey}
            >
              <div className="ens-wallet-icon">
                <svg width="28" height="28" viewBox="0 0 128 128" fill="none">
                  <path d="M105.025 3.53613C92.9121 -1.11191 78.4844 -0.888672 64 7.77832C49.5156 -0.888672 35.0879 -1.11191 22.9746 3.53613C8.32812 9.30566 0 22.6416 0 42.7041V85.6924C0 97.6934 9.73438 107.428 21.7354 107.428C33.7363 107.428 43.4707 97.6934 43.4707 85.6924V74.4248C43.4707 72.9092 44.7012 71.6787 46.2168 71.6787C47.7324 71.6787 48.9629 72.9092 48.9629 74.4248V85.6924C48.9629 97.6934 58.6973 107.428 70.6982 107.428C82.6992 107.428 92.4336 97.6934 92.4336 85.6924V42.7041C92.4336 38.5586 89.3135 35.1504 85.168 34.7793C84.7969 34.7793 84.4258 34.7793 84.0547 34.7793C75.1426 34.7793 67.9492 27.5859 67.9492 18.6738C67.9492 16.7871 66.3457 15.1836 64.459 15.1836C62.5723 15.1836 60.9688 16.7871 60.9688 18.6738C60.9688 27.5859 53.7754 34.7793 44.8633 34.7793C44.4922 34.7793 44.1211 34.7793 43.75 34.7793C39.6045 35.1504 36.4844 38.5586 36.4844 42.7041V85.6924C36.4844 94.0469 30.0898 100.812 21.7354 100.812C13.3809 100.812 6.98633 94.4258 6.98633 85.6924V42.7041C6.98633 23.0176 15.2686 12.1113 27.8301 7.40723C41.5723 2.33203 57.2656 9.17773 64 15.5547C70.7344 9.17773 86.4277 2.33203 100.17 7.40723C112.731 12.1113 121.014 23.0176 121.014 42.7041V85.6924C121.014 97.6934 111.279 107.428 99.2783 107.428C87.2773 107.428 77.543 97.6934 77.543 85.6924V74.4248C77.543 72.9092 78.7734 71.6787 80.2891 71.6787C81.8047 71.6787 83.0352 72.9092 83.0352 74.4248V85.6924C83.0352 94.0469 89.4297 100.812 97.7842 100.812C106.139 100.812 112.533 94.4258 112.533 85.6924V42.7041C128 22.6416 119.672 9.30566 105.025 3.53613Z" fill="url(#phantom_gradient)"/>
                  <defs>
                    <linearGradient id="phantom_gradient" x1="0" y1="0" x2="128" y2="128">
                      <stop stopColor="#534BB1"/>
                      <stop offset="1" stopColor="#551BF9"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="ens-wallet-name">Phantom</span>
              {solanaPublicKey && <span className="ens-connected-badge">Connected</span>}
            </button>

            {/* Sui Network */}
            <div className="ens-section-label">Sui Network</div>
            
            {!suiAccount ? (
              <div className="ens-sui-wrapper">
                <SuiConnectButton />
              </div>
            ) : (
              <button className="ens-wallet-item" disabled>
                <div className="ens-wallet-icon">
                  <svg width="28" height="28" viewBox="0 0 200 200" fill="none">
                    <rect width="200" height="200" rx="40" fill="#4DA2FF"/>
                    <path d="M100 40C94.4772 40 90 44.4772 90 50V150C90 155.523 94.4772 160 100 160C105.523 160 110 155.523 110 150V50C110 44.4772 105.523 40 100 40Z" fill="white"/>
                    <path d="M60 80C54.4772 80 50 84.4772 50 90V150C50 155.523 54.4772 160 60 160C65.5228 160 70 155.523 70 150V90C70 84.4772 65.5228 80 60 80Z" fill="white"/>
                    <path d="M140 80C134.477 80 130 84.4772 130 90V150C130 155.523 134.477 160 140 160C145.523 160 150 155.523 150 150V90C150 84.4772 145.523 80 140 80Z" fill="white"/>
                  </svg>
                </div>
                <span className="ens-wallet-name">Sui Wallet</span>
                <span className="ens-connected-badge">Connected</span>
              </button>
            )}
          </div>

          {/* Right Side - Educational Content */}
          <div className="ens-info-panel">
            <h3>What is a Wallet?</h3>
            
            <div className="ens-info-item">
              <div className="ens-info-icon">
                <Wallet size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4>A Home for your Digital Assets</h4>
                <p>Wallets are used to send, receive, store, and display digital assets like Ethereum and NFTs.</p>
              </div>
            </div>

            <div className="ens-info-item">
              <div className="ens-info-icon">
                <Info size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4>A New Way to Log In</h4>
                <p>Instead of creating new accounts and passwords on every website, just connect your wallet.</p>
              </div>
            </div>

            <button className="ens-get-wallet-btn">Get a Wallet</button>
            <button className="ens-learn-more-link">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
};
