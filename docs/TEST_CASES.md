# Test Cases — Manual Reference

This is the human-readable test case catalog the automated suite in `tests/`
implements. Kept as a separate document (rather than only living inside code
comments) so a non-technical stakeholder — a PM, a manual QA teammate, a
new hire — can review coverage without reading TypeScript.

Format: **ID | Title | Priority | Steps | Expected Result**

---

### TC-01 — Register with valid, unique data
**Priority:** Critical
**Automated:** `tests/ui/registration.spec.ts`, `tests/api/account.spec.ts`

**Steps:**
1. Navigate to the Signup/Login page
2. Enter a unique name and email, submit
3. Fill in the full account details form
4. Submit

**Expected result:** Account is created, "Account Created!" confirmation is
shown, and the user is logged in under their name on the home page.

---

### TC-02 — Register with an email that already exists
**Priority:** High
**Automated:** `tests/ui/registration.spec.ts`

**Steps:**
1. Complete TC-01 for a given email
2. Log out
3. Attempt to sign up again with the same email

**Expected result:** Inline error: "Email Address already exist!" — no
second account is created.

---

### TC-03 — Log in with valid credentials
**Priority:** Critical
**Automated:** `tests/ui/login.spec.ts`, `tests/api/account.spec.ts`

**Expected result:** User is redirected to the home page and shown as
"Logged in as [name]".

---

### TC-04 — Log in with invalid/unregistered credentials
**Priority:** Critical
**Automated:** `tests/ui/login.spec.ts`, `tests/api/account.spec.ts`

**Expected result:** Inline error: "Your email or password is incorrect!"
(UI) / `responseCode: 404`, "User not found!" (API). User remains logged out.

---

### TC-05 — Log out
**Priority:** High
**Automated:** `tests/ui/login.spec.ts`

**Expected result:** User is returned to a logged-out state; the
Signup/Login link reappears in the header.

---

### TC-06 — Search for an existing product
**Priority:** Medium
**Automated:** `tests/ui/product-search.spec.ts`, `tests/api/products.spec.ts`

**Expected result:** "Searched Products" heading is shown, with one or more
matching product cards/results.

---

### TC-07 — Search for a term with no matches
**Priority:** Medium
**Automated:** `tests/ui/product-search.spec.ts`, `tests/api/products.spec.ts`

**Expected result:** "Searched Products" heading is shown with zero results
— no error state, no stale results from a previous search.

---

### TC-08 — Add multiple products to the cart
**Priority:** High
**Automated:** `tests/ui/cart.spec.ts`

**Expected result:** Cart reflects the correct number of line items, each
with quantity 1 (default).

---

### TC-09 — Remove a product from the cart
**Priority:** Medium
**Automated:** `tests/ui/cart.spec.ts`

**Expected result:** Item is removed from the cart view immediately; if it
was the only item, the "cart is empty" state is shown.

---

### TC-10 — API: GET /productsList
**Priority:** Critical
**Automated:** `tests/api/products.spec.ts`

**Expected result:** HTTP 200, `responseCode: 200`, non-empty `products`
array, each product has `id`, `name`, `price`, `brand`, `category`.

---

### TC-11 — API: unsupported HTTP verbs are rejected predictably
**Priority:** Medium
**Automated:** `tests/api/products.spec.ts`, `tests/api/account.spec.ts`

**Covers:** `POST /productsList`, `PUT /brandsList` (documented in
`api_list`, not yet automated — see `docs/KNOWN_GAPS.md`), `DELETE /verifyLogin`.

**Expected result:** `responseCode: 405` with a clear "this request method
is not supported" message — not a raw 500 or an unhandled exception.

---

### TC-12 — API: malformed requests return informative 400s, not 500s
**Priority:** High
**Automated:** `tests/api/products.spec.ts` (`searchProduct`),
`tests/api/account.spec.ts` (`verifyLogin`)

**Expected result:** `responseCode: 400` and a message naming the missing
parameter — confirms the API validates input rather than failing opaquely.
