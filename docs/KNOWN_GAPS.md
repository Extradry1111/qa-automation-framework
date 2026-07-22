# Known Gaps & Deliberate Scope Decisions

An honest list of what this suite does **not** cover yet, and why — because
a portfolio that only shows finished work looks less credible than one that
shows judgment about what to prioritize first.

| Gap | Why it's not in yet | Priority if this were a real sprint |
|---|---|---|
| `PUT /brandsList` negative test | Documented in `api_list` but not yet automated — same pattern as the other wrong-verb tests, just not yet written | Low — mechanical addition, same pattern as existing tests |
| Checkout/payment flow | Deliberately out of scope — see `docs/TEST_PLAN.md` §1 | N/A by design |
| Cross-browser run in CI | `playwright.config.ts` defines `ui-firefox` and `ui-webkit` projects and they run locally, but CI currently only runs `ui-chromium` to keep pipeline time down | Medium — would add as a scheduled nightly job across all three browsers rather than on every PR |
| Performance/load testing | Out of scope for this repo | See note below |
| Accessibility (a11y) checks | Not implemented | Medium — would add `@axe-core/playwright` as a fast follow |

### If this were a real product (not a practice site): performance testing approach
Not implemented here since there's no real backend to load-test responsibly
on a shared public practice site, but the intended approach would be:
- `k6` for scripted load tests against the API layer (ramp-up/steady-state/
  spike scenarios on `/productsList` and `/verifyLogin` as the highest-traffic
  endpoints)
- Baseline captured in CI on a schedule, with a regression threshold (e.g.
  p95 latency increase >20%) failing the build rather than a hard pass/fail
  number, since absolute latency varies by environment.
