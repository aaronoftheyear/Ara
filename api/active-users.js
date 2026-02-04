// Serverless function to get active user count
// Deploy to Vercel/Netlify or use with Express

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

const ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

async function loadSessions() {
  try {
    const data = await fs.readFile(SESSIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Vercel/Netlify serverless function handler
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessions = await loadSessions();
    const now = Date.now();
    
    const activeSessions = Object.entries(sessions)
      .filter(([sessionId, timestamp]) => (now - timestamp) < ACTIVE_THRESHOLD)
      .map(([sessionId, timestamp]) => ({
        sessionId,
        lastActive: new Date(timestamp).toISOString(),
        minutesAgo: Math.floor((now - timestamp) / 60000),
      }));

    return res.status(200).json({
      count: activeSessions.length,
      sessions: activeSessions,
    });
  } catch (error) {
    console.error('Failed to get active users:', error);
    return res.status(500).json({ error: 'Failed to get active users' });
  }
};








