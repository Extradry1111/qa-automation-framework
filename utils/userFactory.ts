import { faker } from '@faker-js/faker';
import { NewUser } from '../fixtures/test-data';

/**
 * Generates a fresh, unique user for signup/registration tests.
 *
 * Why generate rather than hardcode: automationexercise.com's /signup
 * endpoint rejects an email that's already registered, so a hardcoded
 * fixture email would only work once, then every subsequent CI run would
 * fail with "Email Address already exist!" — a classic source of flaky,
 * environment-poisoning tests. Generating a unique email per run avoids
 * that entirely and means tests can run repeatedly without manual cleanup.
 */
export function generateNewUser(overrides: Partial<NewUser> = {}): NewUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    name: `${firstName} ${lastName}`,
    email: `qa.portfolio.${Date.now()}.${faker.string.alphanumeric(6)}@mailinator.com`,
    password: faker.internet.password({ length: 12 }),
    birthDay: String(faker.number.int({ min: 1, max: 28 })),
    birthMonth: String(faker.number.int({ min: 1, max: 12 })),
    birthYear: String(faker.number.int({ min: 1970, max: 2002 })),
    firstName,
    lastName,
    address: faker.location.streetAddress(),
    country: 'United States',
    state: faker.location.state(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode(),
    mobileNumber: faker.phone.number({ style: 'international' }).replace(/\s/g, ''),
    ...overrides,
  };
}
