import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly productCards: Locator;
  readonly searchedProductsTitle: Locator;
  readonly viewCartModalLink: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards = page.locator('.product-image-wrapper');
    this.searchedProductsTitle = page.locator('h2.title.text-center');
    this.viewCartModalLink = page.locator('#cartModal a[href="/view_cart"]');
    this.continueShoppingButton = page.locator('button:has-text("Continue Shopping")');
  }

  async open(): Promise<void> {
    await this.goto('/products');
  }

  /**
   * Adds the Nth product (0-indexed) on the current listing to the cart by
   * hovering to reveal the "Add to cart" overlay button, matching the site's
   * actual hover-to-reveal UI rather than assuming the button is always visible.
   */
  async addProductToCartByIndex(index: number): Promise<void> {
    const card = this.productCards.nth(index);
    await card.hover();
    await card.locator('a:has-text("Add to cart")').first().click();
  }

  async productCount(): Promise<number> {
    return this.productCards.count();
  }

  async goToCartFromModal(): Promise<void> {
    await this.clickAndWait(this.viewCartModalLink);
  }

  async dismissAddedToCartModal(): Promise<void> {
    await this.clickAndWait(this.continueShoppingButton);
  }
}
