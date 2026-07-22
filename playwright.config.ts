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
 * - CI runs with a single worker (workers: 1) to reduce load against a shared
 *   public target site, though the deeper cause of UI flakiness turned out to
 *   be bot-detection (see ui-chromium project below), not concurrency alone.
 * - ui-chromium uses the real "chrome" channel + a disabled automation-control
 *   flag rather than Playwright's bundled Chromium, because this target's
 *   bot-detection was intermittently blocking form submissions from bundled
 *   headless Chromium's default fingerprint. Real Chrome's fingerprint is far
 *   less commonly flagged. This is a standard technique when automating
 *   against sites with bot detection, and worth documenting here rather than
 *   silently working around.
 * - The api project sets `userAgent` (not just extraHTTPHeaders) for the same
 *   underlying reason — Playwright's default API request User-Agent
 *   ("Playwright/x.y.z") gets soft-blocked by this target's WAF, which returns
 *   HTTP 200 with an HTML challenge page instead of JSON. extraHTTPHeaders
 *   alone did not reliably override the built-in User-Agent header; the
 *   dedicated `userAgent` option does.
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
  workers: process.env.CI ? 1 : undefined,

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
        channel: 'chrome',
        baseURL: process.env.BASE_URL ?? 'https://automationexercise.com',
        headless: process.env.HEADLESS !== 'false',
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled'],
        },
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
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        extraHTTPHeaders: {
          Accept: 'application/json, text/plain, */*',
        },
      },
    },
  ],
});
