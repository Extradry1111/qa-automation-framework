import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { NewUser } from '../../fixtures/test-data';

export class SignupPage extends BasePage {
  readonly titleMr: Locator;
  readonly passwordInput: Locator;
  readonly daysSelect: Locator;
  readonly monthsSelect: Locator;
  readonly yearsSelect: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressInput: Locator;
  readonly countrySelect: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileNumberInput: Locator;
  readonly createAccountButton: Locator;
  readonly accountCreatedText: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleMr = page.locator('#id_gender1');
    this.passwordInput = page.locator('#password');
    this.daysSelect = page.locator('#days');
    this.monthsSelect = page.locator('#months');
    this.yearsSelect = page.locator('#years');
    this.firstNameInput = page.locator('#first_name');
    this.lastNameInput = page.locator('#last_name');
    this.addressInput = page.locator('#address1');
    this.countrySelect = page.locator('#country');
    this.stateInput = page.locator('#state');
    this.cityInput = page.locator('#city');
    this.zipcodeInput = page.locator('#zipcode');
    this.mobileNumberInput = page.locator('#mobile_number');
    this.createAccountButton = page.locator('[data-qa="create-account"]');
    this.accountCreatedText = page.locator('h2:has-text("Account Created!")');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async completeSignup(user: NewUser): Promise<void> {
    await this.clickAndWait(this.titleMr);
    await this.fill(this.passwordInput, user.password);
    await this.daysSelect.selectOption(user.birthDay);
    await this.monthsSelect.selectOption(user.birthMonth);
    await this.yearsSelect.selectOption(user.birthYear);
    await this.fill(this.firstNameInput, user.firstName);
    await this.fill(this.lastNameInput, user.lastName);
    await this.fill(this.addressInput, user.address);
    await this.countrySelect.selectOption(user.country);
    await this.fill(this.stateInput, user.state);
    await this.fill(this.cityInput, user.city);
    await this.fill(this.zipcodeInput, user.zipcode);
    await this.fill(this.mobileNumberInput, user.mobileNumber);
    await this.clickAndWait(this.createAccountButton);
  }

  async continueAfterAccountCreated(): Promise<void> {
    await this.clickAndWait(this.continueButton);
  }
}
