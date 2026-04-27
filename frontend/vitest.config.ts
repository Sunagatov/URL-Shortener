import type { UserConfig } from 'vite';
import type { InlineConfig } from 'vitest';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

type VitestConfig = UserConfig & {
  test: InlineConfig;
};

export default {
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    css: true,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', 'build/**'],
  },
} satisfies VitestConfig;
