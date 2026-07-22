import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartRows: Locator;
  readonly emptyCartMessage: Locator;
  readonly proceedToCheckoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartRows = page.locator('#cart_info tbody tr');
    this.emptyCartMessage = page.locator('#empty_cart');
    this.proceedToCheckoutButton = page.locator('a:has-text("Proceed To Checkout")');
  }

  async open(): Promise<void> {
    await this.goto('/view_cart');
  }

  async itemCount(): Promise<number> {
    return this.cartRows.count();
  }

  async quantityForRow(index: number): Promise<string> {
    return (
      (await this.cartRows
        .nth(index)
        .locator('.cart_quantity button')
        .textContent()) ?? ''
    ).trim();
  }

  async removeItem(index: number): Promise<void> {
    await this.cartRows.nth(index).locator('.cart_quantity_delete').click();
  }

  async isEmpty(): Promise<boolean> {
    return this.emptyCartMessage.isVisible();
  }
}
