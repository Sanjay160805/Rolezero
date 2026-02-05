import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { wagmiConfig } from '@/config/wagmi';
import { networkConfig } from '@/config/sui';
import { getSolanaEndpoint, useSolanaWallets } from '@/config/solana';
import { Header } from '@/components/Header/Header';
import { Home } from '@/pages/Home/Home';
import { CreateRole } from '@/pages/CreateRole/CreateRole';
import { RoleDashboard } from '@/pages/RoleDashboard/RoleDashboard';
import { RoleDashboardLive } from '@/pages/RoleDashboard/RoleDashboardLive';
import { RolesList } from '@/pages/RolesList/RolesList';
import { SponsorPayment } from '@/pages/SponsorPayment/SponsorPayment';
import { UserProfile } from '@/pages/UserProfile/UserProfile';
import { ToastContainer } from '@/components/Toast/Toast';
import '@mysten/dapp-kit/dist/index.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import '@/styles/global.css';

const queryClient = new QueryClient();

function App() {
  const solanaEndpoint = getSolanaEndpoint();
  const wallets = useSolanaWallets();

  return (
    <ThemeProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConnectionProvider endpoint={solanaEndpoint}>
            <SolanaWalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
                  <WalletProvider>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                      <div className="app">
                        <Header />
                        <main>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/create" element={<CreateRole />} />
                            <Route path="/roles" element={<RolesList />} />
                            <Route path="/role/:roleId" element={<RoleDashboard />} />
                            <Route path="/role/:roleId/live" element={<RoleDashboardLive />} />
                            <Route path="/sponsor/:roleId" element={<SponsorPayment />} />
                            <Route path="/profile" element={<UserProfile />} />
                          </Routes>
                        </main>
                        <ToastContainer />
                      </div>
                    </BrowserRouter>
                  </WalletProvider>
                </SuiClientProvider>
              </WalletModalProvider>
            </SolanaWalletProvider>
          </ConnectionProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

export default App;
