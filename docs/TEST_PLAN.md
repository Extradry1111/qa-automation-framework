# Test Plan — Automation Exercise (E-commerce)

## 1. Scope

**Application under test:** [automationexercise.com](https://automationexercise.com) — a
public e-commerce practice site with both a web UI and a documented REST API.

**In scope for this suite:**
- User registration and account lifecycle (UI + API)
- Login / logout, including invalid-credential handling (UI + API)
- Product catalog: listing, search, search edge cases (UI + API)
- Shopping cart: add, verify quantity, remove (UI)
- API contract checks: response shape, status/response codes, error messages
  for malformed requests and disallowed HTTP verbs

**Out of scope, and why:**
- **Checkout / payment.** The site's payment step accepts fake card data with
  no real gateway behind it. Automating it would mainly test the site's own
  mock validation logic, not a transferable payment flow — low value for the
  engineering effort, so it's deliberately excluded rather than automated
  "because it's there."
- **Visual regression testing.** No design system or Figma source of truth
  exists for this third-party practice site, so pixel-diffing would have
  nothing meaningful to diff against.
- **Load/performance testing.** Out of scope for this repo, but see
  `docs/TESTING_STRATEGY_NOTES.md` for how it would be approached against a
  real product.

## 2. Risk-Based Prioritization

| Area | Risk if broken | Priority | Tag |
|---|---|---|---|
| Registration | Blocks every other authenticated flow | Critical | `@smoke` |
| Login (valid + invalid) | Blocks authenticated flows; security-relevant | Critical | `@smoke` |
| Products API (GET) | Powers the entire storefront | Critical | `@smoke` |
| Account API (create/login) | Same blast radius as UI registration/login | Critical | `@smoke` |
| Product search | High-traffic feature, but has a manual workaround (browse) | Medium | `@regression` |
| Cart add/remove | Directly revenue-impacting, but isolated from other flows | Medium | `@regression` |
| Wrong-HTTP-verb / malformed-request handling | Low user-facing impact, but reveals API robustness gaps | Medium | `@regression` |

`@smoke` tests are the ones that should run on every PR and gate a merge.
`@regression` tests run on the nightly schedule and before releases — they
matter, but a transient failure shouldn't block an unrelated PR.

## 3. What's Automated vs. What Stays Manual

Automated (see `tests/`):
- Deterministic, repeatable flows with clear pass/fail criteria: registration,
  login, search, cart math, API contracts.

Deliberately left manual/exploratory in a real team setting:
- Exact visual layout/spacing review — better suited to human eyes or a
  dedicated visual-regression tool with a real baseline.
- Usability judgment calls ("does this error message actually help a
  confused user?") — automation can confirm the message *appears*, not
  whether it's *good*.
- One-off edge cases discovered during exploratory testing sessions, until
  they're either fixed or judged worth codifying into the automated suite.

## 4. Environments

| Env | Base URL | Notes |
|---|---|---|
| Target (this repo) | `https://automationexercise.com` | Public practice site, always-on |
| Local override | via `.env` `BASE_URL` / `API_BASE_URL` | Swap to a staging/local instance without touching test code |

## 5. Test Data Strategy

- New-user tests generate a **unique user per run** (see `utils/userFactory.ts`)
  using timestamp + random suffix, rather than a hardcoded fixture account.
  This avoids the single most common flakiness source in e-commerce test
  suites: a hardcoded "test user already exists" collision on the second run.
- API account tests **clean up after themselves** (delete the account they
  created) so repeated CI runs don't accumulate orphaned data on the shared
  target site.

## 6. Exit Criteria

- 100% of `@smoke` tests passing is a hard merge gate.
- `@regression` failures are triaged within one business day; a known,
  ticketed flaky test does not block a release, but an unticketed one does.
