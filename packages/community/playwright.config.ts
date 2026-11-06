import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
export const BASE_URL = `http://localhost:${PORT}`;

// E2E tests run against the Vite dev server. The API is never reached:
// every request to API_ORIGIN is answered by the mock in e2e/fixtures.ts.
export const API_ORIGIN = 'http://api.e2e.test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm exec vite --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      REACT_APP_SERVER_URL: `${API_ORIGIN}/`,
      // Keep Vite from opening a browser window (server.open in vite.config.ts)
      BROWSER: 'none',
    },
  },
});
