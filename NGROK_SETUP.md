# 🌐 Ngrok Setup for External Device Testing

## Problem
Getting "This host is not allowed" error when accessing via ngrok URL from other devices.

## Solution

### Step 1: Stop Everything
```bash
# Stop your dev server (Ctrl+C)
# Stop ngrok (Ctrl+C)
```

### Step 2: Start Dev Server with Updated Config
```bash
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

### Step 3: Start Ngrok with Host Header Override
```bash
ngrok http 3000 --host-header="localhost:3000"
```

The `--host-header` flag is CRITICAL - it tells ngrok to rewrite the Host header to match what Vite expects.

### Step 4: Test the URL
You'll see something like:
```
Forwarding   https://696a0b52a6ec.ngrok-free.app -> http://localhost:3000
```

Copy that URL and test from another device.

## Alternative Method (If Above Doesn't Work)

### Option 1: Use Ngrok's Edge Configuration
```bash
ngrok http 3000 --domain=your-custom-domain.ngrok-free.app --host-header=rewrite
```

### Option 2: Build and Serve Production Version
If dev server continues to have issues, build the production version:

```bash
# Build the app
npm run build

# Serve the production build
npx serve dist -p 3000

# Then ngrok it
ngrok http 3000
```

Production builds don't have the same host checking restrictions.

## What Changed in vite.config.ts

```javascript
server: {
  host: true,              // Listen on all addresses
  strictPort: false,       // Allow port flexibility  
  hmr: {
    clientPort: 443,       // Use HTTPS port for HMR through ngrok
  },
  cors: true,              // Enable CORS
}
```

## Verification

After starting ngrok, you should see:
1. No "host not allowed" errors
2. Full app functionality on external devices
3. Hot reload working (if using dev server)

## Troubleshooting

**Still getting blocked?**
Try adding ngrok-specific environment variable:
```bash
VITE_HMR_HOST=your-ngrok-url.ngrok-free.app npm run dev
```

Then start ngrok in another terminal:
```bash
ngrok http 3000 --host-header="localhost:3000"
```

**HMR (hot reload) not working on external device?**
This is expected with ngrok in dev mode. Changes will require manual page refresh.

**Want to avoid ngrok entirely?**
Deploy to Vercel instead - see DEPLOYMENT_GUIDE.md



