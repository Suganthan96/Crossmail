# CrossMail Backend

Backend server for CrossMail - Connect MetaMask wallet with Gmail for blockchain transaction notifications.

## Features

- 🔐 Google OAuth2 authentication
- 📧 Gmail integration (read, send, search emails)
- 💰 Ethereum wallet management
- 🔗 Transaction execution with email notifications
- 🌐 Support for multiple networks (Ethereum, Arbitrum, Sepolia testnet)

## Prerequisites

- Node.js 16+
- Gmail account
- Google Cloud Project with Gmail API enabled
- Ethereum wallet with private key
- ngrok (for OAuth callback during development)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `GOOGLE_REDIRECT_URI` - OAuth callback URL
- `WALLET_PRIVATE_KEY` - Your Ethereum wallet private key
- `DEFAULT_WALLET` - Your wallet address

### 3. Setup Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth2 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/api/auth/callback`
5. Copy Client ID and Client Secret to `.env`

### 4. Start the Server

```bash
npm run dev
```

Server will start on http://localhost:3001

### 5. Setup ngrok (for OAuth)

In a new terminal:

```bash
ngrok http 3001
```

Copy the ngrok HTTPS URL and:
1. Update `GOOGLE_REDIRECT_URI` in `.env` to `https://YOUR_NGROK_URL/api/auth/callback`
2. Add the same URL to Google Cloud Console OAuth2 credentials

## API Endpoints

### Authentication

- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/status` - Check authentication status
- `POST /api/auth/logout` - Logout

### Wallet

- `GET /api/wallet/address` - Get wallet address
- `GET /api/wallet/balance/:address?` - Get wallet balance
- `GET /api/wallet/transaction/:hash` - Get transaction details
- `GET /api/wallet/networks` - List supported networks
- `POST /api/wallet/verify` - Verify wallet ownership

### Gmail

- `GET /api/gmail/profile` - Get user profile
- `GET /api/gmail/messages` - List recent emails
- `GET /api/gmail/messages/:id` - Get specific email
- `POST /api/gmail/send` - Send email
- `GET /api/gmail/search/transaction/:hash` - Search emails by transaction hash

### Transactions

- `POST /api/transaction/send` - Send transaction with email notification
- `GET /api/transaction/status/:hash` - Get transaction status
- `POST /api/transaction/estimate-gas` - Estimate gas for transaction
- `POST /api/transaction/notify` - Send transaction notification email

## Usage Examples

### 1. Authenticate with Gmail

Visit: http://localhost:3001/api/auth/google

### 2. Send Transaction with Email Notification

```bash
curl -X POST http://localhost:3001/api/transaction/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "0.01",
    "network": "sepolia",
    "notifyEmail": "your-email@gmail.com"
  }'
```

### 3. Check Wallet Balance

```bash
curl http://localhost:3001/api/wallet/balance?network=sepolia
```

### 4. Send Email

```bash
curl -X POST http://localhost:3001/api/gmail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "body": "This is a test email from CrossMail"
  }'
```

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env` file or private keys to git
- Use environment variables for all sensitive data
- Remove `WALLET_PRIVATE_KEY` in production
- Use secure key management solutions in production
- Enable HTTPS in production
- Use database for storing tokens (not in-memory Map)

## Supported Networks

- Ethereum Mainnet
- Sepolia Testnet (recommended for testing)
- Arbitrum One
- Arbitrum Sepolia

## Development

```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Start production server
```

## Troubleshooting

### OAuth Redirect Mismatch
- Ensure `GOOGLE_REDIRECT_URI` in `.env` matches Google Cloud Console
- Update redirect URI when ngrok URL changes

### Transaction Fails
- Check wallet has sufficient balance
- Verify network is correct
- Check gas price and limits

### Gmail API Errors
- Verify Gmail API is enabled in Google Cloud Console
- Check OAuth scopes are correct
- Ensure tokens are fresh (re-authenticate if needed)

## License

MIT
