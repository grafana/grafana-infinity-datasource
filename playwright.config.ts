import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // eslint-disable-line no-undef
  retries: process.env.CI ? 2 : 0, // eslint-disable-line no-undef
  workers: process.env.CI ? 1 : undefined, // eslint-disable-line no-undef
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'authenticate',
      testMatch: [/.*auth\.setup\.ts/],
    },
    {
      name: 'query',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['authenticate'],
    },
  ],
});
