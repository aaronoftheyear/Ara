import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: true, // Listen on all addresses including LAN and public
        strictPort: false,
        allowedHosts: ['.ngrok-free.app', '.ngrok.app'],
        // hmr: {
        //   clientPort: 443, // Use HTTPS port for ngrok (disabled when ngrok is not running)
        // },
        cors: true, // Enable CORS for external access
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.MAL_CLIENT_ID': JSON.stringify(env.MAL_CLIENT_ID),
        'process.env.MAL_CLIENT_SECRET': JSON.stringify(env.MAL_CLIENT_SECRET)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
