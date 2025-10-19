import express from 'express';
import { getGmailClient, setCredentials } from '../config/google.js';
import { getUserTokens } from './auth.js';

const router = express.Router();

/**
 * Middleware to check authentication
 */
function requireAuth(req, res, next) {
  if (!req.session.userEmail || !req.session.tokens) {
    return res.status(401).json({ 
      error: 'Not authenticated',
      message: 'Please authenticate with Google first'
    });
  }
  next();
}

/**
 * Get user profile
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userData = getUserTokens(req.session.userEmail);
    
    if (!userData) {
      return res.status(401).json({ error: 'User data not found' });
    }
    
    res.json({
      success: true,
      profile: userData.userInfo
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get profile',
      message: error.message 
    });
  }
});

/**
 * List recent emails
 */
router.get('/messages', requireAuth, async (req, res) => {
  try {
    setCredentials(req.session.tokens);
    const gmail = getGmailClient();
    
    const maxResults = parseInt(req.query.maxResults) || 10;
    const query = req.query.q || '';
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: query
    });
    
    const messages = response.data.messages || [];
    
    // Get details for each message
    const detailedMessages = await Promise.all(
      messages.slice(0, 5).map(async (message) => {
        const details = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date']
        });
        
        const headers = details.data.payload.headers;
        return {
          id: message.id,
          threadId: message.threadId,
          from: headers.find(h => h.name === 'From')?.value,
          subject: headers.find(h => h.name === 'Subject')?.value,
          date: headers.find(h => h.name === 'Date')?.value
        };
      })
    );
    
    res.json({
      success: true,
      count: messages.length,
      messages: detailedMessages
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to list messages',
      message: error.message 
    });
  }
});

/**
 * Get a specific email
 */
router.get('/messages/:id', requireAuth, async (req, res) => {
  try {
    setCredentials(req.session.tokens);
    const gmail = getGmailClient();
    
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: req.params.id,
      format: 'full'
    });
    
    res.json({
      success: true,
      message: response.data
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get message',
      message: error.message 
    });
  }
});

/**
 * Send an email
 */
router.post('/send', requireAuth, async (req, res) => {
  try {
    setCredentials(req.session.tokens);
    const gmail = getGmailClient();
    
    const { to, subject, body } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, body' 
      });
    }
    
    // Create email content
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');
    
    // Encode message
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
    
    res.json({
      success: true,
      messageId: response.data.id,
      message: 'Email sent successfully'
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send email',
      message: error.message 
    });
  }
});

/**
 * Search emails by transaction hash
 */
router.get('/search/transaction/:hash', requireAuth, async (req, res) => {
  try {
    setCredentials(req.session.tokens);
    const gmail = getGmailClient();
    
    const { hash } = req.params;
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: hash,
      maxResults: 10
    });
    
    res.json({
      success: true,
      count: response.data.messages?.length || 0,
      messages: response.data.messages || []
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to search messages',
      message: error.message 
    });
  }
});

export default router;
