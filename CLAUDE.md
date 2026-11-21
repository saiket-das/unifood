# UniFood — Project Rules

These rules apply to every part of the monorepo: `apps/backend`, `apps/student-app`,
`apps/restaurant-pos`, `apps/admin-dashboard`, and `packages/`. They are mandatory.

Specs live in `docs/` (APP_FLOW, PLAN, PRD, SCHEMA, TRD). Where a rule below conflicts
with an example in the docs, this file wins.

---

## 1. API success response — always the same envelope

Every successful backend response uses this exact shape. No endpoint returns a bare
object, array, or string.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Order created successfully",
  "data": { },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-11-22T10:00:00.000Z",
    "pagination": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 }
  }
}
```

- `statusCode` always matches the real HTTP status (200, 201, …). Don't use 204; return
  200 with `data: null` so every response has a body.
- `message` is human-readable and safe to show to users.
- `data` is the payload (`null` when there is none).
- `meta.pagination` is present only on paginated collections.
- **Backend:** build responses in one place only (a global interceptor + a shared
  `sendResponse` helper). Controllers never hand-craft the envelope.
- **Shared type:** define `ApiResponse<T>` once in `packages/` and use it in every app.

## 2. API error response — always the same envelope

Every error (validation, auth, not found, business rule, unexpected) uses this shape:

```json
{
  "success": false,
  "statusCode": 422,
  "message": "The selected item is no longer available.",
  "error": {
    "code": "ORDER_ITEM_UNAVAILABLE",
    "details": [
      { "field": "items[0].menuItemId", "message": "Item is out of stock" }
    ]
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-11-22T10:00:00.000Z"
  }
}
```

- `error.code` is a stable UPPER_SNAKE_CASE code from a central error-code registry.
  Frontends branch on `code`, never on `message` text.
- `error.details` is optional, used for field-level validation errors.
- **Backend:** one global exception filter converts every thrown error to this shape.
  Never expose stack traces, SQL/Prisma errors, or internal IDs to clients — log them
  server-side with the `requestId`.
- **Frontends:** one shared API client parses this envelope. Errors are shown to the
  user through one shared mechanism (e.g. a toast / form-error helper), always using
  `message`, with the same look across all apps. No per-page ad-hoc error handling.

## 3. Never hardcode actor roles

- Never assign, grant, or default a user's role in code (e.g. `role: 'OWNER'`,
  `isAdmin = true`, `if (email === ...)`). Roles come from the database
  (`platform_roles`, `user_platform_roles`, restaurant membership) via sign-up,
  invitation, or admin action.
- Authorization checks use **permissions** (e.g. `order.refund`, `menu.update`) resolved
  from the user's roles in the database — not `if (user.role === 'MANAGER')` scattered
  in code.
- Use guards/decorators (`@RequirePermissions(...)`) on the backend. Frontends only hide
  or show UI based on permissions returned by the API; the backend is always the
  source of truth.
- Seed data may create roles for local/dev setup only, never in application logic.

## 4. Never hardcode business rules

Values like prices, tax rates, service charges, delivery fees, order limits, opening
hours, cancellation windows, commission rates, timeouts, and status transitions must
not be literals in code.

- Store them in the database (restaurant settings, platform configuration) or in
  typed config loaded from environment variables.
- Put each rule's logic in one domain service, not duplicated across controllers or
  frontends.
- Frontends read these values from the API; they never re-implement or duplicate
  backend business rules (display-only formatting is fine).
- Secrets and environment-specific values live in `.env` (never committed);
  `.env.example` documents every key.

## 5. Verify every API before committing

Before committing any API change, verify and confirm each item:

- [ ] Success response matches the envelope in §1 (status code, message, data, meta).
- [ ] Every error path matches the envelope in §2 (validation, 401, 403, 404, 409, 422, 500).
- [ ] Input is validated with DTOs; unknown fields are rejected.
- [ ] Auth guard and permission checks are applied; tested with a user **without**
      permission (expect 403) and **without** a token (expect 401).
- [ ] Resource ownership / tenant scoping is enforced (one restaurant can never read or
      change another restaurant's data; IDOR checked).
- [ ] No sensitive data in responses (password hashes, tokens, internal fields).
- [ ] No SQL/NoSQL injection, mass assignment, or unbounded queries (pagination limits).
- [ ] Rate limiting / idempotency applied where the TRD requires it.
- [ ] No hardcoded roles or business rules (§3, §4).
- [ ] Lint, type-check, and tests pass.

If any item fails, fix it before committing. Do not commit "to fix later".

## 6. Git workflow

- **Never push directly to `main`.** All work goes to `dev` or a feature branch
  (`feat/...`, `fix/...`), and reaches `main` only through a pull request.
- Never force-push to `main` or `dev` without explicit approval, and always
  `git fetch` and check the remote first.
- Never add Claude/AI attribution (co-author trailers, "Generated with" lines, logos)
  to commits or PRs.
- Never commit `.env` files or secrets.
