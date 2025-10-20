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
- Other chains (manual testing required)

## Support

For further assistance, contact the development team on Discord:

- **Robin**: 
- **Narutto**: Available on Discord server

## Learn More About Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub Repository](https://github.com/vercel/next.js)

## Deployment

Deploy your application on [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

**Project Structure**
```
nexus-test/
├── src/
│   └── app/
│       ├── providers.tsx          # Wallet provider configuration
│       └── components/
│           └── bridge-test.tsx    # Main bridge functionality
└── README.md
```

Thank you with regards @imaustin04 ( discord )