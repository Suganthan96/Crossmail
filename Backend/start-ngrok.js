import ngrok from 'ngrok';

async function startNgrok() {
  try {
    console.log('Starting ngrok tunnel...');
    
    const url = await ngrok.connect({
      addr: 3001,
      authtoken: '34HR9eaf0WtHCmynzMNh33FgKuE_2Vp1rCBVQ8VhdXGe6chcX'
    });
    
    console.log('\n✅ ngrok tunnel is active!');
    console.log(`🌐 Public URL: ${url}`);
    console.log('\n📝 Update your .env file:');
    console.log(`   GOOGLE_REDIRECT_URI=${url}/api/auth/callback`);
    console.log('\n⚠️  Keep this terminal open to maintain the tunnel');
    console.log('   Press Ctrl+C to stop\n');
    
  } catch (error) {
    console.error('❌ Error starting ngrok:', error.message);
    process.exit(1);
  }
}

startNgrok();

// Keep the process running
process.on('SIGINT', async () => {
  console.log('\n\nStopping ngrok...');
  await ngrok.disconnect();
  await ngrok.kill();
  process.exit(0);
});
