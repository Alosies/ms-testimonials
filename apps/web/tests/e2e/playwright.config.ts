import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars (ES module compatible)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load test-specific env vars first (higher priority)
dotenv.config({ path: path.resolve(__dirname, '.env') });
// Load app env vars as fallback
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Preview server port (Vite default)
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

export default defineConfig({
  testDir: './features',
  fullyParallel: false, // Run tests serially to avoid auth race conditions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid parallel auth issues
  timeout: 60000, // 60s per test
  reporter: [
    ['html', { outputFolder: './test-results/html' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || PREVIEW_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Run tests against production build for stability
  // Build is skipped if already built, preview serves the dist folder
  webServer: {
    command: 'pnpm build && pnpm preview',
    url: PREVIEW_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180000, // 3 min for build + preview startup
  },
});
