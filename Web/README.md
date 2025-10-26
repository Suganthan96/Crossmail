# Nexus SDK starter

A Next.js-based decentralized application for cross-chain bridging using Nexus SDK.

## Prerequisites

- Node.js (v16 or higher)
- pnpm or npm
- Test tokens (minimum 10 USDC or ETH)
- WalletConnect Project ID or Third Web credentials

## Installation

Due to potential version conflicts, use one of the following installation methods:
```bash
# Preferred method
pnpm install

# Alternative with npm
npm install

# If you encounter peer dependency issues
npm install --legacy-peer-deps
```

## Configuration

### 1. Wallet Provider Setup

Navigate to `src/app/providers.tsx` and add your wallet credentials:

- Get your Project ID from [WalletConnect](https://cloud.walletconnect.com/)
- Or use [Third Web](https://thirdweb.com/) to obtain your wallet ID
- Replace the existing wallet ID in the providers file

### 2. Main Bridge Component

The core functionality is located at `src/app/components/bridge-test.tsx`

This component includes three main methods:

1. **Bridging within connected wallet** - Transfer assets within your own wallet across chains
2. **Transfer to recipient** - Send cross-chain transfers to any address (Optimism Sepolia currently works best, but other chain IDs can be tested manually)
3. **Bridge and execute** - Automated bridging with smart contract execution (currently configured for Aave Arbitrum Sepolia pool)

## Testing Requirements

- Minimum **10 USDC test tokens** or **ETH** for full testing
- You'll need to sign multiple transactions:
  - Spending cap approval
  - Transfer signing
  - Other permission requests

## Running the Application
```bash
# Using pnpm
pnpm run dev

# Using npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Important Notes

- **Initial Load Time**: The Nexus SDK will take some time to load after connecting your wallet. Wait for the initialization to complete before testing.
- **Test Networks**: Currently optimized for Optimism Sepolia testnet. Other chain IDs can be tested manually.
- **Starter Template**: This is a foundational template for the Nexus widget. Customize it according to your project requirements.

## Supported Chains

- Optimism Sepolia (recommended for testing)
- Arbitrum Sepolia (for Aave pool interactions)
# Mailpay — Web

This folder contains the frontend for the Mailpay project. It's a Next.js application (TypeScript + React) that powers the web widget and UI for Mailpay.

Key technologies
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- styled-components
- 3D / animation libraries (three, gsap, @react-three/fiber)
- Web3 tooling (wagmi, viem, connectkit)

Quick status
- Project name from package.json: `nexus-test`
- Scripts available: `dev`, `build`, `start`, `lint`

Requirements
- Node.js (v18+ recommended)
- npm, pnpm or yarn (a `pnpm-lock.yaml` exists in the repository root)

Install and run (PowerShell)
```powershell
# from repo root
cd Web
# install dependencies (use pnpm if you prefer)
npm install
# start dev server
npm run dev
```

Build and run production
```powershell
cd Web
npm run build
npm run start
```

Linting
```powershell
cd Web
npm run lint
```

Helpful notes
- Configuration files in this folder:
  - `next.config.ts` — Next.js configuration
  - `tsconfig.json` — TypeScript configuration
  - Tailwind/PostCSS files at the project root are used by the app
- If you run into problems:
  - Ensure Node version >= 18.
  - Remove `node_modules` and reinstall (PowerShell: `Remove-Item -Recurse -Force node_modules`).
  - Clear Next cache: remove `.next` directory before building again.

Developer tips
- Use `pnpm install` for deterministic installs (a `pnpm-lock.yaml` is included in the repo root).
- The project mixes Tailwind and styled-components — check `globals.css` and the component styles in `src`.

Where to look next
- `src/app` — Next app routes and widgets
- `src/components` — shared components and UI primitives
- `public` — static assets

Contributing
- Follow the existing code style and run lint before opening PRs.
- Add tests and README updates for new features or major dependency changes.

License and author
- See repository root for license and author information.

---

If you relied on the original Nexus SDK starter content in this file, most of that information (wallet provider notes, bridging components) may still be relevant; check `src/app/providers.tsx` and `src/app/components` for any Nexus widget or bridge-related components.

Thank you — the Mailpay team
