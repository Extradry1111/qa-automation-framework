# Sample Bug Report

This is a real finding from building this suite, kept as a portfolio sample
of how a defect gets written up — not a synthetic "fill in the template"
example.

---

**Bug ID:** AE-BUG-001
**Title:** API returns HTTP 200 for disallowed-method and validation-error
responses instead of the matching HTTP status code

**Reported by:** Pavlo Lysenko
**Date:** 2026-07-22
**Environment:** Production — `https://automationexercise.com/api`
**Severity:** Medium
**Priority:** Low
**Status:** Open (documented for awareness; not expected to be fixed on a
public practice site — reported in the spirit of what a real report to a
dev team would look like)

### Summary
Several API endpoints (`/productsList`, `/verifyLogin`, and others) return
**HTTP status 200** even when the request is invalid — using an unsupported
HTTP verb, or missing a required parameter. The actual error is only
communicated inside the JSON response body via a `responseCode` field
(e.g. `405`, `400`), not via the HTTP status line itself.

### Steps to Reproduce
1. Send `POST https://automationexercise.com/api/productsList`
   (the endpoint only documents `GET` as the intended verb)
2. Observe the HTTP response status code
3. Observe the JSON response body

### Expected Result
The HTTP status code should reflect the actual outcome:
- `405 Method Not Allowed` for an unsupported HTTP verb
- `400 Bad Request` for a missing/invalid required parameter

### Actual Result
- HTTP status: `200 OK`
- Response body: `{"responseCode": 405, "message": "This request method is not supported."}`

### Why This Matters
Any API client, monitoring tool, or automated test that checks the HTTP
status code alone (a very common, reasonable first check) will incorrectly
treat this as a **successful** request. This is exactly the kind of
contract mismatch that causes downstream consumers — mobile apps,
third-party integrations, monitoring dashboards — to silently swallow
real errors. It also breaks the semantic meaning of HTTP status codes,
which most HTTP client libraries and API gateways assume is trustworthy.

### Suggested Fix
Return the matching HTTP status code (`405`, `400`, etc.) on the response
itself, in addition to or instead of the `responseCode` field in the body.
If backward compatibility with existing consumers of the current behavior
is a concern, consider versioning the API (`/api/v2/...`) rather than
silently changing the contract.

### Test Coverage
This behavior is explicitly asserted (not just worked around) in:
- `tests/api/products.spec.ts` → `POST /productsList is rejected with a
  method-not-allowed response`
- `tests/api/account.spec.ts` → `DELETE on /verifyLogin is rejected as an
  unsupported method`

Both tests assert on `responseCode` in the JSON body rather than
`response.status()`, since that's the field that actually carries the
signal today — with a comment in the test explaining why, so a future
reader doesn't "fix" the assertion to check HTTP status and break the test.
