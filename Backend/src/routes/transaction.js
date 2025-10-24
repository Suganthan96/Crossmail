import express from 'express';
import { sendTransaction, getTransaction, getBalance } from '../config/wallet.js';
import { getGmailClient, setCredentials } from '../config/google.js';

const router = express.Router();

/**
 * Send a transaction and notify via email
 */
router.post('/send', async (req, res) => {
  try {
    const { to, amount, network = 'sepolia', notifyEmail } = req.body;
    
    if (!to || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, amount' 
      });
    }
    
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount' 
      });
    }
    
    // Send transaction
    console.log(`\n🚀 Sending ${amount} ETH to ${to} on ${network}...`);
    const tx = await sendTransaction(to, amount, network);
    
    console.log(`📤 Transaction sent: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Log detailed transaction information with Blockscout links
    logTransactionDetails(tx, receipt, network);
    
    // Send email notification if requested and user is authenticated
    if (notifyEmail && req.session.tokens) {
      try {
        setCredentials(req.session.tokens);
        const gmail = getGmailClient();
        
        const emailBody = `
🎉 Transaction Successful!

📝 Transaction Hash: ${tx.hash}
💰 From: ${tx.from}
💰 To: ${tx.to}
💎 Amount: ${amount} ETH
🌐 Network: ${network}
🏗️  Block Number: ${receipt.blockNumber}
⛽ Gas Used: ${receipt.gasUsed.toString()}

🔗 View on MailPay Explorer: ${getExplorerUrl(tx.hash, network)}
📊 API Details: ${getBlockscoutApiUrl(tx.hash)}

✅ Status: Confirmed
⏰ Timestamp: ${new Date().toISOString()}

---
🚀 Sent via CrossMail - Blockchain Email Automation
        `.trim();
        
        const message = [
          `To: ${notifyEmail}`,
          `Subject: Transaction Confirmed - ${tx.hash}`,
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
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed'
      },
      explorerUrl: getExplorerUrl(tx.hash, network)
    });
    
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ 
      error: 'Transaction failed',
      message: error.message 
    });
  }
});

/**
 * Get transaction status
 */
router.get('/status/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const network = req.query.network || 'sepolia';
    
    const tx = await getTransaction(hash, network);
    
    if (!tx) {
      return res.status(404).json({ 
        error: 'Transaction not found' 
      });
    }
    
    res.json({
      success: true,
      transaction: {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value?.toString(),
        blockNumber: tx.blockNumber,
        confirmations: tx.confirmations,
        status: tx.blockNumber ? 'confirmed' : 'pending'
      },
      explorerUrl: getExplorerUrl(hash, network)
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get transaction status',
      message: error.message 
    });
  }
});

/**
 * Estimate gas for a transaction
 */
router.post('/estimate-gas', async (req, res) => {
  try {
    const { to, amount, network = 'sepolia' } = req.body;
    
    if (!to || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, amount' 
      });
    }
    
    const { getWallet } = await import('../config/wallet.js');
    const { ethers } = await import('ethers');
    const wallet = getWallet(network);
    
    const gasEstimate = await wallet.estimateGas({
      to: to,
      value: ethers.parseEther(amount.toString())
    });
    
    const gasPrice = (await wallet.provider.getFeeData()).gasPrice;
    const gasCost = gasEstimate * gasPrice;
    
    res.json({
      success: true,
      gasEstimate: gasEstimate.toString(),
      gasPrice: gasPrice.toString(),
      gasCost: ethers.formatEther(gasCost),
      totalCost: ethers.formatEther(ethers.parseEther(amount.toString()) + gasCost)
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to estimate gas',
      message: error.message 
    });
  }
});

/**
 * Send transaction notification email (standalone)
 */
router.post('/notify', async (req, res) => {
  try {
    const { email, transactionHash, network = 'sepolia' } = req.body;
    
    if (!email || !transactionHash) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, transactionHash' 
      });
    }
    
    if (!req.session.tokens) {
      return res.status(401).json({ 
        error: 'Not authenticated with Gmail' 
      });
    }
    
    // Get transaction details
    const tx = await getTransaction(transactionHash, network);
    
    if (!tx) {
      return res.status(404).json({ 
        error: 'Transaction not found' 
      });
    }
    
    // Send email
    setCredentials(req.session.tokens);
    const gmail = getGmailClient();
    
    const { ethers } = await import('ethers');
    const emailBody = `
Transaction Details

Hash: ${tx.hash}
From: ${tx.from}
To: ${tx.to}
Amount: ${ethers.formatEther(tx.value || 0)} ETH
Block: ${tx.blockNumber || 'Pending'}
Network: ${network}

View on Explorer: ${getExplorerUrl(transactionHash, network)}

---
Sent via CrossMail
    `.trim();
    
    const message = [
      `To: ${email}`,
      `Subject: Transaction Details - ${transactionHash.substring(0, 10)}...`,
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
    
    res.json({
      success: true,
      message: 'Email notification sent'
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send notification',
      message: error.message 
    });
  }
});

/**
 * Get Blockscout transaction details
 */
router.get('/blockscout/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const blockscoutUrl = getBlockscoutApiUrl(hash);
    const explorerUrl = getExplorerUrl(hash, 'custom');
    
    // Log the request
    console.log(`\n🔍 Fetching transaction details from Blockscout:`);
    console.log(`📝 Hash: ${hash}`);
    console.log(`🔗 Explorer: ${explorerUrl}`);
    console.log(`📊 API: ${blockscoutUrl}`);
    
    res.json({
      success: true,
      hash: hash,
      explorerUrl: explorerUrl,
      apiUrl: blockscoutUrl,
      blockscoutExplorer: 'https://mail-pay.cloud.blockscout.com',
      message: 'Use the explorerUrl to view transaction details in your MailPay Blockscout explorer'
    });
    
  } catch (error) {
    console.error('Blockscout lookup error:', error);
    res.status(500).json({ 
      error: 'Failed to get Blockscout details',
      message: error.message 
    });
  }
});

/**
 * Test Blockscout connectivity
 */
router.get('/test-blockscout', async (req, res) => {
  try {
    const explorerBase = 'https://mail-pay.cloud.blockscout.com';
    
    console.log(`\n🧪 Testing Blockscout connectivity:`);
    console.log(`🔗 Explorer: ${explorerBase}`);
    console.log(`📊 API Base: ${explorerBase}/api/v2`);
    
    res.json({
      success: true,
      explorerUrl: explorerBase,
      apiUrl: `${explorerBase}/api/v2`,
      status: 'Blockscout explorer configured',
      message: 'Your MailPay Blockscout explorer is ready to track transactions!'
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Blockscout test failed',
      message: error.message 
    });
  }
});

/**
 * Get explorer URL for a transaction
 */
function getExplorerUrl(hash, network) {
  // Use your actual Blockscout explorer endpoint
  const BLOCKSCOUT_EXPLORER = 'https://mail-pay.cloud.blockscout.com';
  
  // Fallback to public explorers if needed
  const publicExplorers = {
    ethereum: 'https://etherscan.io',
    sepolia: 'https://sepolia.etherscan.io',
    arbitrum: 'https://arbiscan.io',
    arbitrumSepolia: 'https://sepolia.arbiscan.io'
  };
  
  // Primary: Use your Blockscout explorer
  const explorerBase = BLOCKSCOUT_EXPLORER;
  
  return `${explorerBase}/tx/${hash}`;
}

/**
 * Get Blockscout API URL for transaction details
 */
function getBlockscoutApiUrl(hash) {
  return `https://mail-pay.cloud.blockscout.com/api/v2/transactions/${hash}`;
}

/**
 * Log transaction details to console with Blockscout links
 */
function logTransactionDetails(tx, receipt, network) {
  console.log('\n' + '='.repeat(80));
  console.log('🎉 TRANSACTION SUCCESSFUL!');
  console.log('='.repeat(80));
  console.log(`📝 Transaction Hash: ${tx.hash}`);
  console.log(`🔗 Blockscout Explorer: ${getExplorerUrl(tx.hash, network)}`);
  console.log(`📊 API Endpoint: ${getBlockscoutApiUrl(tx.hash)}`);
  console.log(`💰 From: ${tx.from}`);
  console.log(`💰 To: ${tx.to}`);
  console.log(`💎 Amount: ${tx.value ? (parseFloat(tx.value.toString()) / 1e18).toFixed(6) : '0'} ETH`);
  console.log(`🏗️  Block Number: ${receipt.blockNumber}`);
  console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
  console.log(`🌐 Network: ${network}`);
  console.log(`✅ Status: ${receipt.status === 1 ? 'SUCCESS' : 'FAILED'}`);
  console.log('='.repeat(80));
  console.log('🔍 View transaction details at:');
  console.log(`   ${getExplorerUrl(tx.hash, network)}`);
  console.log('='.repeat(80) + '\n');
}

export default router;
