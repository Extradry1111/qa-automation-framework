import { APIRequestContext } from '@playwright/test';
import { NewUser } from '../../fixtures/test-data';

/**
 * Wraps the account-lifecycle endpoints (register/login/update/delete).
 * Kept separate from ProductsApiClient because these two groups change
 * for different reasons (auth logic vs. catalog logic) — a small nod to
 * single-responsibility that pays off once the suite grows past a
 * handful of endpoints.
 */
export class AccountApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async verifyLogin(email?: string, password?: string) {
    const form: Record<string, string> = {};
    if (email !== undefined) form.email = email;
    if (password !== undefined) form.password = password;
    return this.request.post('/verifyLogin', { form });
  }

  async deleteVerifyLogin() {
    // /verifyLogin only supports POST/GET; DELETE is used for the
    // wrong-verb negative test.
    return this.request.delete('/verifyLogin');
  }

  async createAccount(user: NewUser) {
    return this.request.post('/createAccount', {
      form: {
        name: user.name,
        email: user.email,
        password: user.password,
        title: 'Mr',
        birth_date: user.birthDay,
        birth_month: user.birthMonth,
        birth_year: user.birthYear,
        firstname: user.firstName,
        lastname: user.lastName,
        company: 'QA Portfolio',
        address1: user.address,
        address2: '',
        country: user.country,
        zipcode: user.zipcode,
        state: user.state,
        city: user.city,
        mobile_number: user.mobileNumber,
      },
    });
  }

  async deleteAccount(email: string, password: string) {
    return this.request.delete('/deleteAccount', {
      form: { email, password },
    });
  }

  async updateAccount(user: NewUser) {
    return this.request.put('/updateAccount', {
      form: {
        name: user.name,
        email: user.email,
        password: user.password,
        title: 'Mr',
        birth_date: user.birthDay,
        birth_month: user.birthMonth,
        birth_year: user.birthYear,
        firstname: user.firstName,
        lastname: user.lastName,
        company: 'QA Portfolio',
        address1: user.address,
        address2: '',
        country: user.country,
        zipcode: user.zipcode,
        state: user.state,
        city: user.city,
        mobile_number: user.mobileNumber,
      },
    });
  }

  async getUserDetailByEmail(email: string) {
    return this.request.get(`/getUserDetailByEmail?email=${encodeURIComponent(email)}`);
  }
}
