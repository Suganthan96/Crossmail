import express from 'express';
import { getGmailClient, setCredentials } from '../config/google.js';
import { sendETHViaContract } from '../config/contract.js';
import { getUserTokens } from './auth.js';

const router = express.Router();

/**
 * Middleware to check authentication
 */
function requireAuth(req, res, next) {
  if (!req.session.userEmail || !req.session.tokens) {
    return res.status(401).json({ 
      error: 'Not authenticated',
      message: 'Please authenticate with Google first'
    });
  }
  next();
}

/**
 * Extract wallet address from email content
 */
function extractWalletAddress(text) {
  // Match Ethereum addresses (0x followed by 40 hex characters)
  const addressRegex = /\b(0x[a-fA-F0-9]{40})\b/g;
  const matches = text.match(addressRegex);
  return matches ? matches[0] : null;
}

/**
 * Extract amount from email content
 */
function extractAmount(text) {
  // Look for patterns like "0.1 ETH", "0.1 eth", "0.1"
  const amountRegex = /(\d+\.?\d*)\s*(ETH|eth|Eth)?/;
  const match = text.match(amountRegex);
  return match ? parseFloat(match[1]) : 0.01; // Default to 0.01 ETH
}

/**
 * Process email and send ETH via contract
 */
router.post('/process-email', requireAuth, async (req, res) => {
  try {
    const { messageId } = req.body;
    
    if (!messageId) {
      return res.status(400).json({ 
        error: 'Missing messageId' 
      });
    }
    
    setCredentials(req.session.tokens);
    const gmail = getGmailClient();
    
    // Get the email
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });
    
    // Extract email content
    const headers = message.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    
    // Get email body
    let body = '';
    if (message.data.payload.body.data) {
      body = Buffer.from(message.data.payload.body.data, 'base64').toString();
    } else if (message.data.payload.parts) {
      const textPart = message.data.payload.parts.find(part => 
        part.mimeType === 'text/plain'
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    }
    
    const fullText = subject + ' ' + body;
    
    // Extract wallet address and amount
    const walletAddress = extractWalletAddress(fullText);
    const amount = extractAmount(fullText);
    
    if (!walletAddress) {
      return res.status(400).json({ 
        error: 'No wallet address found in email',
        message: 'Please include a valid Ethereum address (0x...)'
      });
    }
    
    console.log(`Processing email from ${from}`);
    console.log(`Wallet address: ${walletAddress}`);
    console.log(`Amount: ${amount} ETH`);
    
    // Send ETH via contract
    const result = await sendETHViaContract(walletAddress, amount, 'sepolia');
    
    // Send confirmation email
    const confirmationBody = `
Transaction Successful! 🎉

Your ETH has been sent via smart contract!

Transaction Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From:          ${result.tx.from}
To:            ${walletAddress}
Amount:        ${amount} ETH
Contract:      ${process.env.SEND_ETH_CONTRACT_ADDRESS}

Transaction Hash:
${result.tx.hash}

Block Number:  ${result.receipt.blockNumber}
Gas Used:      ${result.receipt.gasUsed.toString()}
Status:        ${result.receipt.status === 1 ? '✅ Success' : '❌ Failed'}

${result.event ? `
Event Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From:          ${result.event.from}
To:            ${result.event.to}
Amount:        ${result.event.amount} ETH
Timestamp:     ${new Date(result.event.timestamp * 1000).toLocaleString()}
` : ''}

View on Explorer:
https://sepolia.etherscan.io/tx/${result.tx.hash}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent via CrossMail
    `.trim();
    
    const emailMessage = [
      `To: ${from}`,
      `Subject: ✅ ETH Sent - Transaction ${result.tx.hash.substring(0, 10)}...`,
      '',
      confirmationBody
    ].join('\n');
    
    const encodedMessage = Buffer.from(emailMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    });
    
    res.json({
      success: true,
      message: 'ETH sent successfully via contract',
      transaction: {
        hash: result.tx.hash,
        from: result.tx.from,
        to: walletAddress,
        amount: amount,
        blockNumber: result.receipt.blockNumber,
        gasUsed: result.receipt.gasUsed.toString(),
        explorerUrl: `https://sepolia.etherscan.io/tx/${result.tx.hash}`
      },
      event: result.event,
      emailSent: true
    });
    
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({ 
      error: 'Failed to process email',
      message: error.message 
    });
  }
});

/**
 * Monitor inbox for new emails with wallet addresses
 */
