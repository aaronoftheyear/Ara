// Serverless proxy for MyAnimeList API to avoid CORS and third-party proxy 403s.
// Forwards GET requests to api.myanimelist.net with X-MAL-CLIENT-ID.
// Usage: GET /api/mal-proxy?path=/v2/users/{username}/animelist?fields=...
// Header: X-MAL-CLIENT-ID (or set MAL_CLIENT_ID in server env)

const MAL_BASE = 'https://api.myanimelist.net';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-MAL-CLIENT-ID');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const path = req.query.path;
  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Query parameter "path" is required (e.g. /v2/users/username/animelist?fields=...)' });
  }

  const clientId = req.headers['x-mal-client-id'] || process.env.MAL_CLIENT_ID;
  if (!clientId) {
    return res.status(400).json({ error: 'X-MAL-CLIENT-ID header or MAL_CLIENT_ID env is required' });
  }

  const url = path.startsWith('http') ? path : MAL_BASE + (path.startsWith('/') ? path : '/' + path);
  if (!url.startsWith(MAL_BASE)) {
    return res.status(400).json({ error: 'path must target api.myanimelist.net only' });
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-MAL-CLIENT-ID': clientId },
    });

    const body = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);

    if (!response.ok) {
      return res.status(response.status).send(body || response.statusText);
    }

    return res.status(200).send(body);
  } catch (err) {
    console.error('MAL proxy error:', err);
    return res.status(502).json({ error: 'Proxy request failed', message: err.message });
  }
};
