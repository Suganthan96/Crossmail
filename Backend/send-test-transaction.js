#!/usr/bin/env node

/**
 * Send a test transaction and track it on Blockscout
 * This script demonstrates the complete flow from transaction to explorer
 */

import fetch from 'node-fetch';
import readline from 'readline';

const SERVER_BASE = 'http://localhost:3001';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function sendTestTransaction() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 SEND TEST TRANSACTION WITH BLOCKSCOUT TRACKING');
  console.log('='.repeat(80));
  
  try {
    // Get transaction details from user
    console.log('\n📝 Enter transaction details:');
    const toAddress = await askQuestion('💰 To Address (0x...): ');
    const amount = await askQuestion('💎 Amount (ETH): ');
    const network = await askQuestion('🌐 Network (sepolia/arbitrumSepolia) [sepolia]: ') || 'sepolia';
    const notifyEmail = await askQuestion('📧 Notification Email (optional): ');
    
    if (!toAddress || !amount) {
      console.log('❌ Missing required fields!');
      rl.close();
      return;
    }
    
    // Prepare transaction data
    const transactionData = {
      to: toAddress,
      amount: amount,
      network: network,
      notifyEmail: notifyEmail || undefined
    };
    
    console.log('\n🔄 Sending transaction...');
    console.log('📋 Transaction Data:', JSON.stringify(transactionData, null, 2));
    
    // Send transaction
    const response = await fetch(`${SERVER_BASE}/api/transaction/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('\n' + '='.repeat(80));
      console.log('🎉 TRANSACTION SUCCESSFUL!');
      console.log('='.repeat(80));
      console.log(`📝 Hash: ${result.transaction.hash}`);
      console.log(`🔗 Blockscout Explorer: ${result.explorerUrl}`);
      console.log(`💰 From: ${result.transaction.from}`);
      console.log(`💰 To: ${result.transaction.to}`);
      console.log(`💎 Amount: ${amount} ETH`);
      console.log(`🏗️  Block: ${result.transaction.blockNumber}`);
      console.log(`✅ Status: ${result.transaction.status}`);
      console.log('='.repeat(80));
      console.log('\n🔍 View your transaction at:');
      console.log(`   ${result.explorerUrl}`);
      console.log('\n📊 Get transaction details via API:');
      console.log(`   ${SERVER_BASE}/api/transaction/blockscout/${result.transaction.hash}`);
      
      // Test the Blockscout lookup
      console.log('\n🧪 Testing Blockscout lookup...');
      const lookupResponse = await fetch(`${SERVER_BASE}/api/transaction/blockscout/${result.transaction.hash}`);
      const lookupData = await lookupResponse.json();
      
      if (lookupResponse.ok) {
        console.log('✅ Blockscout lookup successful!');
        console.log('📋 Lookup Data:', JSON.stringify(lookupData, null, 2));
      } else {
        console.log('❌ Blockscout lookup failed:', lookupData.error);
      }
      
    } else {
      console.log('\n❌ TRANSACTION FAILED!');
      console.log('Error:', result.error);
      console.log('Message:', result.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Your backend server is running (npm run dev)');
    console.log('   2. Your wallet is configured in .env');
    console.log('   3. You have sufficient balance for the transaction');
  } finally {
    rl.close();
  }
}

// Run the transaction test
sendTestTransaction();
