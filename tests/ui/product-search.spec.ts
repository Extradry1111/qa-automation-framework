import { test, expect } from '@playwright/test';
import { HomePage } from '../../ui/pages/HomePage';
import { ProductsPage } from '../../ui/pages/ProductsPage';
import { SEARCH_TERMS } from '../../fixtures/test-data';

/**
 * Covers: Test Case #8 (Search Product) plus one edge case not in the
 * official test case list — searching for a term with no matches. Both UI
 * search and the API's /searchProduct endpoint are tested (see
 * tests/api/products.spec.ts) so a regression can be pinpointed to either
 * the frontend or the backend layer rather than just "search is broken."
 */
test.describe('Product search @regression', () => {
  test('searching for an existing product shows matching results', async ({ page }) => {
    const home = new HomePage(page);
    const products = new ProductsPage(page);

    await home.open();
    await home.goToProducts();
    await home.searchProduct(SEARCH_TERMS.valid);

    await expect(products.searchedProductsTitle).toHaveText('Searched Products');
    expect(await products.productCount()).toBeGreaterThan(0);
  });

  test('searching for a non-matching term returns zero products', async ({ page }) => {
    const home = new HomePage(page);
    const products = new ProductsPage(page);

    await home.open();
    await home.goToProducts();
    await home.searchProduct(SEARCH_TERMS.nonMatching);

    await expect(products.searchedProductsTitle).toHaveText('Searched Products');
    expect(await products.productCount()).toBe(0);
  });
});
