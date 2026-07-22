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
## API Test Reliability Against automationexercise.com (Found During CI Setup)

While setting up CI for this project, the API test suite showed intermittent
and eventually consistent failures against the live target — not from a code
defect, but from a genuine limitation worth documenting rather than silently
working around.

**What was observed:**
- Some requests returned HTTP 200 with an HTML body (`<!DOCTYPE...`) instead
  of the expected JSON.
- One request (`searchProduct`) returned a hard `403 Forbidden`.

**Root cause:** automationexercise.com is protected by a bot-detection layer
that, for suspicious traffic, serves a JavaScript-based challenge page (the
"checking your browser" pattern) instead of the real API response. A
User-Agent header change — the fix that resolved an analogous issue in the
companion [Postman collection](../postman-api-collection) and
[k6 scripts](../k6-performance-testing) — does **not** resolve this, because
the challenge requires actually executing JavaScript to pass, which a raw
HTTP client (Playwright's `APIRequestContext`, k6, Newman, curl) cannot do.

This is also the likely explanation for why the **UI** test suite became
substantially more reliable after switching to the `channel: 'chrome'`
launch option (see `playwright.config.ts`): a real browser executes the
challenge's JavaScript automatically and passes it, where a plain HTTP
request cannot.

**Conclusion:** pure API-layer testing (no browser engine) against a target
with JS-based bot protection is inherently unreliable unless the client can
execute JavaScript — this isn't something a header, retry, or delay setting
can fix. This is worth knowing and stating plainly rather than chasing false
fixes indefinitely.

**What this means for this test suite:**
- The API tests in `tests/api/` remain a correct reference implementation of
  the intended contract (see `docs/SAMPLE_BUG_REPORT.md` for one real API
  contract issue found this way) — they are written the way they should be
  run in an environment without this protection layer (e.g. a staging
  environment, or a target that allowlists CI IPs).
- In a real work setting, the actual fix would be a conversation with the
  team that owns the target: either allowlist the CI runner's IP range, or
  provide a staging endpoint without the bot-detection layer for automated
  testing — not something to solve unilaterally from the test client side.