router.post('/monitor', requireAuth, async (req, res) => {
  try {
    setCredentials(req.session.tokens);
    const gmail = getGmailClient();
    
    // Search for unread emails with wallet addresses or "Send Sepolia ETH" subject
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread (subject:"Send Sepolia ETH" OR subject:"wallet" OR "0x")',
      maxResults: 10
    });
    
    const messages = response.data.messages || [];
    const processed = [];
    
    for (const message of messages) {
      try {
        // Get message details
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
        
        const headers = msg.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        
        // Get body
        let body = '';
        if (msg.data.payload.body.data) {
          body = Buffer.from(msg.data.payload.body.data, 'base64').toString();
        } else if (msg.data.payload.parts) {
          const textPart = msg.data.payload.parts.find(part => 
            part.mimeType === 'text/plain'
          );
          if (textPart && textPart.body.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString();
          }
        }
        
        const fullText = subject + ' ' + body;
        const walletAddress = extractWalletAddress(fullText);
        const amount = extractAmount(fullText);
        
        if (walletAddress) {
          console.log(`Found wallet address in email from ${from}: ${walletAddress}`);
          
          // Send ETH via contract
          const result = await sendETHViaContract(walletAddress, amount, 'sepolia');
          
          // Mark as read
          await gmail.users.messages.modify({
            userId: 'me',
            id: message.id,
            requestBody: {
              removeLabelIds: ['UNREAD']
            }
          });
          
          // Send confirmation email
          const confirmationBody = `
Transaction Successful! 🎉

Transaction Hash: ${result.tx.hash}
Amount: ${amount} ETH
To: ${walletAddress}

View on Explorer: https://sepolia.etherscan.io/tx/${result.tx.hash}
          `.trim();
          
          const emailMessage = [
            `To: ${from}`,
            `Subject: ✅ ETH Sent Successfully`,
            '',
            confirmationBody
          ].join('\n');
          
          const encodedMessage = Buffer.from(emailMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
          
          await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedMessage }
          });
          
          processed.push({
            messageId: message.id,
            from,
            to: walletAddress,
            amount,
            txHash: result.tx.hash
          });
        }
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
      }
    }
    
    res.json({
      success: true,
      processed: processed.length,
      transactions: processed
    });
    
  } catch (error) {
    console.error('Error monitoring inbox:', error);
    res.status(500).json({ 
      error: 'Failed to monitor inbox',
      message: error.message 
    });
  }
});

/**
 * Send ETH via contract with email notification
 */
router.post('/send-via-contract', requireAuth, async (req, res) => {
  try {
    const { to, amount, network = 'sepolia', notifyEmail } = req.body;
    
    if (!to || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, amount' 
      });
    }
    
    // Send via contract
    const result = await sendETHViaContract(to, amount, network);
    
    // Send email notification if requested
    if (notifyEmail && req.session.tokens) {
      try {
        setCredentials(req.session.tokens);
        const gmail = getGmailClient();
        
        const emailBody = `
Transaction Successful via Smart Contract! 🎉

Contract Address: ${process.env.SEND_ETH_CONTRACT_ADDRESS}
Transaction Hash: ${result.tx.hash}
From: ${result.tx.from}
To: ${to}
Amount: ${amount} ETH
Network: ${network}
Block Number: ${result.receipt.blockNumber}
Gas Used: ${result.receipt.gasUsed.toString()}

${result.event ? `
Event Emitted:
From: ${result.event.from}
To: ${result.event.to}
Amount: ${result.event.amount} ETH
Timestamp: ${new Date(result.event.timestamp * 1000).toLocaleString()}
` : ''}

View on Explorer: https://sepolia.etherscan.io/tx/${result.tx.hash}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent via CrossMail Smart Contract
        `.trim();
        
        const message = [
          `To: ${notifyEmail}`,
          `Subject: ✅ Smart Contract Transaction Confirmed - ${result.tx.hash.substring(0, 10)}...`,
          '',
          emailBody
        ].join('\n');
        
        const encodedMessage = Buffer.from(message)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        
        await gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw: encodedMessage }
        });
        
        console.log(`Email notification sent to ${notifyEmail}`);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }
    
    res.json({
      success: true,
      transaction: {
        hash: result.tx.hash,
        from: result.tx.from,
        to: to,
        value: amount,
        blockNumber: result.receipt.blockNumber,
        gasUsed: result.receipt.gasUsed.toString(),
        status: result.receipt.status === 1 ? 'success' : 'failed',
        contractAddress: process.env.SEND_ETH_CONTRACT_ADDRESS
      },
      event: result.event,
      explorerUrl: `https://sepolia.etherscan.io/tx/${result.tx.hash}`
    });
    
  } catch (error) {
    console.error('Contract transaction error:', error);
    res.status(500).json({ 
      error: 'Transaction failed',
      message: error.message 
    });
  }
});

export default router;
