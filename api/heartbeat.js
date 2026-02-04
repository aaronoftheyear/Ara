// Serverless function to track active users
// Deploy to Vercel/Netlify or use with Express

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

const ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

async function loadSessions() {
  try {
    const data = await fs.readFile(SESSIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveSessions(sessions) {
  await ensureDataDir();
  // Clean up old sessions (older than 1 hour)
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  const cleaned = {};
  for (const [sessionId, timestamp] of Object.entries(sessions)) {
    if (timestamp > oneHourAgo) {
      cleaned[sessionId] = timestamp;
    }
  }
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(cleaned, null, 2));
}

// Vercel/Netlify serverless function handler
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, timestamp } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    const sessions = await loadSessions();
    sessions[sessionId] = timestamp || Date.now();
    await saveSessions(sessions);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Heartbeat failed:', error);
    return res.status(500).json({ error: 'Failed to update heartbeat' });
  }
};








