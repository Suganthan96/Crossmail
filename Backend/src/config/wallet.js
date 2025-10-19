import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Blockchain network configuration
const NETWORKS = {
  ethereum: {
    name: 'Ethereum Mainnet',
    rpc: 'https://eth.llamarpc.com',
    chainId: 1,
    explorer: 'https://etherscan.io'
  },
  sepolia: {
    name: 'Sepolia Testnet',
    rpc: 'https://eth-sepolia.g.alchemy.com/v2/demo',
    chainId: 11155111,
    explorer: 'https://sepolia.etherscan.io'
  },
  arbitrum: {
    name: 'Arbitrum One',
    rpc: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    explorer: 'https://arbiscan.io'
  },
  arbitrumSepolia: {
    name: 'Arbitrum Sepolia',
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    chainId: 421614,
    explorer: 'https://sepolia.arbiscan.io'
  }
};

/**
 * Get provider for specific network with fallback RPCs
 */
export function getProvider(network = 'sepolia') {
  const networkConfig = NETWORKS[network];
  if (!networkConfig) {
    throw new Error(`Network ${network} not supported`);
  }
  
  // Try multiple RPC endpoints for better reliability
  const rpcUrls = network === 'sepolia' ? [
    ...(process.env.ALCHEMY_API_KEY && process.env.ALCHEMY_API_KEY !== 'your_alchemy_api_key_here' 
       ? [`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`] 
       : []),
    ...(process.env.INFURA_API_KEY && process.env.INFURA_API_KEY !== 'your_infura_api_key_here'
       ? [`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`]
       : []),
    'https://1rpc.io/sepolia',
    'https://rpc.ankr.com/eth_sepolia',
    'https://sepolia.gateway.tenderly.co',
    'https://ethereum-sepolia-rpc.publicnode.com'
  ] : [networkConfig.rpc];
  
  // Try each RPC until one works
  for (const rpc of rpcUrls) {
    try {
      return new ethers.JsonRpcProvider(rpc);
    } catch (error) {
      console.log(`RPC ${rpc} failed, trying next...`);
      continue;
    }
  }
  
  // Fallback to original if all fail
  return new ethers.JsonRpcProvider(networkConfig.rpc);
}

/**
 * Get wallet instance
 */
export function getWallet(network = 'sepolia') {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('WALLET_PRIVATE_KEY not set in environment variables');
  }
  
  const provider = getProvider(network);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Get wallet address from private key
 */
export function getWalletAddress() {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    return process.env.DEFAULT_WALLET;
  }
  
  try {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return process.env.DEFAULT_WALLET;
  }
}

/**
 * Get wallet balance
 */
export async function getBalance(address, network = 'sepolia') {
  const provider = getProvider(network);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/**
 * Send transaction
 */
export async function sendTransaction(to, amount, network = 'sepolia') {
  const wallet = getWallet(network);
  
  const tx = await wallet.sendTransaction({
    to: to,
    value: ethers.parseEther(amount.toString())
  });
  
  return tx;
}

/**
 * Get transaction details
 */
export async function getTransaction(txHash, network = 'sepolia') {
  const provider = getProvider(network);
  const tx = await provider.getTransaction(txHash);
  return tx;
}

/**
 * Get network info
 */
export function getNetworkInfo(network = 'sepolia') {
  return NETWORKS[network];
}

export default {
  NETWORKS,
  getProvider,
  getWallet,
  getWalletAddress,
  getBalance,
  sendTransaction,
  getTransaction,
  getNetworkInfo
};
