import express from 'express';
import { 
  getWalletAddress, 
  getBalance, 
  getNetworkInfo,
  getTransaction 
} from '../config/wallet.js';

const router = express.Router();

/**
 * Get wallet address
 */
router.get('/address', (req, res) => {
  try {
    const address = getWalletAddress();
    res.json({ 
      success: true,
      address 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get wallet address',
      message: error.message 
    });
  }
});

/**
 * Get wallet balance
 */
router.get('/balance/:address?', async (req, res) => {
  try {
    const address = req.params.address || getWalletAddress();
    const network = req.query.network || 'sepolia';
    
    const balance = await getBalance(address, network);
    
    res.json({ 
      success: true,
      address,
      balance,
      network: getNetworkInfo(network).name
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get balance',
      message: error.message 
    });
  }
});

/**
 * Get transaction details
 */
router.get('/transaction/:hash', async (req, res) => {
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
        gasPrice: tx.gasPrice?.toString(),
        gasLimit: tx.gasLimit?.toString()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get transaction',
      message: error.message 
    });
  }
});

/**
 * Get supported networks
 */
router.get('/networks', (req, res) => {
  res.json({
    success: true,
    networks: [
      getNetworkInfo('ethereum'),
      getNetworkInfo('sepolia'),
      getNetworkInfo('arbitrum'),
      getNetworkInfo('arbitrumSepolia')
    ]
  });
});

/**
 * Verify wallet ownership (for linking with email)
 */
router.post('/verify', async (req, res) => {
  try {
    const { address, signature, message } = req.body;
    
    if (!address || !signature || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: address, signature, message' 
      });
    }
    
    // Verify signature
    const { ethers } = await import('ethers');
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
    
    res.json({
      success: true,
      verified: isValid,
      address: recoveredAddress
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Verification failed',
      message: error.message 
    });
  }
});

export default router;
