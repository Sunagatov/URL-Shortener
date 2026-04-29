import { defineConfig, devices } from '@playwright/test';

const FRONTEND_PORT = Number(process.env.PLAYWRIGHT_FRONTEND_PORT ?? 3000);
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;
const BACKEND_URL = process.env.VITE_BACKEND_REST_API_URL ?? 'http://localhost:8080';
const webServerEnv = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${FRONTEND_PORT}`,
    url: FRONTEND_URL,
    env: {
      ...webServerEnv,
      VITE_BACKEND_REST_API_URL: BACKEND_URL,
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
