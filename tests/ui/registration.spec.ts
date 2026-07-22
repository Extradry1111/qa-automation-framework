import { test, expect } from '@playwright/test';
import { HomePage } from '../../ui/pages/HomePage';
import { LoginPage } from '../../ui/pages/LoginPage';
import { SignupPage } from '../../ui/pages/SignupPage';
import { generateNewUser } from '../../utils/userFactory';

/**
 * Covers: Automation Exercise Test Case #1 (Register User).
 * Risk rationale: registration is the single point every other authenticated
 * flow (checkout, account management) depends on — if this breaks, it's a
 * release blocker, which is why it's tagged @smoke rather than @regression.
 */
test.describe('User registration @smoke', () => {
  test('a new user can sign up with a unique email and lands on their account home', async ({
    page,
  }) => {
    const user = generateNewUser();

    const home = new HomePage(page);
    const login = new LoginPage(page);
    const signup = new SignupPage(page);

    await home.open();
    await home.goToLogin();
    await login.startSignup(user.name, user.email);
    await signup.completeSignup(user);

    await expect(signup.accountCreatedText).toBeVisible();
    await signup.continueAfterAccountCreated();

    expect(await home.isLoggedInAs(user.name)).toBe(true);
  });

  test('signing up with an email that already exists shows an inline error @regression', async ({
    page,
  }) => {
    const user = generateNewUser();

    const home = new HomePage(page);
    const login = new LoginPage(page);
    const signup = new SignupPage(page);

    // First signup succeeds and establishes the "existing" email.
    await home.open();
    await home.goToLogin();
    await login.startSignup(user.name, user.email);
    await expect(signup.accountCreatedText).toBeVisible();
    await signup.continueAfterAccountCreated();
    await home.logout();

    // Second signup attempt with the same email should be rejected.
    await login.open();
    await login.startSignup(user.name, user.email);
    await signup.completeSignup(user);
    await expect(login.signupErrorText).toBeVisible();
  });
});
