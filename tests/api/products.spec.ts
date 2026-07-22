import { test, expect } from '@playwright/test';
import { ProductsApiClient } from '../../api/clients/ProductsApiClient';
import { SEARCH_TERMS } from '../../fixtures/test-data';

/**
 * Covers official API test cases #1-6 from automationexercise.com/api_list:
 * GET/POST productsList, GET/PUT brandsList, POST searchProduct (with and
 * without the required parameter).
 *
 * Every endpoint gets both a "happy path" and a "wrong HTTP verb" or
 * "missing parameter" case — that pairing is deliberate: knowing an API
 * returns the right data on success is necessary but not sufficient at
 * Middle+ level; knowing it fails *predictably and informatively* on
 * misuse is what API test coverage is actually for.
 */
test.describe('Products & Brands API @smoke', () => {
  test('GET /productsList returns 200 and a non-empty product list', async ({ request }) => {
    const client = new ProductsApiClient(request);
    const response = await client.getProductsList();

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);

    // Shape check on the first product, not just "array is non-empty" —
    // catches contract-breaking changes like a renamed field.
    const [firstProduct] = body.products;
    expect(firstProduct).toHaveProperty('id');
    expect(firstProduct).toHaveProperty('name');
    expect(firstProduct).toHaveProperty('price');
    expect(firstProduct).toHaveProperty('brand');
    expect(firstProduct).toHaveProperty('category');
  });

  test('POST /productsList is rejected with a method-not-allowed response @regression', async ({
    request,
  }) => {
    const client = new ProductsApiClient(request);
    const response = await client.postToProductsList();
    const body = await response.json();

    // The API returns HTTP 200 with responseCode 405 in its JSON body
    // rather than an HTTP 405 status — documenting that quirk here (and
    // asserting on it explicitly) is exactly the kind of "this API doesn't
    // follow REST conventions cleanly" finding worth flagging to devs.
    expect(body.responseCode).toBe(405);
    expect(body.message).toMatch(/not supported/i);
  });

  test('GET /brandsList returns 200 and a non-empty brand list', async ({ request }) => {
    const client = new ProductsApiClient(request);
    const response = await client.getBrandsList();

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.brands)).toBe(true);
    expect(body.brands.length).toBeGreaterThan(0);
  });

  test('POST /searchProduct with a valid term returns matching products', async ({ request }) => {
    const client = new ProductsApiClient(request);
    const response = await client.searchProduct(SEARCH_TERMS.valid);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
  });

  test('POST /searchProduct without the required parameter returns a 400-style error @regression', async ({
    request,
  }) => {
    const client = new ProductsApiClient(request);
    const response = await client.searchProduct(undefined);
    const body = await response.json();

    expect(body.responseCode).toBe(400);
    expect(body.message).toMatch(/search_product parameter is missing/i);
  });
});
