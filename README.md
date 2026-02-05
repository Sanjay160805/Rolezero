# Sui Role Payment System - Frontend

Complete frontend for the Sui-based autonomous role-based payment system with real ENS integration and cross-chain sponsorship via LI.FI.

## 🎨 Features

- **Create Roles**: Define autonomous payment schedules with ENS-enabled recipients
- **Role Dashboard**: View funding history, executed payments, and ENS-enriched sponsor information
- **Cross-Chain Sponsorship**: Fund roles from Ethereum using LI.FI bridge
- **ENS Integration**: 
  - Resolve ENS names to addresses
  - Reverse resolution for sponsor addresses
  - Read ENS text records for DeFi profiles (`defi.preferredToken`, `defi.notification`)
- **Luxury UI**: White + rose-gold theme with light/dark mode
- **Calibri Typography**: Clean, professional font system

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Sui wallet (Sui Wallet browser extension)
- Ethereum wallet (MetaMask or similar) for ENS features

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUI_PACKAGE_ID=0x... # Your deployed Sui package ID
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/
│   └── Header/              # Main navigation with wallet connectors
├── config/
│   ├── wagmi.ts            # Ethereum/ENS configuration
│   └── sui.ts              # Sui network configuration
├── contexts/
│   └── ThemeContext.tsx    # Light/dark theme provider
├── hooks/
│   ├── useResolveEnsName.ts      # ENS name → address
│   ├── useReverseEns.ts          # Address → ENS name
│   ├── useEnsDeFiProfile.ts      # Read ENS text records
│   ├── useCreateRole.ts          # Create role transaction
│   ├── useFundRole.ts            # Fund role transaction
│   └── useRoleData.ts            # Fetch role data
├── pages/
│   ├── Home/               # Landing page
│   ├── CreateRole/         # Role creation form
│   ├── RoleDashboard/      # Role details & timeline
│   └── SponsorPayment/     # Payment & bridge interface
├── styles/
│   └── global.css          # Theme CSS variables
├── types/
│   └── role.ts             # TypeScript interfaces
└── utils/
    └── ens.ts              # ENS utility functions
