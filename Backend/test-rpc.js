import { getProvider, getWalletAddress, getBalance } from './src/config/wallet.js';
import dotenv from 'dotenv';

dotenv.config();

async function testRPCConnection() {
  console.log('🧪 Testing RPC Connection...\n');
  
  try {
    const provider = getProvider('sepolia');
    const network = await provider.getNetwork();
    console.log('✅ RPC Connection successful!');
    console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    const walletAddress = getWalletAddress();
    console.log(`   Wallet: ${walletAddress}`);
    
    const balance = await getBalance(walletAddress, 'sepolia');
    console.log(`   Balance: ${balance} ETH\n`);
    
    if (parseFloat(balance) < 0.01) {
      console.log('⚠️  Warning: Low balance! You need Sepolia ETH to send transactions.');
      console.log('   Get free Sepolia ETH from: https://sepoliafaucet.com/');
    }
    
  } catch (error) {
    console.error('❌ RPC Connection failed:', error.message);
  }
}

testRPCConnection();