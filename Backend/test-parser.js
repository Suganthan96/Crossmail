import emailMonitorService from './src/services/email-monitor.js';

// Test the improved amount parsing
const testEmails = [
  "wallet: 0xC7606d2BD6D0D57551d4aEdb2DE74640852fCc70\nSend Sepolia ETH 0.001",
  "Send 0.001 ETH to 0xC7606d2BD6D0D57551d4aEdb2DE74640852fCc70",
  "0.001 sepolia to 0xC7606d2BD6D0D57551d4aEdb2DE74640852fCc70",
  "Send Sepolia ETH 0.001"
];

console.log('🧪 Testing Email Parser Improvements:\n');

testEmails.forEach((email, index) => {
  const wallet = emailMonitorService.extractWalletAddress(email);
  const amount = emailMonitorService.extractAmount(email);
  
  console.log(`Test ${index + 1}:`);
  console.log(`   Email: "${email}"`);
  console.log(`   Wallet: ${wallet}`);
  console.log(`   Amount: ${amount} ETH`);
  console.log('');
});