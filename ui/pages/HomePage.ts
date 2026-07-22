import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly signupLoginLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly loggedInAsText: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly contactUsLink: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signupLoginLink = page.locator('a[href="/login"]');
    this.logoutLink = page.locator('a[href="/logout"]');
    this.deleteAccountLink = page.locator('a[href="/delete_account"]');
    this.loggedInAsText = page.locator('a:has-text("Logged in as")');
    this.productsLink = page.locator('a[href="/products"]');
    this.cartLink = page.locator('a[href="/view_cart"]');
    this.contactUsLink = page.locator('a[href="/contact_us"]');
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async goToLogin(): Promise<void> {
    await this.clickAndWait(this.signupLoginLink);
  }

  async goToProducts(): Promise<void> {
    await this.clickAndWait(this.productsLink);
  }

  async goToCart(): Promise<void> {
    await this.clickAndWait(this.cartLink);
  }

  async logout(): Promise<void> {
    await this.clickAndWait(this.logoutLink);
  }

  async searchProduct(term: string): Promise<void> {
    await this.fill(this.searchInput, term);
    await this.clickAndWait(this.searchButton);
  }

  async isLoggedInAs(name: string): Promise<boolean> {
    return this.page
      .locator(`a:has-text("Logged in as ${name}")`)
      .isVisible();
  }
}
