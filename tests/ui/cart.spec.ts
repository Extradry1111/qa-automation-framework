import { test, expect } from '@playwright/test';
import { HomePage } from '../../ui/pages/HomePage';
import { ProductsPage } from '../../ui/pages/ProductsPage';
import { CartPage } from '../../ui/pages/CartPage';

/**
 * Covers: Test Case #9 (Add Products in Cart), #17 (Verify address details
 * partial — quantity check only, see note below), #21 (Remove Products
 * From Cart).
 *
 * Scope note: the full checkout/payment flow (Test Cases #14-16) is
 * intentionally NOT automated here. automationexercise.com's payment step
 * accepts fake card data and doesn't represent a real payment gateway
 * contract, so automating it would mostly test the site's own mock logic
 * rather than anything transferable — a deliberate "automate this,
 * don't automate that" call, which is exactly the kind of test-strategy
 * judgment a Middle+ QA is expected to make and document, not just execute
 * every possible test case mechanically.
 */
test.describe('Shopping cart @regression', () => {
  test('adding two products to the cart shows both with correct quantity', async ({ page }) => {
    const home = new HomePage(page);
    const products = new ProductsPage(page);
    const cart = new CartPage(page);

    await home.open();
    await home.goToProducts();

    await products.addProductToCartByIndex(0);
    await products.dismissAddedToCartModal();
    await products.addProductToCartByIndex(1);
    await products.goToCartFromModal();

    expect(await cart.itemCount()).toBe(2);
    expect(await cart.quantityForRow(0)).toBe('1');
    expect(await cart.quantityForRow(1)).toBe('1');
  });

  test('removing a product from the cart updates the cart contents', async ({ page }) => {
    const home = new HomePage(page);
    const products = new ProductsPage(page);
    const cart = new CartPage(page);

    await home.open();
    await home.goToProducts();
    await products.addProductToCartByIndex(0);
    await products.goToCartFromModal();

    expect(await cart.itemCount()).toBe(1);

    await cart.removeItem(0);

    // The cart re-renders asynchronously after delete; assert on the
    // resulting state (empty message) rather than a fixed sleep.
    await expect(cart.emptyCartMessage).toBeVisible();
  });
});
