# Automation Exercise — QA Automation Framework

A Playwright + TypeScript test automation framework covering both **UI**
(Page Object Model) and **API** testing against
[automationexercise.com](https://automationexercise.com), a public
e-commerce practice site with a documented REST API.

Built as a Middle+ QA Engineer portfolio piece — the goal isn't just "tests
that pass," it's a framework structured the way a real one would be, with
the reasoning behind each decision written down rather than assumed.

## Why this target site

automationexercise.com was chosen deliberately over a UI-only demo (like a
single login form) because it lets one coherent framework demonstrate:
- A real multi-step user journey (signup → login → browse → search → cart)
- A **documented, stable REST API** covering the same domain (products,
  accounts), so UI and API tests validate the same business logic from two
  angles instead of being two disconnected toy examples
- Enough surface area for meaningful **negative testing** (wrong HTTP verbs,
  missing parameters, duplicate emails) — not just happy-path clicking

## Architecture

```
qa-automation-framework/
├── playwright.config.ts       # config-driven: base URLs from .env, separate
│                               # projects for UI (3 browsers) and API
├── ui/pages/                  # Page Object Model
│   ├── BasePage.ts            # shared waits/actions every page inherits
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   ├── SignupPage.ts
│   ├── ProductsPage.ts
│   └── CartPage.ts
├── api/clients/                # typed API client wrappers (one per domain)
│   ├── ProductsApiClient.ts
│   └── AccountApiClient.ts
├── fixtures/test-data.ts       # shared types & static test data
├── utils/userFactory.ts        # generates unique test users (Faker)
├── tests/
│   ├── ui/                     # *.spec.ts — Playwright test files, UI
│   └── api/                    # *.spec.ts — Playwright test files, API
├── docs/
│   ├── TEST_PLAN.md            # scope, risk-based prioritization, exit criteria
│   ├── TEST_CASES.md           # human-readable test case catalog
│   ├── SAMPLE_BUG_REPORT.md    # a real defect found while building this
│   └── KNOWN_GAPS.md           # honest list of what's not covered yet, and why
└── .github/workflows/qa-suite.yml  # CI: separate UI and API jobs
```

### Key decisions, and the reasoning behind them

**Why Page Object Model, and why a `BasePage`?**
POM keeps selectors and low-level Playwright calls out of test files, so a
test reads as business intent (`login.login(email, password)`) rather than
raw locator chains. `BasePage` exists specifically so a change to *how*
waits/clicks work (e.g. adding a retry) is a one-file edit, not a
find-and-replace across six page classes — the same reasoning behind any
shared base class, applied here to browser automation specifically.

**Why separate `ui-chromium` / `ui-firefox` / `ui-webkit` / `api` projects
in one config, instead of one generic project?**
Because in a real team, "run the fast API checks on every commit" and "run
the full three-browser UI suite nightly" are genuinely different needs with
different cost/signal tradeoffs. Modeling that as separate Playwright
projects — rather than one undifferentiated `npx playwright test` — means
the CI pipeline (see below) can make that same distinction without any
extra test-code changes.

**Why API clients (`ProductsApiClient`, `AccountApiClient`) instead of
calling `request.get(...)` directly in test files?**
Same motivation as POM for the UI side: if an endpoint path or default
header changes, that's a one-file fix. It also makes test files read as
"what is being verified" rather than "how the HTTP call is constructed."

**Why generate a unique test user per run instead of a fixed fixture
account?**
automationexercise.com's `/signup` and `/createAccount` both reject an
email that's already registered. A hardcoded fixture email works exactly
once, then poisons every subsequent CI run with a false failure — a classic,
avoidable source of flaky suites. `utils/userFactory.ts` generates a
timestamp + random-suffixed email per run instead, and the API account
tests **delete the account they created** in the same test, so repeated CI
runs don't accumulate orphaned data on the shared target site either.

**Why tag tests `@smoke` / `@regression` instead of running everything the
same way?**
See `docs/TEST_PLAN.md` for the full risk-based reasoning — the short
version: `@smoke` covers flows that block a release if broken (registration,
login, core API contracts) and are meant to gate every PR; `@regression`
covers real but lower-blast-radius coverage (search edge cases, cart
math, malformed-request handling) that runs nightly instead, so a flaky
`@regression` test doesn't block an unrelated PR.

**Why is checkout/payment explicitly NOT automated?**
Documented as a deliberate scope decision in `docs/TEST_PLAN.md`, not an
oversight — the site's payment step is fake/mock, so automating it would
mostly test the site's own mock logic rather than anything transferable.
Knowing what *not* to automate, and writing down why, is part of the
test-strategy judgment this portfolio is meant to demonstrate.

## Getting Started

```bash
git clone <your-repo-url>
cd qa-automation-framework
npm install
npx playwright install --with-deps   # downloads browser binaries

cp .env.example .env                 # defaults already point at the public site
```

## Running Tests

```bash
npm test                    # everything: all 3 UI browsers + API
npm run test:ui             # UI tests, Chromium only
npm run test:ui:all-browsers  # UI tests across Chromium, Firefox, WebKit
npm run test:api            # API tests only
npm run test:smoke          # only @smoke-tagged tests, any project
npm run test:regression     # only @regression-tagged tests
npm run test:headed         # UI tests with a visible browser window
npm run report              # open the last HTML report
```

## CI

`.github/workflows/qa-suite.yml` runs on every push/PR to `main`, nightly on
a schedule, and on-demand via `workflow_dispatch`. UI and API tests run as
separate jobs so a UI failure doesn't block visibility into API results (and
vice versa). The Playwright HTML report and failure traces are uploaded as
build artifacts either way, so a failed CI run is debuggable without
re-running anything locally.

## Documentation

- [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) — scope, risk-based test
  prioritization, environments, exit criteria
- [`docs/TEST_CASES.md`](docs/TEST_CASES.md) — human-readable test case
  catalog with priority and automation status
- [`docs/SAMPLE_BUG_REPORT.md`](docs/SAMPLE_BUG_REPORT.md) — a real API
  contract issue found while building this suite, written up the way a
  report to a dev team would look
- [`docs/KNOWN_GAPS.md`](docs/KNOWN_GAPS.md) — honest list of what isn't
  covered yet and why, including how performance testing would be
  approached against a real (non-practice-site) backend

## Stack

- [Playwright](https://playwright.dev/) + TypeScript
- [Faker](https://fakerjs.dev/) for test data generation
- GitHub Actions for CI
