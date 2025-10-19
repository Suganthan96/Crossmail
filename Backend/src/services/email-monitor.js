import { getGmailClient, setCredentials } from '../config/google.js';
import { sendETHViaContract } from '../config/contract.js';

class EmailMonitorService {
  constructor() {
    this.isMonitoring = false;
    this.checkInterval = 10000; // Check every 10 seconds
    this.processedMessages = new Set(); // Track processed message IDs
    this.userTokens = null;
    this.userEmail = null;
  }

  /**
   * Start monitoring for new emails
   */
  startMonitoring(userEmail, tokens) {
    if (this.isMonitoring) {
      console.log('📧 Email monitoring is already active');
      return;
    }

    this.userEmail = userEmail;
    this.userTokens = tokens;
    this.isMonitoring = true;

    console.log(`\n✅ Email monitoring started for ${userEmail}`);
    console.log(`🔄 Checking for new emails every ${this.checkInterval / 1000} seconds`);
    console.log(`📝 To trigger a transaction, compose an email with:`);
    console.log(`   - Subject: Any text`);
    console.log(`   - Body: Include wallet address (0x...) and optionally amount (e.g., "0.01 ETH")`);
    console.log(`   - Hit SEND button in Gmail\n`);

    this.monitorLoop();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    this.processedMessages.clear();
    console.log('❌ Email monitoring stopped');
  }

  /**
   * Main monitoring loop
   */
  async monitorLoop() {
    while (this.isMonitoring) {
      try {
        await this.checkForNewEmails();
      } catch (error) {
        console.error('❌ Error in monitoring loop:', error.message);
      }

      // Wait before next check
      await this.sleep(this.checkInterval);
    }
  }

  /**
   * Check for new emails with wallet addresses
   */
  async checkForNewEmails() {
    try {
      // Set credentials for Gmail API
      setCredentials(this.userTokens);
      const gmail = getGmailClient();

      // Search for recent emails from the user (sent emails)
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: `from:${this.userEmail} newer_than:1h`, // Check emails sent in last hour
        maxResults: 10
      });

      if (!response.data.messages || response.data.messages.length === 0) {
        return;
      }

      // Process each message
      for (const message of response.data.messages) {
        // Skip if already processed
        if (this.processedMessages.has(message.id)) {
          continue;
        }

        await this.processEmail(gmail, message.id);
      }
    } catch (error) {
      console.error('Error checking emails:', error.message);
    }
  }

  /**
   * Process a single email
   */
  async processEmail(gmail, messageId) {
    try {
      // Get full message details
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      // Extract email content
      const headers = message.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      
      // Get email body
      let emailBody = '';
      if (message.data.payload.parts) {
        const textPart = message.data.payload.parts.find(
          part => part.mimeType === 'text/plain'
        );
        if (textPart && textPart.body.data) {
          emailBody = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      } else if (message.data.payload.body.data) {
        emailBody = Buffer.from(message.data.payload.body.data, 'base64').toString('utf-8');
      }

      // Extract wallet address and amount
      const walletAddress = this.extractWalletAddress(emailBody + ' ' + subject);
      
      if (!walletAddress) {
        // No wallet address found, skip this email
        this.processedMessages.add(messageId);
        return;
      }

      const amount = this.extractAmount(emailBody + ' ' + subject);

      console.log('\n📬 New email detected!');
      console.log(`   From: ${from}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Wallet Address: ${walletAddress}`);
      console.log(`   Amount: ${amount} ETH`);

      // Mark as processed before attempting transaction
      this.processedMessages.add(messageId);

      // Send ETH via smart contract
      console.log(`\n💸 Sending ${amount} ETH to ${walletAddress}...`);
      const result = await sendETHViaContract(walletAddress, amount);

      console.log('✅ Transaction successful!');
      console.log(`   Transaction Hash: ${result.txHash}`);
      console.log(`   Gas Used: ${result.gasUsed}`);
      console.log(`   View on Sepolia: https://sepolia.etherscan.io/tx/${result.txHash}`);

      // Send confirmation email
      await this.sendConfirmationEmail(gmail, walletAddress, amount, result);

    } catch (error) {
      console.error(`❌ Error processing email ${messageId}:`, error.message);
      // Still mark as processed to avoid retry loops
      this.processedMessages.add(messageId);
    }
  }

  /**
   * Extract wallet address from text
   */
  extractWalletAddress(text) {
    const addressRegex = /\b(0x[a-fA-F0-9]{40})\b/g;
    const matches = text.match(addressRegex);
    return matches ? matches[0] : null;
  }

  /**
   * Extract amount from text
   */
  extractAmount(text) {
    const amountRegex = /(\d+\.?\d*)\s*(ETH|eth|Eth)?/;
    const match = text.match(amountRegex);
    return match ? parseFloat(match[1]) : 0.01; // Default to 0.01 ETH
  }

  /**
   * Send confirmation email back to user
   */
  async sendConfirmationEmail(gmail, toAddress, amount, txResult) {
    try {
      const emailContent = [
        'From: CrossMail Transaction Bot <me>',
        `To: ${this.userEmail}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ✅ ETH Transaction Confirmed - ${txResult.txHash.slice(0, 10)}...`,
        '',
        `Your transaction has been successfully executed!`,
        '',
        `📊 Transaction Details:`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `💰 Amount: ${amount} ETH`,
        `📫 To: ${toAddress}`,
        `🔗 Transaction Hash: ${txResult.txHash}`,
        `⛽ Gas Used: ${txResult.gasUsed}`,
        ``,
        `🔍 View on Sepolia Etherscan:`,
        `https://sepolia.etherscan.io/tx/${txResult.txHash}`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `⚡ Powered by CrossMail`,
        `🤖 Automated Email-to-Blockchain Transaction`
      ].join('\r\n');

      const encodedMessage = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      console.log('📧 Confirmation email sent!');
    } catch (error) {
      console.error('Error sending confirmation email:', error.message);
    }
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      userEmail: this.userEmail,
      processedCount: this.processedMessages.size,
      checkInterval: this.checkInterval
    };
  }
}

// Create singleton instance
const emailMonitorService = new EmailMonitorService();

export default emailMonitorService;
