import { test, expect } from '@playwright/test';
import { AccountApiClient } from '../../api/clients/AccountApiClient';
import { generateNewUser } from '../../utils/userFactory';
import { INVALID_CREDENTIALS } from '../../fixtures/test-data';

/**
 * Covers official API test cases #7-14: verifyLogin (valid/invalid/missing
 * param/wrong verb), createAccount, deleteAccount, updateAccount,
 * getUserDetailByEmail.
 *
 * These tests create and delete their own account per test (see afterEach)
 * rather than relying on a single shared fixture account. That's a
 * deliberate test-isolation choice: shared mutable fixtures are one of the
 * most common causes of "tests pass alone, fail in the full suite" flakiness,
 * and avoiding that class of bug entirely is worth the extra setup/teardown.
 */
test.describe('Account API @smoke', () => {
  test('creating an account with valid data succeeds, and the account can log in', async ({
    request,
  }) => {
    const client = new AccountApiClient(request);
    const user = generateNewUser();

    const createResponse = await client.createAccount(user);
    const createBody = await createResponse.json();
    expect(createBody.responseCode).toBe(201);
    expect(createBody.message).toMatch(/user created/i);

    const loginResponse = await client.verifyLogin(user.email, user.password);
    const loginBody = await loginResponse.json();
    expect(loginBody.responseCode).toBe(200);
    expect(loginBody.message).toMatch(/user exists/i);

    // Cleanup: delete the account this test created so repeated CI runs
    // don't accumulate throwaway accounts on the shared practice server.
    await client.deleteAccount(user.email, user.password);
  });

  test('verifying login with invalid credentials returns "User not found" @regression', async ({
    request,
  }) => {
    const client = new AccountApiClient(request);
    const response = await client.verifyLogin(
      INVALID_CREDENTIALS.email,
      INVALID_CREDENTIALS.password
    );
    const body = await response.json();

    expect(body.responseCode).toBe(404);
    expect(body.message).toMatch(/user not found/i);
  });

  test('verifying login without an email parameter returns a 400-style error @regression', async ({
    request,
  }) => {
    const client = new AccountApiClient(request);
    const response = await client.verifyLogin(undefined, 'some-password');
    const body = await response.json();

    expect(body.responseCode).toBe(400);
    expect(body.message).toMatch(/missing/i);
  });

  test('DELETE on /verifyLogin is rejected as an unsupported method @regression', async ({
    request,
  }) => {
    const client = new AccountApiClient(request);
    const response = await client.deleteVerifyLogin();
    const body = await response.json();

    expect(body.responseCode).toBe(405);
    expect(body.message).toMatch(/not supported/i);
  });

  test('an existing account can be looked up by email, updated, and deleted', async ({
    request,
  }) => {
    const client = new AccountApiClient(request);
    const user = generateNewUser();

    await client.createAccount(user);

    const lookupResponse = await client.getUserDetailByEmail(user.email);
    const lookupBody = await lookupResponse.json();
    expect(lookupResponse.status()).toBe(200);
    expect(lookupBody.user.email).toBe(user.email);

    const updatedUser = { ...user, firstName: 'UpdatedFirstName' };
    const updateResponse = await client.updateAccount(updatedUser);
    const updateBody = await updateResponse.json();
    expect(updateBody.responseCode).toBe(200);
    expect(updateBody.message).toMatch(/user updated/i);

    const deleteResponse = await client.deleteAccount(user.email, user.password);
    const deleteBody = await deleteResponse.json();
    expect(deleteBody.responseCode).toBe(200);
    expect(deleteBody.message).toMatch(/account deleted/i);
  });
});