```

## 🎥 Demo Video Checklist

Record the following to demonstrate all features:

### ✅ 1. ENS Name Resolution (Create Role)
- [ ] Navigate to "Create Role" page
- [ ] Enter an ENS name in the recipient field (e.g., `vitalik.eth`)
- [ ] Show the loading indicator while resolving
- [ ] Show the resolved Ethereum address appears below the input
- [ ] Enter another ENS name in the "Leftover Recipient" field
- [ ] Show both ENS names and resolved addresses

### ✅ 2. Create Role with ENS Recipients
- [ ] Fill out the complete form with:
  - Role name
  - Start and expiry times
  - 2-3 payment entries with ENS names
  - Leftover recipient (ENS name)
- [ ] Submit the form
- [ ] Show the transaction confirmation
- [ ] Display the created Role Object ID

### ✅ 3. Role Dashboard - Reverse ENS Resolution
- [ ] Navigate to the Role Dashboard for the created role
- [ ] Show the role summary (name, status, balances)
- [ ] Point out that sponsor addresses are empty (no funding yet)

### ✅ 4. Fund Role from Sui Wallet
- [ ] Navigate to "Sponsor This Role" button
- [ ] Enter an amount in SUI
- [ ] Click "Pay with Sui Wallet"
- [ ] Show transaction confirmation

### ✅ 5. Dashboard Update - Reverse ENS & DeFi Profile
- [ ] Return to Role Dashboard
- [ ] Show the funding transaction in the timeline
- [ ] Demonstrate reverse ENS resolution:
  - If your Sui wallet has no ENS, show shortened address
  - If available, show the ENS name instead
- [ ] Show ENS DeFi Profile section (if text records exist):
  - `defi.preferredToken`
  - `defi.notification`

### ✅ 6. Cross-Chain Payment via LI.FI
- [ ] Go back to "Sponsor This Role"
- [ ] Click "Pay from Ethereum"
- [ ] Show the LI.FI widget opening
- [ ] Connect Ethereum wallet (MetaMask)
- [ ] Select ETH or any ERC-20 token
- [ ] Show the bridge destination is set to the Role's Sui address
- [ ] Initiate a cross-chain transfer (you can cancel before completing)

### ✅ 7. Theme Toggle
- [ ] Click the moon/sun icon in the header
- [ ] Show the transition from light to dark theme
- [ ] Highlight the rose-gold accent colors

### ✅ 8. Code Walkthrough (Optional)
- [ ] Open VSCode and show:
  - `useResolveEnsName.ts` - real wagmi hooks
  - `useReverseEns.ts` - reverse resolution
  - `useEnsDeFiProfile.ts` - text record reading
  - `CreateRole.tsx` - ENS integration in form
  - `RoleDashboard.tsx` - SponsorInfo component with ENS

## 🧪 ENS Prize Compliance

This frontend demonstrates **real ENS integration**:

### ✔️ Forward Resolution
- Uses `wagmi`'s `useEnsAddress` hook
- Resolves ENS names to Ethereum addresses
- Used in: Create Role form (recipients, leftover recipient)

### ✔️ Reverse Resolution
- Uses `wagmi`'s `useEnsName` hook
- Converts sponsor addresses back to ENS names
- Used in: Role Dashboard timeline (sponsor identification)

### ✔️ ENS Text Records (Creative DeFi Usage)
- Uses `wagmi`'s `useEnsText` hook
- Reads custom text records:
  - `defi.preferredToken` - sponsor's preferred payment token
  - `defi.notification` - sponsor's notification preferences
- Used in: Role Dashboard (DeFi Profile badges)

### ✔️ No Mocks or Hard-coding
- All ENS hooks use real wagmi APIs
- No placeholder data
- Live resolution on Ethereum mainnet
- Displays both ENS names and resolved addresses in UI state

## 🛠 Technologies Used

- **React** + **TypeScript** + **Vite**
- **wagmi** + **viem** - Ethereum wallet and ENS
- **@mysten/dapp-kit** + **@mysten/sui.js** - Sui blockchain
- **@lifi/widget** - Cross-chain bridging
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **qrcode.react** - QR code generation
- **date-fns** - Date formatting
- **lucide-react** - Icons

## 🎨 Design System

### Colors
- **Light Theme**: White backgrounds, rose-gold accents (#B76E79)
- **Dark Theme**: Dark backgrounds (#0F1115), same rose-gold accents
- **Typography**: Calibri, Segoe UI, system-ui fallbacks

### Components
- Rounded cards with soft shadows
- Smooth transitions and hover effects
- Responsive grid layouts
- Accessible form inputs with proper labels

## 🔗 Key Integration Points

### Sui Smart Contract Interface
The frontend expects these contract functions:
- `create_role(name, start_time, expiry_time, recipients, amounts, scheduled_times, leftover_recipient, dev_fee)`
- `fund_role(role_id, coin)`
- `execute_payments(role_id)` (automated by contract)

### LI.FI Configuration
- Source Chain: Ethereum mainnet (chain ID 1)
- Destination Chain: Sui (chain ID 101)
- Destination Address: Role Object ID
- Supports: ETH, USDC, USDT, and other ERC-20 tokens

## 📝 Notes

- Replace `VITE_SUI_PACKAGE_ID` with your actual deployed package ID
- ENS resolution requires Ethereum mainnet connection
- Sui transactions require Sui testnet or mainnet depending on your contract deployment
- For production, configure proper RPC endpoints and API keys

## 🏆 ENS Prize Submission Highlights

1. **Real ENS APIs**: All ENS features use actual wagmi hooks, no mocking
2. **Multiple ENS Features**: Forward resolution, reverse resolution, text records
3. **Creative DeFi Usage**: ENS text records for sponsor profiles
4. **User-Facing**: ENS names are prominently displayed throughout the UI
5. **Live Demo Ready**: Full demo video checklist provided

## 📄 License

MIT
