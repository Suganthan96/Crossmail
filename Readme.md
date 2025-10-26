# MailPay - Email-to-Crypto Transaction System

A revolutionary decentralized email-to-cryptocurrency transaction system that enables seamless blockchain transactions through Gmail integration. Send crypto assets as easily as composing an email.

## Project Overview

MailPay is an innovative blockchain-enabled communication system that bridges traditional email with cryptocurrency transactions. Users can execute cryptocurrency transfers by simply composing an email, leveraging Gmail OAuth2 authentication and MetaMask wallet integration for secure, user-friendly digital asset transfers.

## Partners
1. Avail ![AVAIL_FEEDBACK.md](https://github.com/austinjeremiah/Mailpay/blob/main/Backend/AVAIL_FEEDBACK.md)
2. BlockScout
3. Paypal

## Architecture

The system consists of three core components working in harmony:

### Backend Service
- **Technology Stack**: Node.js, Express.js, Ethers.js
- **Authentication**: Gmail OAuth2 with secure refresh token management
- **Email Processing**: Real-time Gmail API integration with intelligent NLP parsing
- **Transaction Management**: Smart contract interaction and batch transaction processing
- **Monitoring**: Automated email monitoring every 10 seconds

### Frontend Interface
- **Technology Stack**: Next.js 14, TypeScript, React, Tailwind CSS
- **Wallet Integration**: MetaMask connectivity with multi-network support
- **User Interface**: Modern responsive design with real-time transaction status
- **Components**: ConnectKit integration, Avail Nexus widgets

### Smart Contracts
- **Platform**: Ethereum Virtual Machine (EVM) compatible networks
- **Language**: Solidity
- **Functionality**: Secure transaction execution with batch processing capabilities
- **Features**: Emergency withdrawal, gas optimization, event logging

## Supported Networks & Assets

### Ethereum Test Networks
- **Sepolia**: Native ETH transactions (Chain ID: 11155111)
- **Arbitrum Sepolia**: Native ETH transactions (Chain ID: 421614) 
- **Optimism Sepolia**: Native ETH transactions (Chain ID: 11155420)

### Block Explorers
- **Sepolia BlockScout**: https://mail-pay.cloud.blockscout.com (Ethereum Sepolia)
- **Arbitrum BlockScout**: https://mailpay-arbitrum.cloud.blockscout.com (Arbitrum Sepolia)
- **Optimism BlockScout**: https://mailpay-optimism.cloud.blockscout.com (Optimism Sepolia)

## Key Features

### Email-Based Transaction Initiation
- **Natural Language Processing**: Intelligent email parsing for transaction detection
- **Flexible Formats**: Support for various email writing styles
- **Automatic Validation**: Address and amount validation before processing
- **Reply-Based Confirmation**: Professional email threading for transaction confirmations

### Batch Transaction Processing
- **Multi-Recipient Support**: Send to up to 10 recipients in one email
- **Smart Amount Distribution**: Individual amounts or equal splitting
- **Sequential Execution**: Reliable one-by-one transaction processing
- **Progress Tracking**: Real-time batch execution monitoring

### Advanced Security
- **OAuth2 Authentication**: Secure Gmail integration with token rotation
- **MetaMask Integration**: Hardware wallet support and secure signing
- **Transaction Confirmation**: Explicit user approval required for all transactions
- **Session Management**: Secure session handling with expiration

### Multi-Network Support
- **Cross-Chain Capabilities**: Transaction routing across multiple networks
- **Automatic Network Detection**: Smart network selection based on email content
- **Dynamic Gas Estimation**: Optimized gas fees for each network
- **Fallback RPC Endpoints**: Multiple RPC providers for high availability

## Project Structure

```
Mailpay_backend/
├── Backend/                           # Node.js Backend Server
│   ├── src/
│   │   ├── server.js                 # Main Express application
│   │   ├── config/                   # Configuration files
│   │   │   ├── google.js            # Gmail OAuth2 configuration
│   │   │   ├── smart-contract.js    # Blockchain contract configurations
│   │   │   └── wallet.js            # Multi-network wallet configuration
│   │   ├── routes/                   # API route handlers
│   │   │   ├── auth.js              # Google OAuth authentication
│   │   │   ├── gmail.js             # Gmail API operations
│   │   │   ├── wallet.js            # Wallet operations & MetaMask integration
│   │   │   ├── transaction.js       # Transaction processing
│   │   │   ├── email-trigger.js     # Email-triggered transaction creation
│   │   │   └── processed-emails.js  # Email tracking and management
│   │   ├── services/                 # Core business logic
│   │   │   └── email-monitor.js     # Real-time Gmail monitoring service
│   │   └── utils/                    # Utility functions
│   │       └── processed-emails.js  # Email processing state management
│   ├── public/                       # Static HTML interfaces
│   │   ├── gmail-wallet-modern.html # Modern wallet connection interface
│   │   ├── batch-transaction-test.html # Batch transaction testing
│   │   ├── usdc-faucet.html         # USDC token faucet interface
│   │   └── pyusd-test.html          # PYUSD testing interface
│   ├── data/                         # Data storage
│   │   └── processed-emails.json    # Email processing history
│   ├── package.json                  # Backend dependencies
│   └── Documentation/                # Technical documentation
│       ├── BATCH_TRANSACTION_IMPLEMENTATION.md
│       ├── MULTICHAIN_USDC_INTEGRATION.md
│       └── USDC_INTEGRATION_SUMMARY.md
├── Web/                              # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                     # Next.js 14 App Router
│   │   │   ├── layout.tsx           # Root layout component
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── providers.tsx        # Web3 providers (Wagmi, ConnectKit)
│   │   │   ├── gmail-wallet/        # Gmail wallet integration page
│   │   │   └── widget/              # Embeddable payment widgets
│   │   ├── components/              # Reusable React components
│   │   │   ├── wallet-bridge.tsx    # Wallet bridge component
│   │   │   └── ui/                  # UI component library
│   │   └── lib/                     # Utility libraries
│   ├── package.json                 # Frontend dependencies
│   └── next.config.ts               # Next.js configuration
└── README.md                        # This documentation
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Gmail account with API access enabled
- MetaMask browser extension
- Infura account (recommended for production)

### Environment Configuration

Create a `.env` file in the Backend directory:

```env
# Gmail OAuth2 Configuration
GMAIL_CLIENT_ID=your_gmail_client_id_here
GMAIL_CLIENT_SECRET=your_gmail_client_secret_here
GMAIL_REFRESH_TOKEN=your_refresh_token_here

# Blockchain Configuration
INFURA_API_KEY=your_infura_api_key_here

# Server Configuration
PORT=3001
SESSION_SECRET=your_secure_session_secret
NODE_ENV=development
```

### Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Or start production server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd Web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Smart Contract Configuration

Smart contracts are pre-deployed and configured in `Backend/src/config/smart-contract.js`. No additional deployment required.

## Usage Guide

### Single Transaction

Send an email to your authenticated Gmail account:

```
Subject: Send Payment

Send 0.05 ETH to 0x742d35cc6634c0532925a3b8d78c8d5d9012345

Thanks!
```

**Supported formats:**
- `Send 0.01 ETH to 0x742d35cc6634c0532925a3b8d78c8d5d9012345`
- `Transfer 0.05 ETH to 0x742d35cc6634c0532925a3b8d78c8d5d9012345`
- `Send 0.1 ETH on Arbitrum to 0x742d35cc6634c0532925a3b8d78c8d5d9012345`

### Batch Transactions

Send to multiple recipients in one email:

```
Subject: Team Payment Distribution

Send the following payments:
- 0.1 ETH to 0xC7606d2BD6D0D57551d4aEdb2DE74640852fCc70
- 0.075 ETH to 0x742d35Cc6634C0532925a3b8D332aE1Ed0c15E3a
- 0.05 ETH to 0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed

Best regards
```

**Advanced batch options:**
- **Equal splitting**: `Send 1 ETH equally to: [address1] [address2]` 
- **Network-specific**: `Send Arbitrum ETH: 0.25 ETH to [address1], 0.15 ETH to [address2]`
- **Mixed networks**: Each batch supports single network per transaction

### Transaction Workflow

1. **Email Detection**: System monitors Gmail every 10 seconds
2. **Address Extraction**: AI parses email for wallet addresses and amounts  
3. **Transaction Queue**: Creates pending transaction with unique ID
4. **Email Notification**: Sends professional confirmation email with action link
5. **Wallet Connection**: User clicks link to connect MetaMask wallet
6. **Transaction Signing**: User approves transaction in MetaMask
7. **Blockchain Execution**: Transaction broadcasts to selected network
8. **Confirmation**: Email confirmation sent with transaction details and explorer link

## API Reference

### Authentication Endpoints

```bash
# Initiate Google OAuth2 flow
GET /api/auth/google

# Handle OAuth2 callback
GET /api/auth/google/callback  

# Check authentication status
GET /api/auth/check

# Simple authentication for testing
POST /api/simple-auth/authenticate
```

### Wallet Operations

```bash
# Get wallet address
GET /api/wallet/address

# Check wallet balance
GET /api/wallet/balance/:address?network=sepolia

# Get transaction details
GET /api/wallet/transaction/:hash?network=sepolia

# Connect MetaMask wallet
POST /api/wallet/gmail/connect

# Get pending transactions
GET /api/wallet/pending-transactions

# Execute wallet transaction
POST /api/wallet/execute-transaction
```

### Transaction Management

```bash
# Create new transaction
POST /api/transaction/create

# Send transaction with email notification
POST /api/transaction/send

# Get pending transactions
GET /api/transaction/pending

# Get all transactions
GET /api/transaction/all

# Mark batch execution as completed
POST /api/batch-execution-completed
```

### Email Integration

```bash
# Trigger email processing
POST /api/email-trigger/process

# Get processed emails
GET /api/processed-emails/

# Get processing statistics
GET /api/processed-emails/stats
```

## Security Features

### Authentication Security
- **OAuth2 Refresh Tokens**: Automatically rotated and securely stored
- **Session Management**: Secure sessions with configurable expiration
- **API Authentication**: Middleware protection on all sensitive endpoints
- **Rate Limiting**: Built-in protection against abuse

### Transaction Security  
- **Explicit Confirmation**: All transactions require user approval
- **Address Validation**: Checksum validation for all wallet addresses
- **Amount Limits**: Configurable minimum amounts per token type
- **Gas Limit Protection**: Prevents failed transactions due to insufficient gas

### Data Protection
- **Local Processing**: Email content processed locally, not stored permanently
- **Environment Variables**: Sensitive configuration externalized
- **Session Isolation**: User sessions properly isolated and managed
- **HTTPS Enforcement**: SSL/TLS encryption for all communications

## Development & Testing

### Testing Tools

The project includes comprehensive testing interfaces:

```bash
# Test batch transactions
open Backend/public/batch-transaction-test.html

# Test USDC faucet functionality  
open Backend/public/usdc-faucet.html

# Test PYUSD integration
open Backend/public/pyusd-test.html

# Modern wallet interface
open Backend/public/gmail-wallet-modern.html
```

### Development Scripts

```bash
# Backend development with auto-reload
cd Backend && npm run dev

# Frontend development server
cd Web && npm run dev

# Start ngrok tunnel for testing
cd Backend && npm run ngrok

# Run PowerShell OAuth check
cd Backend && ./check-oauth.ps1

# Check pending transaction executions
node Backend/check-pending-executions.js
```

### Debug Mode

Enable comprehensive logging:

```bash
NODE_ENV=development
DEBUG=true
```

This provides detailed logging for:
- Email processing and parsing
- Transaction creation and execution
- Blockchain interactions and confirmations
- OAuth token management

## Performance Metrics

### System Performance
- **Email Processing**: <2 seconds average detection time
- **Transaction Creation**: <5 seconds average queue time  
- **Batch Processing**: Linear scaling with recipient count
- **Network Monitoring**: 10-second polling interval
- **Concurrent Users**: Supports multiple authenticated sessions

### Network Specifications
- **Gas Optimization**: Dynamic estimation per network
- **Transaction Batching**: Up to 10 recipients recommended
- **Confirmation Times**: 1-15 minutes (network dependent)
- **Fallback RPC**: Multiple providers for 99.9% uptime
- **Block Explorers**: Custom BlockScout instances deployed for enhanced transaction tracking
  - Sepolia: https://mail-pay.cloud.blockscout.com
  - Arbitrum Sepolia: https://mailpay-arbitrum.cloud.blockscout.com
  - Optimism Sepolia: https://mailpay-optimism.cloud.blockscout.com

### Token Specifications
- **ETH**: Minimum 0.0001 ETH per transaction
- **Gas Fees**: Dynamic calculation based on network congestion

## Troubleshooting

### Common Issues

**Gmail Authentication Failures**
```bash
# Check OAuth2 credentials
echo $GMAIL_CLIENT_ID
echo $GMAIL_CLIENT_SECRET

# Verify Google Cloud Console API enablement
# Enable Gmail API and ensure OAuth consent screen is configured
```

**MetaMask Connection Issues**  
- Ensure MetaMask extension is installed and unlocked
- Verify network selection matches transaction requirements
- Check browser permissions for wallet connectivity
- Clear browser cache and try reconnecting

**Transaction Failures**
- Validate wallet balance exceeds amount + gas fees
- Confirm recipient addresses are valid checksummed addresses
- Ensure network selection matches intended blockchain
- Check for network congestion causing higher gas requirements

**Email Processing Issues**
- Verify Gmail API quotas and limits
- Check email format matches supported patterns  
- Ensure email is sent from authenticated account
- Review processed-emails.json for processing history

### Monitoring & Logs

```bash
# Check email processing logs
tail -f Backend/logs/email-monitor.log

# Monitor transaction status
curl http://localhost:3001/api/wallet/pending-transactions

# Health check endpoint
curl http://localhost:3001/health

# Get processing statistics  
curl http://localhost:3001/api/processed-emails/stats
```

## Documentation

### BlockScout Explorer Instances

MailPay utilizes custom deployed BlockScout instances for enhanced transaction tracking and verification:

#### Sepolia Network
- **URL**: https://mail-pay.cloud.blockscout.com
- **Network**: Ethereum Sepolia Testnet (Chain ID: 11155111)
- **Features**: ETH transaction tracking
- **Contract Verification**: All deployed contracts verified

#### Arbitrum Sepolia Network
- **URL**: https://mailpay-arbitrum.cloud.blockscout.com
- **Network**: Arbitrum Sepolia Testnet (Chain ID: 421614)
- **Features**: ETH transaction tracking
- **L2 Optimization**: Optimized for Arbitrum's rollup architecture

#### Optimism Sepolia Network
- **URL**: https://mailpay-optimism.cloud.blockscout.com  
- **Network**: Optimism Sepolia Testnet (Chain ID: 11155420)
- **Features**: ETH transaction tracking
- **OP Stack**: Native support for Optimism's infrastructure

#### Explorer Features
- Real-time transaction tracking
- Contract interaction verification
- Gas fee analysis
- Token transfer monitoring
- Batch transaction visualization

### Technical Documentation
- `BATCH_TRANSACTION_IMPLEMENTATION.md` - Comprehensive batch processing guide
- `MULTICHAIN_USDC_INTEGRATION.md` - Multi-network USDC implementation
- `USDC_INTEGRATION_SUMMARY.md` - USDC token integration summary
- `EXPLORER_URL_CUSTOMIZATION.md` - Block explorer configuration

### Configuration Examples
- Smart contract addresses: `Backend/src/config/smart-contract.js`
- Network configurations: `Backend/src/config/wallet.js`
- Google OAuth setup: `Backend/src/config/google.js`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request with detailed description

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation for new features
- Ensure backward compatibility

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For technical support or questions:
- Create an issue in the repository
- Review the technical documentation
- Check configuration examples in `/Backend/src/config`
- Join our community discussions

## Changelog

### Version 2.1.0 (Current)
- Multi-chain support (Ethereum, Arbitrum, Optimism Sepolia)
- Advanced batch transaction processing (up to 10 recipients)
- Professional email formatting with threading
- Enhanced security with session management
- Custom BlockScout explorer integration

### Version 2.0.0
- Batch transaction processing
- Multi-network support infrastructure
- Enhanced security features
- Improved email parsing with NLP

### Version 1.0.0
- Initial release with single transaction support
- Gmail OAuth2 integration
- MetaMask wallet connectivity
- Basic email-to-crypto functionality

---

## Quick Start Summary

1. **Setup Environment**: Configure `.env` with Gmail OAuth2 and Infura credentials
2. **Install Dependencies**: Run `npm install` in both Backend and Web directories  
3. **Start Services**: Launch backend (`npm run dev`) and frontend (`npm run dev`)
4. **Authenticate Gmail**: Visit `/auth/google` to connect your Gmail account
5. **Send Test Email**: Compose email with crypto transaction request
6. **Connect Wallet**: Click confirmation link and connect MetaMask
7. **Execute Transaction**: Approve transaction and monitor on blockchain explorer

**Start sending crypto via email in minutes!** - Supporting Ethereum, Arbitrum, and Optimism test networks with ETH, USDC, and PYUSD tokens.
**Submitted for Ethonline 2025**