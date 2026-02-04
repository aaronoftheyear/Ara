// Serverless function to get error logs
// Deploy to Vercel/Netlify or use with Express

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const ERROR_FILE = path.join(DATA_DIR, 'errors.json');

async function loadErrors() {
  try {
    const data = await fs.readFile(ERROR_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
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
    const errors = await loadErrors();
    const limit = parseInt(req.query.limit) || 50;
    const since = req.query.since ? new Date(req.query.since).getTime() : 0;

    // Filter by timestamp if provided
    const filtered = errors.filter(error => {
      const errorTime = new Date(error.timestamp).getTime();
      return errorTime >= since;
    });

    // Sort by timestamp (newest first) and limit
    const sorted = filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return res.status(200).json({
      errors: sorted,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Failed to get errors:', error);
    return res.status(500).json({ error: 'Failed to get errors' });
  }
};








