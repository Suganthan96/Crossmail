import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes for Gmail access
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

/**
 * Generate authentication URL
 */
export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
}

/**
 * Get tokens from authorization code
 */
export async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

/**
 * Set credentials
 */
export function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
}

/**
 * Get Gmail client
 */
export function getGmailClient() {
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Get OAuth2 client
 */
export function getOAuth2Client() {
  return oauth2Client;
}

export default {
  oauth2Client,
  getAuthUrl,
  getTokens,
  setCredentials,
  getGmailClient,
  getOAuth2Client
};
