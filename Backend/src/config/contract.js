import { ethers } from 'ethers';
import { getWallet, getProvider } from './wallet.js';
import dotenv from 'dotenv';

dotenv.config();

// Your SendETH contract ABI
const SEND_ETH_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ETHSent",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_to",
        "type": "address"
      }
    ],
    "name": "sendETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// Contract address - you'll need to set this in .env
const CONTRACT_ADDRESS = process.env.SEND_ETH_CONTRACT_ADDRESS;

/**
 * Get contract instance
 */
export function getContract(network = 'sepolia') {
  const wallet = getWallet(network);
  return new ethers.Contract(CONTRACT_ADDRESS, SEND_ETH_ABI, wallet);
}

/**
 * Send ETH using the smart contract
 */
export async function sendETHViaContract(to, amount, network = 'sepolia') {
  try {
    const contract = getContract(network);
    const amountInWei = ethers.parseEther(amount.toString());
    
    console.log(`Sending ${amount} ETH to ${to} via contract...`);
    
    // Call the sendETH function with the value
    const tx = await contract.sendETH(to, {
      value: amountInWei,
      gasLimit: 100000 // Adjust as needed
    });
    
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Waiting for confirmation...`);
    
    const receipt = await tx.wait();
    
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Parse the ETHSent event
    const event = receipt.logs
      .map(log => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find(log => log && log.name === 'ETHSent');
    
    return {
      tx,
      receipt,
      event: event ? {
        from: event.args.from,
        to: event.args.to,
        amount: ethers.formatEther(event.args.amount),
        timestamp: Number(event.args.timestamp)
      } : null
    };
  } catch (error) {
    console.error('Contract transaction error:', error);
    throw error;
  }
}

/**
 * Estimate gas for contract transaction
 */
export async function estimateContractGas(to, amount, network = 'sepolia') {
  try {
    const contract = getContract(network);
    const amountInWei = ethers.parseEther(amount.toString());
    
    const gasEstimate = await contract.sendETH.estimateGas(to, {
      value: amountInWei
    });
    
    const provider = getProvider(network);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const gasCost = gasEstimate * gasPrice;
    
    return {
      gasEstimate: gasEstimate.toString(),
      gasPrice: gasPrice.toString(),
      gasCost: ethers.formatEther(gasCost),
      totalCost: ethers.formatEther(amountInWei + gasCost)
    };
  } catch (error) {
    console.error('Gas estimation error:', error);
    throw error;
  }
}

export default {
  getContract,
  sendETHViaContract,
  estimateContractGas,
  CONTRACT_ADDRESS
};
