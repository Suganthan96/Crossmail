import { getGmailClient, setCredentials } from '../config/google.js';
import { sendETHViaContract } from '../config/contract.js';
import processedEmailsStore from '../utils/processed-emails.js';

class EmailMonitorService {
  constructor() {
    this.isMonitoring = false;
    this.checkInterval = 10000; // Check every 10 seconds
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

    // Show processed emails stats
    const stats = processedEmailsStore.getStats();
    
    console.log(`\n✅ Email monitoring started for ${userEmail}`);
    console.log(`🔄 Checking for new emails every ${this.checkInterval / 1000} seconds`);
    console.log(`📊 Processed emails: ${stats.total} total (${stats.completed} completed, ${stats.failed} failed)`);
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
    console.log('❌ Email monitoring stopped');
    // Note: We don't clear processed emails store as it persists across restarts
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
      // Exclude replies, confirmations, and system emails
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: `from:${this.userEmail} newer_than:1h -subject:"TRANSACTION COMPLETED" -subject:"Re:" -subject:"✅" -is:chat -label:crossmail-processed`, 
        maxResults: 10
      });

      if (!response.data.messages || response.data.messages.length === 0) {
        return;
      }

      // Process each message
      for (const message of response.data.messages) {
        // Skip if already processed in persistent storage
        if (processedEmailsStore.isProcessed(message.id)) {
          continue;
        }

        // Also check if email has the processed label (double verification)
        const hasLabel = await this.hasProcessedLabel(gmail, message.id);
        if (hasLabel) {
          // Mark in persistent storage if it has the label but not in storage
          processedEmailsStore.markAsProcessed(message.id, null, 'labeled_processed');
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
      const to = headers.find(h => h.name === 'To')?.value || '';
      const inReplyTo = headers.find(h => h.name === 'In-Reply-To')?.value || '';
      
      // Get email body first
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

      // Skip system-generated emails and replies
      if (this.isSystemEmail(subject, emailBody, from, to, inReplyTo)) {
        processedEmailsStore.markAsProcessed(messageId, null, 'skipped_system_email');
        return;
      }

      // Extract wallet address and amount
      const walletAddress = this.extractWalletAddress(emailBody + ' ' + subject);
      
      if (!walletAddress) {
        // No wallet address found, skip this email
        processedEmailsStore.markAsProcessed(messageId, null, 'skipped_no_wallet');
        return;
      }

      const amount = this.extractAmount(emailBody + ' ' + subject);

      console.log('\n📬 New email detected!');
      console.log(`   From: ${from}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Wallet Address: ${walletAddress}`);
      console.log(`   Amount: ${amount} ETH`);

      // Send ETH via smart contract
      console.log(`\n💸 Sending ${amount} ETH to ${walletAddress}...`);
      const result = await sendETHViaContract(walletAddress, amount);

      console.log('✅ Transaction successful!');
      console.log(`   Transaction Hash: ${result.tx.hash}`);
      console.log(`   Gas Used: ${result.receipt.gasUsed}`);
      console.log(`   View on MailPay Explorer: https://mail-pay.cloud.blockscout.com/tx/${result.tx.hash}`);

      // Mark as successfully processed with transaction hash
      processedEmailsStore.markAsProcessed(messageId, result.tx.hash, 'completed');

      // Send confirmation email as a REPLY to the original email
      await this.sendConfirmationEmail(gmail, walletAddress, amount, result, message);

    } catch (error) {
      console.error(`❌ Error processing email ${messageId}:`, error.message);
      // Mark as failed in persistent storage
      processedEmailsStore.markAsFailed(messageId, error);
    }
  }

  /**
   * Check if email is a system-generated email that should be ignored
   */
  isSystemEmail(subject, body, from, to, inReplyTo) {
    console.log(`   🔍 Checking email: "${subject}"`);
    
    // Skip confirmation emails with multiple patterns
    if (subject.includes('✅') || 
        subject.includes('TRANSACTION COMPLETED') ||
        subject.includes('ETH Transaction Confirmed')) {
      console.log('   ⏭️ Skipping: Transaction confirmation email');
      return true;
    }
    
    // Skip replies (Re: prefix)
    if (subject.startsWith('Re:')) {
      console.log('   ⏭️ Skipping: Reply email');
      return true;
    }
    
    // Skip if it's a reply to another email
    if (inReplyTo) {
      console.log('   ⏭️ Skipping: Reply to existing thread');
      return true;
    }
    
    // Skip emails that contain transaction confirmation signatures
    if (body.includes('CrossMail Transaction Bot') || 
        body.includes('⚡ Powered by CrossMail') ||
        body.includes('🤖 Automated Email-to-Blockchain Transaction') ||
        body.includes('🎉 TRANSACTION SUCCESSFULLY COMPLETED') ||
        body.includes('This email is marked as PROCESSED')) {
      console.log('   ⏭️ Skipping: System-generated confirmation');
      return true;
    }
    
    // Skip emails that don't contain wallet addresses (not payment intents)
    const hasWalletAddress = /\b(0x[a-fA-F0-9]{40})\b/.test(body + ' ' + subject);
    if (!hasWalletAddress) {
      console.log('   ⏭️ Skipping: No wallet address found');
      return true;
    }
    
    // Skip drafts and scheduled emails
    if (body.includes('[DRAFT]') || body.includes('[SCHEDULED]')) {
      console.log('   ⏭️ Skipping: Draft or scheduled email');
      return true;
    }
    
    console.log('   ✅ Email is valid for processing');
    return false;
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
    // More robust amount extraction
    const patterns = [
      /(\d+\.?\d*)\s*ETH/i,                    // "0.001 ETH"
      /Send\s+.*?(\d+\.?\d*)/i,               // "Send Sepolia ETH 0.001"
      /(\d+\.?\d*)\s*sepolia/i,               // "0.001 sepolia"
      /(\d+\.?\d*)\s*(?:eth|sepolia|ether)/i  // Generic patterns
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && parseFloat(match[1]) > 0) {
        return parseFloat(match[1]);
      }
    }
    
    return 0.001; // Default to 0.001 ETH if no amount found
  }

  /**
   * Send confirmation email as a REPLY to the original email
   */
  async sendConfirmationEmail(gmail, toAddress, amount, txResult, originalMessage) {
    try {
      // Get original message details for reply
      const headers = originalMessage.data.payload.headers;
      const originalSubject = headers.find(h => h.name === 'Subject')?.value || '';
      const originalMessageId = headers.find(h => h.name === 'Message-ID')?.value || '';
      const originalFrom = headers.find(h => h.name === 'From')?.value || '';
      
      const replySubject = originalSubject.startsWith('Re: ') 
        ? originalSubject 
        : `Re: ${originalSubject}`;

      const emailContent = [
        'From: CrossMail Transaction Bot <me>',
        `To: ${this.userEmail}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${replySubject} - ✅ TRANSACTION COMPLETED`,
        ...(originalMessageId ? [`In-Reply-To: ${originalMessageId}`] : []),
        ...(originalMessageId ? [`References: ${originalMessageId}`] : []),
        '',
        `🎉 TRANSACTION SUCCESSFULLY COMPLETED!`,
        ``,
        `Your CrossMail transaction has been executed:`,
        ``,
        `📊 Transaction Details:`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `💰 Amount: ${amount} ETH`,
        `📫 To: ${toAddress}`,
        `🔗 Transaction Hash: ${txResult.tx.hash}`,
        `⛽ Gas Used: ${txResult.receipt.gasUsed}`,
        `📅 Block: ${txResult.receipt.blockNumber}`,
        ``,
        `🔍 View on MailPay Explorer:`,
        `https://mail-pay.cloud.blockscout.com/tx/${txResult.tx.hash}`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `⚡ Powered by CrossMail`,
        `🤖 Automated Email-to-Blockchain Transaction`,
        ``,
        `🔖 This email is marked as PROCESSED - it will not trigger another transaction.`
      ].join('\r\n');

      const encodedMessage = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send the reply
      const sentMessage = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
          threadId: originalMessage.data.threadId // Keep in same thread
        }
      });

      // Add a custom label to mark the original email as processed
      try {
        await this.addProcessedLabel(gmail, originalMessage.data.id);
      } catch (labelError) {
        console.log('Note: Could not add processed label:', labelError.message);
      }

      console.log('📧 Confirmation reply sent!');
      console.log(`   Reply ID: ${sentMessage.data.id}`);
      console.log(`   Thread ID: ${sentMessage.data.threadId}`);
      
      return sentMessage;
    } catch (error) {
      console.error('Error sending confirmation reply:', error.message);
      throw error;
    }
  }

  /**
   * Add a "CrossMail-Processed" label to mark emails as processed
   */
  async addProcessedLabel(gmail, messageId) {
    try {
      // First, try to get or create the CrossMail-Processed label
      let labelId = await this.getOrCreateProcessedLabel(gmail);
      
      // Apply the label to the message
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: [labelId],
          removeLabelIds: []
        }
      });
      
      console.log(`🏷️ Added "CrossMail-Processed" label to email ${messageId}`);
    } catch (error) {
      console.error('Error adding processed label:', error.message);
    }
  }

  /**
   * Get or create the CrossMail-Processed label
   */
  async getOrCreateProcessedLabel(gmail) {
    try {
      // List existing labels
      const response = await gmail.users.labels.list({ userId: 'me' });
      const labels = response.data.labels || [];
      
      // Look for existing CrossMail-Processed label
      const existingLabel = labels.find(label => 
        label.name === 'CrossMail-Processed'
      );
      
      if (existingLabel) {
        return existingLabel.id;
      }
      
      // Create new label if it doesn't exist
      const newLabel = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: 'CrossMail-Processed',
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
          color: {
            textColor: '#ffffff',
            backgroundColor: '#16a085' // Teal green
          }
        }
      });
      
      console.log('✅ Created "CrossMail-Processed" label');
      return newLabel.data.id;
    } catch (error) {
      console.error('Error managing processed label:', error.message);
      throw error;
    }
  }

  /**
   * Check if an email has the processed label
   */
  async hasProcessedLabel(gmail, messageId) {
    try {
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'minimal'
      });
      
      const labelId = await this.getOrCreateProcessedLabel(gmail);
      return message.data.labelIds?.includes(labelId) || false;
    } catch (error) {
      console.error('Error checking processed label:', error.message);
      return false;
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
    const stats = processedEmailsStore.getStats();
    
    return {
      isMonitoring: this.isMonitoring,
      userEmail: this.userEmail,
      processedCount: stats.total,
      completedCount: stats.completed,
      failedCount: stats.failed,
      recentCount: stats.recent,
      checkInterval: this.checkInterval
    };
  }
}

// Create singleton instance
const emailMonitorService = new EmailMonitorService();

export default emailMonitorService;
