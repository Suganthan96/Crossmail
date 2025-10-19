import express from 'express';
import { getAuthUrl, getTokens, getOAuth2Client } from '../config/google.js';
import { google } from 'googleapis';
import emailMonitorService from '../services/email-monitor.js';

const router = express.Router();

// Store tokens in memory (use database in production)
const userTokens = new Map();

/**
 * Initiate Google OAuth flow
 */
router.get('/google', (req, res) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

/**
 * OAuth callback handler
 */
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }
  
  try {
    // Exchange code for tokens
    const tokens = await getTokens(code);
    
    // Get user info
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    
    // Store tokens (use database in production)
    userTokens.set(userInfo.email, {
      tokens,
      userInfo,
      timestamp: Date.now()
    });
    
    // Store in session
    req.session.userEmail = userInfo.email;
    req.session.tokens = tokens;
    
    console.log(`✓ User authenticated: ${userInfo.email}`);
    
    // Start automatic email monitoring
    emailMonitorService.startMonitoring(userInfo.email, tokens);
    
    // Redirect to success page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            .success-icon {
              font-size: 64px;
              color: #10b981;
              margin-bottom: 20px;
            }
            h1 { color: #1f2937; margin-bottom: 10px; }
            p { color: #6b7280; margin: 10px 0; }
            .email { 
              font-weight: bold; 
              color: #667eea; 
              background: #f3f4f6;
              padding: 10px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              transition: background 0.3s;
            }
            .button:hover { background: #5568d3; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h1>Authentication Successful!</h1>
            <p>You have successfully connected your Gmail account.</p>
            <div class="email">${userInfo.email}</div>
            <p>You can now close this window and return to the application.</p>
            <a href="http://localhost:3000" class="button">Return to App</a>
          </div>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: error.message 
    });
  }
});

/**
 * Get current auth status
 */
router.get('/status', (req, res) => {
  const monitorStatus = emailMonitorService.getStatus();
  
  if (req.session.userEmail) {
    res.json({
      authenticated: true,
      email: req.session.userEmail,
      monitoring: monitorStatus
    });
  } else {
    res.json({ 
      authenticated: false,
      monitoring: monitorStatus
    });
  }
});

/**
 * Logout
 */
router.post('/logout', (req, res) => {
  const email = req.session.userEmail;
  
  if (email) {
    userTokens.delete(email);
    // Stop email monitoring
    emailMonitorService.stopMonitoring();
  }
  
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

/**
 * Get stored tokens for a user (internal use)
 */
export function getUserTokens(email) {
  return userTokens.get(email);
}

export default router;
