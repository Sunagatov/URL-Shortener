import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

function backendOrigin(mode: string): string | null {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_REST_API_URL;
  if (!backendUrl) {
    return null;
  }

  try {
    return new URL(backendUrl).origin;
  } catch {
    return null;
  }
}

function securityHeaders(mode: string) {
  const scriptSources = ["'self'", 'https://challenges.cloudflare.com'];

  if (mode === 'development') {
    scriptSources.push("'unsafe-inline'");
  }

  const connectSources = [
    "'self'",
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'ws://localhost:3000',
    'ws://127.0.0.1:3000',
    backendOrigin(mode),
  ].filter(Boolean);

  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      `script-src ${scriptSources.join(' ')}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      `connect-src ${connectSources.join(' ')}`,
      'frame-src https://challenges.cloudflare.com',
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
    headers: securityHeaders(mode),
  },
  preview: {
    headers: securityHeaders(mode),
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        assetFileNames(assetInfo) {
          if (assetInfo.names.some(name => name.endsWith('.css'))) {
            return 'assets/app.css';
          }

          return 'assets/[name]-[hash][extname]';
        },
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('/react-router/') || id.includes('/react-router-dom/')) {
            return 'router-vendor';
          }

          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) {
            return 'react-vendor';
          }

          if (id.includes('/react-hook-form/') || id.includes('/@hookform/resolvers/')) {
            return 'form-vendor';
          }

          if (id.includes('/zod/')) {
            return 'validation-vendor';
          }

          if (id.includes('/axios/')) {
            return 'http-vendor';
          }

          if (id.includes('/react-icons/')) {
            return 'icons-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
}));
