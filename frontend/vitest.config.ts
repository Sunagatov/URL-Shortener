import type { UserConfig } from 'vite';
import type { InlineConfig } from 'vitest';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

type VitestConfig = UserConfig & {
  test: InlineConfig;
};

export default {
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    css: true,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', 'build/**'],
  },
} satisfies VitestConfig;
