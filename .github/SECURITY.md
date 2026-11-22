# Security Policy

UM Food handles student accounts, restaurant sales and payment records, and
rider delivery details. We take reports about any of these seriously.

## Supported versions

The project is in pre-release development. Only the latest code on `main` and
`dev` receives security fixes. There are no versioned releases yet.

## Reporting a vulnerability

**Do not open a public issue, pull request or discussion for a security
problem.**

Report it privately through GitHub:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Include:
   - the affected app (`backend`, `student-app`, `restaurant-pos`, `admin`) or
     integration (Telegram bot, payments)
   - steps to reproduce, with requests or screenshots where possible
   - the impact you observed, for example which data or actions were exposed
   - any suggested fix

What to expect:

- We aim to acknowledge reports within 3 business days.
- We will confirm whether the issue is accepted, agree on a fix timeline, and
  keep you updated until it is resolved.
- Please give us reasonable time to fix the issue before disclosing it
  publicly. We will credit you in the fix unless you prefer not to be named.

## Scope

In scope:

- Authentication, sessions and account takeover
- Missing permission checks, or one restaurant reading or changing another
  restaurant's data
- Order, price, payment or refund manipulation
- Exposure of personal data such as student contact details or delivery
  locations, including through Telegram messages
- Forged or replayed Telegram webhook updates
- Leaked secrets or credentials in the repository

Out of scope:

- Vulnerabilities in third-party services themselves (Telegram, hosting,
  payment providers). Report those to the provider.
- Denial-of-service, spam or load testing
- Social engineering or physical attacks
- Findings that require an already-compromised device or account

## Testing guidelines

- Use only accounts and restaurants you created yourself.
- Do not access, change or delete other people's data. If you reach real data
  by accident, stop, do not keep it, and tell us in your report.
- Never post test requests to a live Telegram rider group or contact real
  riders, students or restaurants.
- Do not run automated scanners against shared or production environments.

## For contributors

- Never commit `.env` files, tokens or credentials. Each app documents its
  keys in its own `.env.example`.
- If a secret is committed by mistake, rotate it immediately. Removing it from
  Git history is not enough.
- Follow the API and permission rules in [CLAUDE.md](../CLAUDE.md) before
  merging any change.
