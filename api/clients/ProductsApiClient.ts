import { APIRequestContext } from '@playwright/test';

/**
 * Thin wrapper around Playwright's APIRequestContext for the product-related
 * endpoints. Centralizing endpoint paths here means a base-path change only
 * needs to happen in one place, and test files read as business intent
 * ("get all products") rather than raw HTTP calls.
 */
export class ProductsApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async getProductsList() {
    return this.request.get('/productsList');
  }

  async postToProductsList() {
    // The API only supports GET here; used for the negative "wrong verb"
    // test to confirm the endpoint responds with a clear method-not-allowed
    // message instead of a generic 500.
    return this.request.post('/productsList');
  }

  async getBrandsList() {
    return this.request.get('/brandsList');
  }

  async searchProduct(searchTerm?: string) {
    return this.request.post('/searchProduct', {
      form: searchTerm !== undefined ? { search_product: searchTerm } : {},
    });
  }
}
