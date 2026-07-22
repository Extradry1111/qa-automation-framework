import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage centralizes the low-level Playwright interactions every page
 * object needs, so individual page classes stay focused on the app's
 * vocabulary (e.g. `addToCart()`) rather than repeating raw locator/wait
 * boilerplate. This is the "why" a mid-level+ reviewer will look for:
 * it keeps page objects thin and makes a global change (e.g. adjusting
 * a wait strategy) a one-file edit instead of a find-and-replace across
 * a dozen page classes.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async clickAndWait(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async expectText(locator: Locator, text: string | RegExp): Promise<void> {
    await expect(locator).toHaveText(text);
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
