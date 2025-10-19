import express from 'express';
import processedEmailsStore from '../utils/processed-emails.js';

const router = express.Router();

/**
 * Get processed emails statistics
 */
router.get('/stats', (req, res) => {
  const stats = processedEmailsStore.getStats();
  res.json({
    success: true,
    stats
  });
});

/**
 * Get processing info for a specific email ID
 */
router.get('/info/:messageId', (req, res) => {
  const { messageId } = req.params;
  const info = processedEmailsStore.getProcessingInfo(messageId);
  
  if (info) {
    res.json({
      success: true,
      messageId,
      info
    });
  } else {
    res.json({
      success: false,
      message: 'Email not found in processed records'
    });
  }
});

/**
 * Clear all processed emails (admin function)
 */
router.delete('/clear', (req, res) => {
  processedEmailsStore.clear();
  res.json({
    success: true,
    message: 'All processed email records cleared'
  });
});

/**
 * Manual cleanup of old records
 */
router.post('/cleanup', (req, res) => {
  processedEmailsStore.cleanup();
  const stats = processedEmailsStore.getStats();
  
  res.json({
    success: true,
    message: 'Cleanup completed',
    stats
  });
});

export default router;