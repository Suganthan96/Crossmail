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
    console.log(`Sending ${amount} ETH to ${to} on ${network}...`);
    const tx = await sendTransaction(to, amount, network);
    
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Waiting for confirmation...`);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Send email notification if requested and user is authenticated
    if (notifyEmail && req.session.tokens) {
      try {
        setCredentials(req.session.tokens);
        const gmail = getGmailClient();
        
        const emailBody = `
Transaction Successful!

Transaction Hash: ${tx.hash}
From: ${tx.from}
To: ${tx.to}
Amount: ${amount} ETH
Network: ${network}
Block Number: ${receipt.blockNumber}
Gas Used: ${receipt.gasUsed.toString()}

View on Explorer: ${getExplorerUrl(tx.hash, network)}

---
Sent via CrossMail
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
 * Get explorer URL for a transaction
 */
function getExplorerUrl(hash, network) {
  const explorers = {
    ethereum: 'https://etherscan.io',
    sepolia: 'https://sepolia.etherscan.io',
    arbitrum: 'https://arbiscan.io',
    arbitrumSepolia: 'https://sepolia.arbiscan.io'
  };
  
  const explorerBase = explorers[network] || explorers.sepolia;
  return `${explorerBase}/tx/${hash}`;
}

export default router;
