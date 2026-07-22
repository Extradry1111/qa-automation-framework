export interface NewUser {
  name: string;
  email: string;
  password: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

/**
 * A known-invalid credential pair, used across both UI and API negative
 * login tests so the "wrong password" scenario is defined once, not
 * duplicated with slightly different values in five different test files.
 */
export const INVALID_CREDENTIALS = {
  email: 'not-a-real-user@example.com',
  password: 'wrong-password-123',
};

/**
 * A handful of fixed search terms used by both the UI search box tests and
 * the API searchProduct tests, so "does the product search work" is
 * verified consistently across both layers.
 */
export const SEARCH_TERMS = {
  valid: 'Dress',
  nonMatching: 'zzz-no-such-product-zzz',
};
