# API Endpoints for Active Users & Error Logging

This directory contains serverless functions for tracking active users and collecting error logs.

## Deployment

These functions can be deployed to:
- **Vercel**: Place in `/api` folder (auto-detected)
- **Netlify**: Place in `/netlify/functions` folder
- **Any Node.js server**: Use Express routes

## Endpoints

### POST `/api/error`
Logs an error from the frontend.

**Request Body:**
```json
{
  "message": "Error message",
  "stack": "Stack trace",
  "userAgent": "Browser user agent",
  "url": "Page URL",
  "timestamp": "ISO timestamp"
}
```

### POST `/api/heartbeat`
Updates user session activity.

**Request Body:**
```json
{
  "sessionId": "unique-session-id",
  "timestamp": "ISO timestamp"
}
```

### GET `/api/active-users`
Returns count of active users (active in last 5 minutes).

**Response:**
```json
{
  "count": 5,
  "sessions": [...]
}
```

### GET `/api/errors`
Returns recent error logs.

**Query Parameters:**
- `limit`: Number of errors to return (default: 50)
- `since`: ISO timestamp to filter errors after

**Response:**
```json
{
  "errors": [...],
  "total": 100
}
```

## Storage

For minimal setup, data is stored in:
- **Development**: JSON files in `/api/data/`
- **Production**: Use a database (PostgreSQL, MongoDB, etc.)

## Security

Add authentication/rate limiting before deploying to production!








