import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Login form
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly loginErrorText: Locator;

  // Signup form
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly signupErrorText: Locator;

  constructor(page: Page) {
    super(page);
    this.loginEmailInput = page.locator('[data-qa="login-email"]');
    this.loginPasswordInput = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.loginErrorText = page.locator('p:has-text("Your email or password is incorrect!")');

    this.signupNameInput = page.locator('[data-qa="signup-name"]');
    this.signupEmailInput = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.signupErrorText = page.locator('p:has-text("Email Address already exist!")');
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.fill(this.loginEmailInput, email);
    await this.fill(this.loginPasswordInput, password);
    await this.clickAndWait(this.loginButton);
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.fill(this.signupNameInput, name);
    await this.fill(this.signupEmailInput, email);
    await this.clickAndWait(this.signupButton);
  }
}
