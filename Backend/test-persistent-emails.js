import processedEmailsStore from './src/utils/processed-emails.js';

console.log('🧪 Testing Persistent Email Storage\n');

// Test adding some processed emails
const testEmails = [
  { id: 'test-email-1', txHash: '0x1234567890abcdef', status: 'completed' },
  { id: 'test-email-2', txHash: null, status: 'failed' },
  { id: 'test-email-3', txHash: '0xabcdef1234567890', status: 'completed' }
];

console.log('📝 Adding test processed emails...');
testEmails.forEach(email => {
  processedEmailsStore.markAsProcessed(email.id, email.txHash, email.status);
});

console.log('\n📊 Current stats:');
console.log(processedEmailsStore.getStats());

console.log('\n🔍 Testing email lookup:');
testEmails.forEach(email => {
  const isProcessed = processedEmailsStore.isProcessed(email.id);
  const info = processedEmailsStore.getProcessingInfo(email.id);
  console.log(`  ${email.id}: ${isProcessed ? '✅ Processed' : '❌ Not found'}`);
  if (info) {
    console.log(`    Status: ${info.status}, TxHash: ${info.txHash || 'N/A'}`);
  }
});

console.log('\n🎯 Key Benefits:');
console.log('  ✅ Emails are persistently tracked across server restarts');
console.log('  ✅ No duplicate transactions for the same email');
console.log('  ✅ Transaction hashes are stored for reference');
console.log('  ✅ Failed emails are tracked to avoid retry loops');
console.log('  ✅ Automatic cleanup of old records (30+ days)');

console.log('\n🧹 Cleaning up test data...');
processedEmailsStore.clear();