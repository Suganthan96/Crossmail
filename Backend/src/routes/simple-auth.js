import express from 'express';
import { google } from 'googleapis';
import { getOAuth2Client } from '../config/google.js';
import { sendETHViaContract } from '../config/contract.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Store tokens in a file for persistence
const TOKEN_FILE = path.join(__dirname, '../../.tokens.json');

/**
 * Extract wallet address from text
 */
function extractWalletAddress(text) {
  const addressRegex = /\b(0x[a-fA-F0-9]{40})\b/g;
  const matches = text.match(addressRegex);
  return matches ? matches[0] : null;
}

/**
 * Extract amount from text
 */
function extractAmount(text) {
  const amountRegex = /(\d+\.?\d*)\s*(ETH|eth|Eth)?/;
  const match = text.match(amountRegex);
  return match ? parseFloat(match[1]) : 0.01;
}

/**
 * Manual trigger - check last sent email and process it
 */
router.post('/check-last-email', async (req, res) => {
  try {
    // Load tokens from file
    if (!fs.existsSync(TOKEN_FILE)) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please authenticate first',
        authUrl: 'http://localhost:3001/api/simple-auth/start'
      });
    }

    const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
    
    // Setup Gmail API
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get last sent email
    console.log('\n🔍 Checking for last sent email...');
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:sent',
      maxResults: 1
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return res.json({
        success: false,
        message: 'No sent emails found'
      });
    }

    const messageId = response.data.messages[0].id;
    
    // Get full message details
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    // Extract email content
    const headers = message.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const to = headers.find(h => h.name === 'To')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    
    // Get email body
    let emailBody = '';
    if (message.data.payload.parts) {
      const textPart = message.data.payload.parts.find(
        part => part.mimeType === 'text/plain'
      );
      if (textPart && textPart.body.data) {
        emailBody = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    } else if (message.data.payload.body.data) {
      emailBody = Buffer.from(message.data.payload.body.data, 'base64').toString('utf-8');
    }

    console.log(`\n📧 Last Sent Email:`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Date: ${date}`);
    console.log(`   Body: ${emailBody.substring(0, 100)}...`);

    // Extract wallet address and amount
    const fullText = emailBody + ' ' + subject;
    const walletAddress = extractWalletAddress(fullText);
    
    if (!walletAddress) {
      return res.json({
        success: false,
        message: 'No wallet address found in the email',
        emailDetails: { subject, to, date }
      });
    }

    const amount = extractAmount(fullText);

    console.log(`\n✅ Found transaction details:`);
    console.log(`   Wallet: ${walletAddress}`);
    console.log(`   Amount: ${amount} ETH`);

    // Send ETH via smart contract
    console.log(`\n💸 Sending ${amount} ETH to ${walletAddress}...`);
    const result = await sendETHViaContract(walletAddress, amount);

    console.log('✅ Transaction successful!');
    console.log(`   Transaction Hash: ${result.txHash}`);
    console.log(`   Gas Used: ${result.gasUsed}`);
    console.log(`   View on Sepolia: https://sepolia.etherscan.io/tx/${result.txHash}`);

    // Send confirmation email
    const emailContent = [
      'From: CrossMail Transaction Bot <me>',
      `To: me`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ✅ ETH Transaction Confirmed - ${result.txHash.slice(0, 10)}...`,
      '',
      `Your transaction has been successfully executed!`,
      '',
      `📊 Transaction Details:`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💰 Amount: ${amount} ETH`,
      `📫 To: ${walletAddress}`,
      `🔗 Transaction Hash: ${result.txHash}`,
      `⛽ Gas Used: ${result.gasUsed}`,
      ``,
      `🔍 View on Sepolia Etherscan:`,
      `https://sepolia.etherscan.io/tx/${result.txHash}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `⚡ Powered by CrossMail`
    ].join('\r\n');

    const encodedMessage = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log('📧 Confirmation email sent!\n');

    res.json({
      success: true,
      message: 'Transaction executed successfully!',
      transaction: {
        to: walletAddress,
        amount,
        txHash: result.txHash,
        gasUsed: result.gasUsed,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${result.txHash}`
      },
      emailDetails: { subject, to, date }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Simple authentication flow - Step 1: Get auth URL
 */
router.get('/start', (req, res) => {
  const oauth2Client = getOAuth2Client();
  
  // Generate auth URL with localhost redirect
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    redirect_uri: 'http://localhost:3001/api/simple-auth/callback'
  });

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CrossMail Authentication</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
          }
          h1 { color: #1f2937; }
          p { color: #6b7280; margin: 20px 0; }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            transition: background 0.3s;
          }
          .button:hover { background: #5568d3; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 CrossMail Authentication</h1>
          <p>Click the button below to authenticate with Gmail and enable automatic email monitoring for transactions.</p>
          <a href="${authUrl}" class="button">Connect Gmail Account</a>
        </div>
      </body>
    </html>
  `);
});

/**
 * Simple authentication callback
 */
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }
  
  try {
    const oauth2Client = getOAuth2Client();
    
    // Override redirect URI for token exchange
    oauth2Client.redirectUri = 'http://localhost:3001/api/simple-auth/callback';
    
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save tokens to file
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
    
    console.log('✅ Authentication successful! Tokens saved.');
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 600px;
            }
            .success-icon {
              font-size: 64px;
              color: #10b981;
              margin-bottom: 20px;
            }
            h1 { color: #1f2937; margin-bottom: 20px; }
            p { color: #6b7280; margin: 10px 0; }
            .code-block {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              font-family: monospace;
              font-size: 14px;
              text-align: left;
            }
            .success { color: #10b981; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Authentication Successful!</h1>
            <p>Your Gmail account is now connected.</p>
            <p class="success">Now you can send emails with wallet addresses!</p>
            <div class="code-block">
              <strong>How to use:</strong><br><br>
              1. Compose email in Gmail<br>
              2. Include wallet address (0x...)<br>
              3. Send the email<br>
              4. Run this command in PowerShell:<br><br>
              <code>Invoke-RestMethod -Uri "http://localhost:3001/api/simple-auth/check-last-email" -Method Post | ConvertTo-Json</code>
            </div>
            <p>The transaction will be processed and you'll receive a confirmation email!</p>
          </div>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

export default router;
