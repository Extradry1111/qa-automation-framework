import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Central, config-driven Playwright setup.
 *
 * Design decisions (see README for the full rationale):
 * - Base URL and API URL come from environment variables, not hardcoded strings,
 *   so the same test suite can point at staging/prod/local by swapping .env.
 * - UI and API tests are split into separate Playwright "projects" so they can be
 *   run independently (`npm run test:ui` vs `npm run test:api`) and so CI can
 *   parallelize them as separate jobs if the suite grows.
 * - CI gets stricter defaults (forbidOnly, retries, single worker for stability)
 *   than local dev, controlled by the standard process.env.CI flag Playwright sets.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : Number(process.env.RETRIES ?? 0),
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    process.env.CI ? ['github'] : ['dot'],
  ],

  use: {
    actionTimeout: Number(process.env.ACTION_TIMEOUT ?? 10_000),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // ---- UI projects: page-object-driven browser tests ----
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL ?? 'https://automationexercise.com',
        headless: process.env.HEADLESS !== 'false',
      },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.BASE_URL ?? 'https://automationexercise.com',
        headless: process.env.HEADLESS !== 'false',
      },
    },
    {
      name: 'ui-webkit',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Safari'],
        baseURL: process.env.BASE_URL ?? 'https://automationexercise.com',
        headless: process.env.HEADLESS !== 'false',
      },
    },

    // ---- API project: no browser context needed, just request context ----
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://automationexercise.com/api',
      },
    },
  ],
});
