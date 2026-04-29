import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        assetFileNames(assetInfo) {
          if (assetInfo.names.some((name) => name.endsWith('.css'))) {
            return 'assets/app.css';
          }

          return 'assets/[name]-[hash][extname]';
        },
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (
            id.includes('/react-router/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'router-vendor';
          }

          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/scheduler/')
          ) {
            return 'react-vendor';
          }

          if (
            id.includes('/react-hook-form/') ||
            id.includes('/@hookform/resolvers/')
          ) {
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
});
