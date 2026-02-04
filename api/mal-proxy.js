// Serverless proxy for MyAnimeList API. Uses MAL_CLIENT_ID from Vercel env only.
// Set MAL_CLIENT_ID in Vercel → Project → Settings → Environment Variables.

const MAL_BASE = 'https://api.myanimelist.net';

function cors(res) {
  if (res && res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');
  }
}

export default async function handler(req, res) {
  const send = (status, body) => {
    cors(res);
    res.status(status).json(typeof body === 'object' ? body : { error: String(body) });
  };

  try {
    cors(res);
    const method = (req && req.method || '').toUpperCase();
    if (method !== 'GET') {
      send(405, { error: 'Method not allowed' });
      return;
    }

    const path = (req.query && req.query.path) || '';
    if (!path || typeof path !== 'string') {
      send(400, { error: 'Query parameter "path" is required' });
      return;
    }

    const clientId = process.env.MAL_CLIENT_ID;
    if (!clientId) {
      send(500, { error: 'MAL_CLIENT_ID not set. Add it in Vercel → Settings → Environment Variables.' });
      return;
    }

    const url = path.startsWith('http') ? path : MAL_BASE + (path.startsWith('/') ? path : '/' + path);
    if (!url.startsWith(MAL_BASE)) {
      send(400, { error: 'path must target api.myanimelist.net only' });
      return;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-MAL-CLIENT-ID': clientId },
    });

    const body = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';
    cors(res);
    res.setHeader('Content-Type', contentType);

    if (!response.ok) {
      res.status(response.status).send(body || response.statusText);
      return;
    }
    res.status(200).send(body);
  } catch (err) {
    console.error('MAL proxy error:', err);
    send(502, { error: 'Proxy request failed', message: err.message });
  }
}
