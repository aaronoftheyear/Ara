// Serverless function to log errors
// Deploy to Vercel/Netlify or use with Express

const fs = require('fs').promises;
const path = require('path');

// For production, use a database instead
const DATA_DIR = path.join(__dirname, 'data');
const ERROR_FILE = path.join(DATA_DIR, 'errors.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

async function loadErrors() {
  try {
    const data = await fs.readFile(ERROR_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveErrors(errors) {
  await ensureDataDir();
  // Keep only last 1000 errors
  const trimmed = errors.slice(-1000);
  await fs.writeFile(ERROR_FILE, JSON.stringify(trimmed, null, 2));
}

// Vercel/Netlify serverless function handler
module.exports = async (req, res) => {
  // Enable CORS
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
    const { message, stack, userAgent, url, timestamp } = req.body;

    const errors = await loadErrors();
    errors.push({
      id: Date.now().toString(),
      message: message || 'Unknown error',
      stack: stack || '',
      userAgent: userAgent || '',
      url: url || '',
      timestamp: timestamp || new Date().toISOString(),
    });

    await saveErrors(errors);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging failed:', error);
    return res.status(500).json({ error: 'Failed to log error' });
  }
};








