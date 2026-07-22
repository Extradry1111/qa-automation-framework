import { test, expect } from '@playwright/test';
import { HomePage } from '../../ui/pages/HomePage';
import { LoginPage } from '../../ui/pages/LoginPage';
import { SignupPage } from '../../ui/pages/SignupPage';
import { generateNewUser } from '../../utils/userFactory';
import { INVALID_CREDENTIALS } from '../../fixtures/test-data';

/**
 * Covers: Test Case #2 (Login User with correct credentials), #3 (incorrect
 * credentials), #4 (Logout). Grouped in one file because they share the
 * same fixture setup (a freshly-created user) and represent one coherent
 * user journey: sign up once, then exercise every login-related path.
 */
test.describe('Login and logout @smoke', () => {
  test('user can log in with valid credentials and log out', async ({ page }) => {
    const user = generateNewUser();
    const home = new HomePage(page);
    const login = new LoginPage(page);
    const signup = new SignupPage(page);

    // Arrange: create a real account to log in with, rather than depending
    // on a shared/shared-across-runs test account that other tests might
    // also be mutating (a common source of cross-test flakiness).
    await home.open();
    await home.goToLogin();
    await login.startSignup(user.name, user.email);
    await expect(signup.accountCreatedText).toBeVisible();
    await signup.continueAfterAccountCreated();
    await home.logout();

    // Act
    await login.login(user.email, user.password);

    // Assert
    expect(await home.isLoggedInAs(user.name)).toBe(true);

    // Logout path, verified in the same test since it depends on being
    // logged in — splitting it into a separate test would just duplicate
    // the same login setup for no added coverage.
    await home.logout();
    await expect(home.signupLoginLink).toBeVisible();
  });

  test('logging in with an unregistered email shows an error @regression', async ({ page }) => {
    const home = new HomePage(page);
    const login = new LoginPage(page);

    await home.open();
    await home.goToLogin();
    await login.login(INVALID_CREDENTIALS.email, INVALID_CREDENTIALS.password);

    await expect(login.loginErrorText).toBeVisible();
    // Negative assertion matters here too: an incorrect login must NOT
    // leave the user in a logged-in state.
    await expect(home.signupLoginLink).toBeVisible();
  });
});
