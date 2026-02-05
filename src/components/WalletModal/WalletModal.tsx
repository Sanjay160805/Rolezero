import React from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { ConnectButton as SuiConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { X, Wallet, Check } from 'lucide-react';
import './WalletModal.css';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  // EVM (Ethereum) wallet hooks
  const { connect, connectors } = useConnect();
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { disconnect: disconnectEvm } = useDisconnect();

  // Solana wallet hooks
  const { 
    publicKey: solanaPublicKey,
    connect: connectSolana,
    disconnect: disconnectSolana,
    wallets: solanaWallets
  } = useSolanaWallet();

  // Sui wallet hooks
  const suiAccount = useCurrentAccount();

  if (!isOpen) return null;

  // Handle MetaMask connection (EVM)
  const handleMetaMaskConnect = async () => {
    try {
      const win = window as any;
      let provider;

      // Find MetaMask provider
      if (win.ethereum?.providers?.length) {
        provider = win.ethereum.providers.find((p: any) => p.isMetaMask && !p.isPhantom);
      } else if (win.ethereum?.isMetaMask) {
        provider = win.ethereum;
      }

      if (!provider) {
        alert('MetaMask wallet not found! Please install MetaMask.');
        return;
      }

      // Find MetaMask connector in wagmi
      const metaMaskConnector = connectors.find((c: any) => 
        c.id === 'injected' || c.id === 'metaMask'
      );

      if (metaMaskConnector) {
        await connect({ connector: metaMaskConnector });
        onClose();
      }
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
      alert('Failed to connect MetaMask. Please try again.');
    }
  };

  // Handle Phantom connection (Solana)
  const handlePhantomConnect = async () => {
    try {
      const phantomWallet = solanaWallets.find(
        (w) => w.adapter.name === 'Phantom'
      );

      if (!phantomWallet) {
        alert('Phantom wallet not found! Please install Phantom.');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      await connectSolana();
      onClose();
    } catch (error) {
      console.error('Failed to connect Phantom (Solana):', error);
      alert('Failed to connect Phantom. Please try again.');
    }
  };

  // Check if MetaMask is installed
  const checkMetaMaskInstalled = () => {
    const win = window as any;
    if (win.ethereum?.providers?.length) {
      return win.ethereum.providers.some((p: any) => p.isMetaMask && !p.isPhantom);
    }
    return win.ethereum?.isMetaMask === true;
  };

  // Check if Phantom is installed
  const checkPhantomInstalled = () => {
    return solanaWallets.some((w) => w.adapter.name === 'Phantom' && w.readyState === 'Installed');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Wallet size={22} />
            <h2>Connect Wallet</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* EVM (Ethereum) Wallet Section */}
          <div className="section-divider">
            <span className="divider-text">Ethereum (EVM)</span>
          </div>

          {isEvmConnected && (
            <div className="connected-section">
              <div className="connected-card">
                <div className="connected-info">
                  <Check size={20} className="check-icon" />
                  <div>
                    <p className="connected-label">MetaMask Connected</p>
                    <p className="connected-address">
                      {evmAddress?.slice(0, 8)}...{evmAddress?.slice(-6)}
                    </p>
                  </div>
                </div>
                <button className="btn-disconnect" onClick={() => disconnectEvm()}>
                  Disconnect
                </button>
              </div>
            </div>
          )}

          <div className="wallets-grid">
            <button
              className="wallet-card"
              onClick={handleMetaMaskConnect}
              disabled={!checkMetaMaskInstalled() || isEvmConnected}
            >
              <div className="wallet-icon">
                <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
                  <path d="M32.958 3.958l-11.25 8.334 2.083-4.959 9.167-3.375z" fill="#E17726"/>
                  <path d="M7.042 3.958l11.166 8.417-1.958-5.042-9.208-3.375zM28.125 27.083l-3 4.584 6.417 1.791 1.833-6.291-5.25-.084zM6.625 27.167l1.833 6.291 6.417-1.791-3-4.584-5.25.084z" fill="#E27625"/>
                  <path d="M14.458 18.125l-1.75 2.667 6.375.291-.208-6.875-4.417 3.917zM25.542 18.125l-4.5-4-0.125 7 6.375-.291-1.75-2.709zM14.875 31.667l3.833-1.875-3.291-2.584-0.542 4.459zM21.292 29.792l3.833 1.875-0.542-4.459-3.291 2.584z" fill="#E27625"/>
                  <path d="M25.125 31.667l-3.833-1.875.291 2.375-.042 1.208 3.584-1.708zM14.875 31.667l3.583 1.708-.042-1.208.292-2.375-3.833 1.875z" fill="#D5BFB2"/>
                  <path d="M18.542 24.625l-3.167-.958 2.25-1.042.917 2zM21.458 24.625l.917-2 2.25 1.042-3.167.958z" fill="#233447"/>
                  <path d="M14.875 31.667l.583-4.584-3.583.084 3 4.5zM24.542 27.083l.583 4.584 3-4.5-3.583-.084zM27.292 20.792l-6.375.291.583 3.292.917-2 2.25 1.042 2.625-2.625zM15.375 23.667l2.25-1.042.917 2 .583-3.292-6.375-.291 2.625 2.625z" fill="#CC6228"/>
                  <path d="M12.708 20.792l2.709 5.291-.083-2.666-2.626-2.625zM24.667 23.417l-.083 2.666 2.708-5.291-2.625 2.625zM19.125 21.083l-.583 3.292.75 3.875.167-5.042-0.334-2.125zM20.875 21.083l-.291 2.125.125 5.042.75-3.875-0.584-3.292z" fill="#E27525"/>
                  <path d="M21.458 24.625l-.75 3.875.542.375 3.291-2.584.084-2.666-3.167 1zM15.375 23.667l.083 2.666 3.292 2.584.541-.375-.75-3.875-3.166-1z" fill="#F5841F"/>
                  <path d="M21.542 33.375l.041-1.208-.333-.292h-2.5l-.333.292.041 1.208-3.583-1.708 1.25 1.041 2.542 1.75h2.583l2.542-1.75 1.25-1.041-3.5 1.708z" fill="#C0AC9D"/>
                  <path d="M21.292 29.792l-.542-.375h-1.5l-.542.375-.291 2.375.333-.292h2.5l.333.292-.291-2.375z" fill="#161616"/>
                  <path d="M33.5 12.708l1.167-5.625L32.958 3.958l-11.666 8.709 4.5 3.833 6.333 1.875 1.417-1.667-.625-.458 1-.917-.75-.583 1-.75-.667-.5zM5.333 7.083l1.167 5.625-.708.5 1 .75-.708.583 1 .917-.625.458 1.375 1.667 6.333-1.875 4.5-3.833L6.042 3.958 5.333 7.083z" fill="#763E1A"/>
                  <path d="M31.583 16.375l-6.333-1.875 1.917 2.708-2.709 5.292 3.584-.042h5.333l-1.792-6.083zM14.75 14.5l-6.333 1.875-1.75 6.083h5.333l3.583.042-2.708-5.292 1.875-2.708zM20.875 21.083l.417-7.25 1.875-5.125h-8.334l1.875 5.125.417 7.25.167 2.167.042 5 h1.5l.041-5 .167-2.167z" fill="#F5841F"/>
                </svg>
              </div>
              <div className="wallet-info">
                <span className="wallet-name">MetaMask</span>
                <span className="wallet-description">
                  {!checkMetaMaskInstalled() ? 'Not installed' : isEvmConnected ? 'Connected' : 'Click to connect'}
                </span>
              </div>
              {!checkMetaMaskInstalled() && (
                <span className="badge-not-installed">Not Installed</span>
              )}
            </button>
          </div>

          {/* Solana Wallet Section */}
          <div className="section-divider">
            <span className="divider-text">Solana</span>
          </div>

          {solanaPublicKey && (
            <div className="connected-section">
              <div className="connected-card">
                <div className="connected-info">
                  <Check size={20} className="check-icon" />
                  <div>
                    <p className="connected-label">Phantom Connected</p>
                    <p className="connected-address">
                      {solanaPublicKey.toBase58().slice(0, 8)}...{solanaPublicKey.toBase58().slice(-6)}
                    </p>
                  </div>
                </div>
                <button className="btn-disconnect" onClick={() => disconnectSolana()}>
                  Disconnect
                </button>
              </div>
            </div>
          )}

          <div className="wallets-grid">
            <button
              className="wallet-card"
              onClick={handlePhantomConnect}
              disabled={!checkPhantomInstalled() || !!solanaPublicKey}
            >
              <div className="wallet-icon">
                <svg width="48" height="48" viewBox="0 0 128 128" fill="none">
                  <path d="M105.025 3.53613C92.9121 -1.11191 78.4844 -0.888672 64 7.77832C49.5156 -0.888672 35.0879 -1.11191 22.9746 3.53613C8.32812 9.30566 0 22.6416 0 42.7041V85.6924C0 97.6934 9.73438 107.428 21.7354 107.428C33.7363 107.428 43.4707 97.6934 43.4707 85.6924V74.4248C43.4707 72.9092 44.7012 71.6787 46.2168 71.6787C47.7324 71.6787 48.9629 72.9092 48.9629 74.4248V85.6924C48.9629 97.6934 58.6973 107.428 70.6982 107.428C82.6992 107.428 92.4336 97.6934 92.4336 85.6924V42.7041C92.4336 38.5586 89.3135 35.1504 85.168 34.7793C84.7969 34.7793 84.4258 34.7793 84.0547 34.7793C75.1426 34.7793 67.9492 27.5859 67.9492 18.6738C67.9492 16.7871 66.3457 15.1836 64.459 15.1836C62.5723 15.1836 60.9688 16.7871 60.9688 18.6738C60.9688 27.5859 53.7754 34.7793 44.8633 34.7793C44.4922 34.7793 44.1211 34.7793 43.75 34.7793C39.6045 35.1504 36.4844 38.5586 36.4844 42.7041V85.6924C36.4844 94.0469 30.0898 100.812 21.7354 100.812C13.3809 100.812 6.98633 94.4258 6.98633 85.6924V42.7041C6.98633 23.0176 15.2686 12.1113 27.8301 7.40723C41.5723 2.33203 57.2656 9.17773 64 15.5547C70.7344 9.17773 86.4277 2.33203 100.17 7.40723C112.731 12.1113 121.014 23.0176 121.014 42.7041V85.6924C121.014 97.6934 111.279 107.428 99.2783 107.428C87.2773 107.428 77.543 97.6934 77.543 85.6924V74.4248C77.543 72.9092 78.7734 71.6787 80.2891 71.6787C81.8047 71.6787 83.0352 72.9092 83.0352 74.4248V85.6924C83.0352 94.0469 89.4297 100.812 97.7842 100.812C106.139 100.812 112.533 94.4258 112.533 85.6924V42.7041C128 22.6416 119.672 9.30566 105.025 3.53613Z" fill="url(#phantom_gradient)"/>
                  <defs>
                    <linearGradient id="phantom_gradient" x1="0" y1="0" x2="128" y2="128">
                      <stop stopColor="#534BB1"/>
                      <stop offset="1" stopColor="#551BF9"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="wallet-info">
                <span className="wallet-name">Phantom</span>
                <span className="wallet-description">
                  {!checkPhantomInstalled() ? 'Not installed' : solanaPublicKey ? 'Connected' : 'Click to connect'}
                </span>
              </div>
              {!checkPhantomInstalled() && (
                <span className="badge-not-installed">Not Installed</span>
              )}
            </button>
          </div>

          {/* Sui Wallet Section */}
          <div className="section-divider">
            <span className="divider-text">Sui Network</span>
          </div>

          {suiAccount && (
            <div className="connected-section">
              <div className="connected-card">
                <div className="connected-info">
                  <Check size={20} className="check-icon" />
                  <div>
                    <p className="connected-label">Sui Wallet Connected</p>
                    <p className="connected-address">
                      {suiAccount.address.slice(0, 8)}...{suiAccount.address.slice(-6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!suiAccount && (
            <div className="sui-wallet-section">
              <SuiConnectButton />
            </div>
          )}

          <div className="modal-footer">
            <p className="footer-note">
              Connect your wallet to the correct chain: MetaMask for Ethereum, Phantom for Solana, or Slush/Sui Wallet for Sui
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
