import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';
import walletRoutes from './routes/wallet.js';
import gmailRoutes from './routes/gmail.js';
import transactionRoutes from './routes/transaction.js';
import emailTriggerRoutes from './routes/email-trigger.js';
import simpleAuthRoutes from './routes/simple-auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/email-trigger', emailTriggerRoutes);
app.use('/api/simple-auth', simpleAuthRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CrossMail Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 CrossMail Backend Server running on http://localhost:${PORT}`);
  console.log(`📧 Gmail OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`💰 Wallet: ${process.env.DEFAULT_WALLET ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`📝 Smart Contract: ${process.env.SEND_ETH_CONTRACT_ADDRESS || '✗ Not configured'}`);
  console.log(`\n🎯 AUTOMATIC EMAIL MONITORING ENABLED!`);
  console.log(`   ⚡ When you authenticate, the system will automatically:`);
  console.log(`      1. Monitor your Gmail every 10 seconds`);
  console.log(`      2. Detect emails with wallet addresses`);
  console.log(`      3. Execute smart contract transactions`);
  console.log(`      4. Send confirmation emails`);
  console.log(`\n📖 Quick Start:`);
  console.log(`   1. Authenticate: http://localhost:${PORT}/api/auth/google`);
  console.log(`   2. Compose Gmail with wallet address (0x...)`);
  console.log(`   3. Hit SEND - Transaction triggers automatically! 🚀`);
  console.log(`\n📚 Full Guide: Backend/AUTOMATIC_MONITORING_GUIDE.md\n`);
});
