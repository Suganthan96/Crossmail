import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File to store processed email IDs
const PROCESSED_EMAILS_FILE = path.join(__dirname, '../../data/processed-emails.json');

class ProcessedEmailsStore {
  constructor() {
    this.processedEmails = new Map();
    this.loadFromFile();
  }

  /**
   * Load processed emails from file
   */
  loadFromFile() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(PROCESSED_EMAILS_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Load existing data
      if (fs.existsSync(PROCESSED_EMAILS_FILE)) {
        const data = fs.readFileSync(PROCESSED_EMAILS_FILE, 'utf8');
        const parsed = JSON.parse(data);
        
        // Convert array back to Map with timestamp info
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            this.processedEmails.set(item.messageId, {
              timestamp: item.timestamp,
              txHash: item.txHash || null,
              status: item.status || 'completed'
            });
          });
        }
        
        console.log(`📁 Loaded ${this.processedEmails.size} previously processed emails`);
        
        // Clean up old entries (older than 30 days)
        this.cleanup();
      }
    } catch (error) {
      console.error('Error loading processed emails:', error.message);
      this.processedEmails = new Map();
    }
  }

  /**
   * Save processed emails to file
   */
  saveToFile() {
    try {
      const dataToSave = Array.from(this.processedEmails.entries()).map(([messageId, data]) => ({
        messageId,
        timestamp: data.timestamp,
        txHash: data.txHash,
        status: data.status
      }));

      fs.writeFileSync(PROCESSED_EMAILS_FILE, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('Error saving processed emails:', error.message);
    }
  }

  /**
   * Check if email has been processed
   */
  isProcessed(messageId) {
    return this.processedEmails.has(messageId);
  }

  /**
   * Mark email as processed
   */
  markAsProcessed(messageId, txHash = null, status = 'completed') {
    this.processedEmails.set(messageId, {
      timestamp: Date.now(),
      txHash,
      status
    });
    
    // Save to file immediately
    this.saveToFile();
    
    console.log(`✅ Email ${messageId} marked as processed (${status})`);
  }

  /**
   * Mark email as failed
   */
  markAsFailed(messageId, error = null) {
    this.processedEmails.set(messageId, {
      timestamp: Date.now(),
      txHash: null,
      status: 'failed',
      error: error?.message || 'Unknown error'
    });
    
    this.saveToFile();
    console.log(`❌ Email ${messageId} marked as failed`);
  }

  /**
   * Get processing info for an email
   */
  getProcessingInfo(messageId) {
    return this.processedEmails.get(messageId);
  }

  /**
   * Clean up old processed emails (older than 30 days)
   */
  cleanup() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [messageId, data] of this.processedEmails.entries()) {
      if (data.timestamp < thirtyDaysAgo) {
        this.processedEmails.delete(messageId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old processed email records`);
      this.saveToFile();
    }
  }

  /**
   * Get stats
   */
  getStats() {
    const stats = {
      total: this.processedEmails.size,
      completed: 0,
      failed: 0,
      recent: 0 // last 24 hours
    };

    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    for (const data of this.processedEmails.values()) {
      if (data.status === 'completed') stats.completed++;
      if (data.status === 'failed') stats.failed++;
      if (data.timestamp > oneDayAgo) stats.recent++;
    }

    return stats;
  }

  /**
   * Clear all processed emails (for testing)
   */
  clear() {
    this.processedEmails.clear();
    this.saveToFile();
    console.log('🗑️ Cleared all processed email records');
  }
}

// Create singleton instance
const processedEmailsStore = new ProcessedEmailsStore();

export default processedEmailsStore;