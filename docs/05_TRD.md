# UM Food --- Technical Requirements Document (TRD)

**Version:** 1.0\
**Status:** Proposed technical baseline\
**Backend:** NestJS\
**Frontend:** Next.js\
**Database:** PostgreSQL

## 1. Purpose

This document defines the technical architecture, application
boundaries, API conventions, data handling, security, reliability and
deployment requirements for UM Food.

It complements the PRD and logical database schema. It is not a
substitute for implementation-level API specifications or reviewed
database migrations.

## 2. Architecture decisions

  Concern              Decision
  -------------------- -------------------------------------------------------
  Architecture style   Modular monolith initially
  Backend framework    NestJS + TypeScript
  Frontend             Next.js + TypeScript
  API                  Versioned REST
  Realtime             WebSocket gateway
  Database             PostgreSQL
  ORM                  Prisma
  Queue/cache          Redis + BullMQ
  Validation           DTOs with class-validator or Zod at shared boundaries
  API documentation    OpenAPI/Swagger
  File storage         S3-compatible object storage or managed storage
  Telegram             Official Telegram Bot API
  Deployment           Docker-based managed hosting
  Observability        Structured logs, metrics and error tracking

Do not begin with microservices. Separate modules and clear interfaces
are sufficient for the initial scale. Extract a service only when
deployment, scaling or ownership needs justify it.

## 3. High-level architecture

``` mermaid
flowchart TB
    STUDENT[Student Next.js PWA]
    POS[Restaurant POS Next.js]
    ADMIN[Admin Next.js]
    TG[Telegram Group and Bot]
    API[NestJS API]
    WORKER[Background Worker]
    DB[(PostgreSQL)]
    REDIS[(Redis / BullMQ)]
    STORAGE[Object Storage]
    PAY[Payment Provider - Later]
    MAPS[Maps / Geocoding Provider]

    STUDENT --> API
    POS --> API
    ADMIN --> API
    TG <--> API
    API <--> DB
    API <--> REDIS
    WORKER <--> REDIS
    WORKER <--> DB
    API --> STORAGE
    API --> MAPS
    API -. future integration .-> PAY
```

## 4. Application boundaries

### 4.1 Student application

Responsibilities:

-   Authentication UI.
-   Restaurant and menu discovery.
-   Search and filters.
-   Cart and checkout.
-   Dine-in, takeaway and delivery selection.
-   Order tracking.
-   Favourites, history and reviews.
-   Recommendation feed.

The client must not calculate authoritative prices or decide
permissions.

### 4.2 Restaurant application

Responsibilities:

-   POS order entry.
-   Table and dining-session management.
-   Menu and pricing administration.
-   Online order inbox.
-   Kitchen display.
-   Bills and payments.
-   Shift management.
-   Reports and staff management.

POS should be optimised for touch interaction and rapid repeated
actions.

### 4.3 Admin application

Responsibilities:

-   Restaurant application review.
-   User and rider administration.
-   Platform configuration.
-   Dispute and report management.
-   Service monitoring.
-   Audit log access.

### 4.4 NestJS API

The API owns all business rules, authorisation, price calculations,
state transitions and database writes.

## 5. NestJS module boundaries

Suggested modules:

  Module                  Responsibility
  ----------------------- ----------------------------------------------
  AuthModule              Login, refresh, session and account security
  UsersModule             User profiles and preferences
  AccessControlModule     Roles, permissions and guards
  RestaurantsModule       Restaurant profiles, locations and settings
  StaffModule             Restaurant memberships and invitations
  MenusModule             Categories, items, variants and add-ons
  PricingModule           Price rules, calculations and overrides
  PosModule               Staff order-entry commands
  TablesModule            Restaurant tables and table state
  DiningSessionsModule    Open sessions and transfers
  OrdersModule            Unified order lifecycle
  KitchenModule           Stations, tickets and preparation state
  BillingModule           Bills, bill items and balances
  PaymentsModule          Payment records, allocations and refunds
  ShiftsModule            Cashier shifts and cash movements
  DeliveryModule          Jobs, offers, assignment and status
  TelegramModule          Bot updates and Telegram message delivery
  RecommendationsModule   Feed ranking and interaction signals
  NotificationsModule     In-app and push notification orchestration
  AnalyticsModule         Aggregates and reports
  AdminModule             Platform-level operations
  AuditModule             Sensitive action history

Modules should expose application services rather than importing one
another's Prisma internals. Avoid circular module dependencies.

## 6. Repository structure

A monorepo is recommended.

``` text
um-food/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── modules/
│   │       ├── common/
│   │       ├── config/
│   │       └── main.ts
│   ├── worker/
│   │   └── src/
│   ├── student/
│   ├── restaurant/
│   └── admin/
├── packages/
│   ├── contracts/
│   ├── shared-types/
│   ├── validation/
│   ├── ui/
│   └── config/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── infra/
│   ├── docker/
│   └── deployment/
├── docs/
│   ├── APP_FLOW.md
│   ├── PLAN.md
│   ├── PRD.md
│   ├── SCHEMA.md
│   └── TRD.md
├── docker-compose.yml
└── README.md
```

## 7. API standards

### 7.1 Conventions

-   Base path: `/api/v1`.
-   JSON request and response bodies.
-   UUID resource identifiers.
-   ISO-8601 timestamps in UTC.
-   Money represented as integer minor units and currency code.
-   Pagination for collections.
-   Consistent error envelope.
-   DTO validation on all external input.
-   Swagger/OpenAPI generated from API definitions.
-   Idempotency keys on order creation, payment recording where
    appropriate and other retryable commands.

Example success response:

``` json
{
  "data": {
    "id": "uuid",
    "status": "ACCEPTED"
  },
  "meta": {
    "requestId": "request-id"
  }
}
```

Example error response:

``` json
{
  "error": {
    "code": "ORDER_NOT_AVAILABLE",
    "message": "The selected item is no longer available.",
    "requestId": "request-id"
  }
}
```

Do not expose stack traces or internal database details to clients.

### 7.2 Endpoint groups

**Authentication** - `POST /api/v1/auth/register` -
`POST /api/v1/auth/login` - `POST /api/v1/auth/refresh` -
`POST /api/v1/auth/logout` - `POST /api/v1/auth/verify-email`

**Student discovery** - `GET /api/v1/restaurants` -
`GET /api/v1/restaurants/:id` - `GET /api/v1/restaurants/:id/menu` -
`GET /api/v1/search` - `GET /api/v1/recommendations`

**Orders** - `POST /api/v1/orders` - `GET /api/v1/orders` -
`GET /api/v1/orders/:id` - `POST /api/v1/orders/:id/cancel`

**POS** - `POST /api/v1/pos/orders` - `GET /api/v1/pos/orders` -
`POST /api/v1/pos/orders/:id/accept` -
`POST /api/v1/pos/orders/:id/reject` -
`PATCH /api/v1/pos/orders/:id/status`

**Tables and sessions** -
`GET /api/v1/restaurants/:restaurantId/tables` -
`POST /api/v1/tables/:tableId/sessions` -
`POST /api/v1/dining-sessions/:id/orders` -
`POST /api/v1/dining-sessions/:id/transfer` -
`POST /api/v1/dining-sessions/:id/close`

**Bills and payments** - `POST /api/v1/dining-sessions/:id/bills` -
`GET /api/v1/bills/:id` - `POST /api/v1/bills/:id/payments` -
`POST /api/v1/payments/:id/refunds`

**Delivery** - `POST /api/v1/delivery-jobs` -
`GET /api/v1/delivery-jobs/:id/offers` -
`POST /api/v1/delivery-jobs/:id/offers` -
`POST /api/v1/delivery-jobs/:id/assign` -
`PATCH /api/v1/delivery-jobs/:id/status`

Endpoint details, DTOs, error codes and permission requirements must be
specified before implementation.

## 8. Realtime requirements

Use NestJS WebSocket Gateway or a compatible managed realtime transport.

Suggested events:

``` text
order.created
order.accepted
order.rejected
order.preparing
order.ready
order.completed
order.cancelled

table.status_changed
dining_session.updated
bill.updated

kitchen.ticket.created
kitchen.ticket.updated

delivery.offer_received
delivery.assigned
delivery.picked_up
delivery.delivered
```

Room/channel access must be authorised:

-   Student: own orders only.
-   Restaurant staff: only their restaurant's orders/tables/tickets,
    subject to role.
-   Rider: only jobs and details relevant to their offers or
    assignments.
-   Admin: only according to platform permissions.

Do not trust a client-provided room identifier without checking the
user's access.

## 9. Transaction and concurrency requirements

Use PostgreSQL transactions for operations that must succeed or fail
together.

### 9.1 Order creation

Within one transaction:

1.  Validate restaurant and item availability.
2.  Load current item, variant and add-on prices.
3.  Recalculate line totals and order total.
4.  Create order and item snapshots.
5.  Create status history.
6.  Insert an outbox event.
7.  Commit.

Use an idempotency key to prevent duplicate orders from client retries.

### 9.2 Dining session and table concurrency

-   Lock or conditionally update table/session records when opening a
    session.
-   Enforce one open session per table with a database constraint.
-   Use transaction-safe table transfers.
-   Do not close a session with an unpaid balance unless an authorised
    exception workflow exists.

### 9.3 Payment allocation

-   Lock the bill row while allocating payment.
-   Validate that allocation does not exceed allowed outstanding balance
    unless overpayment handling is explicitly supported.
-   Update paid and balance amounts transactionally.
-   Use provider idempotency/webhook event IDs when gateway integration
    is added.

### 9.4 Rider assignment

-   Validate job is still in OFFERING state.
-   Validate selected offer belongs to that job and is eligible.
-   Atomically change job state and create one assignment.
-   Enforce a unique assignment per job.
-   Mark other offers not selected in the same transaction.
-   Notify Telegram and student through an outbox/worker after commit.

## 10. Background jobs and event delivery

Use Redis and BullMQ for:

-   Telegram message sending.
-   Telegram update processing where appropriate.
-   Notifications.
-   Email verification.
-   Recommendation refreshes.
-   Analytics aggregation.
-   Expiring delivery offers.
-   Retryable external integrations.

Use a transactional outbox table in PostgreSQL for critical events. A
worker publishes outbox events to queues and marks them processed. This
prevents database commits from being separated from important event
publication.

Jobs must be idempotent and have bounded retries, backoff and
dead-letter/error handling.

## 11. Telegram integration requirements

-   Use the official Telegram Bot API.
-   Obtain group administrator permission before adding/configuring the
    bot.
-   Use structured callback buttons or bot commands for offers.
-   Link rider accounts using a one-time, expiring token.
-   Riders must start the bot before the bot can reliably send them
    private messages.
-   Do not depend on scraping arbitrary group messages.
-   Do not assume bots can read messages from other bots.
-   Do not expose exact customer drop-off details in a public group.
-   Persist Telegram chat/message identifiers for updates.
-   Keep the delivery job in PostgreSQL if Telegram is unavailable.
-   Provide a manual operator fallback.

Webhook endpoint must verify the configured Telegram webhook secret
token and reject unexpected updates. Store bot credentials in a secrets
manager/environment configuration, never in source control.

## 12. Pricing and financial calculation requirements

-   Use integer sen or fixed-precision decimal values.
-   Never use JavaScript floating-point arithmetic as the financial
    source of truth.
-   Server recalculates all totals.
-   Validate quantity precision by unit of measure.
-   Snapshot unit prices and modifiers at order creation.
-   Record discounts and charges as explicit line/adjustment records.
-   Record custom price actor, reason and original/final amount.
-   Keep restaurant food payments and rider delivery-fee payments
    separate.
-   A QR display or user-submitted screenshot is not authoritative
    gateway confirmation.
-   Reconcile gateway webhooks against provider references when
    integrated.

## 13. Security requirements

### Authentication

-   Use short-lived access tokens and secure refresh-token rotation.
-   Hash passwords with a suitable password hashing algorithm if
    password auth is used.
-   Revoke refresh sessions on logout or account compromise.
-   Rate-limit authentication and sensitive endpoints.

### Authorization

-   Use guards and permission checks.
-   Scope restaurant data by membership.
-   Do not rely on frontend hiding controls.
-   Check ownership for every resource identifier.
-   Restrict refunds, price overrides, staff administration and reports.

### Data protection

-   TLS for all external traffic.
-   Encrypt sensitive stored data where appropriate.
-   Store secrets outside source control.
-   Minimise precise location collection.
-   Define retention and deletion policies.
-   Publish privacy notice and terms.
-   Review Malaysian PDPA requirements and current guidance before
    launch.

### Application security

-   Validate and sanitise inputs.
-   Apply CORS allowlists.
-   Protect against brute force and abuse.
-   Secure file uploads and restrict file types/size.
-   Keep dependencies patched.
-   Perform backup and restore testing.
-   Avoid logging passwords, tokens, payment credentials or unnecessary
    personal data.

## 14. Offline POS requirements

The POS should tolerate temporary connectivity loss, but offline
behaviour must be carefully scoped.

-   Use IndexedDB for a local queue of eligible commands.
-   Assign a client-generated idempotency key to each queued command.
-   Show clear states: Local Pending, Syncing, Server Confirmed, Failed.
-   Do not represent a local order as accepted by the server until
    synchronised.
-   Do not claim an online payment succeeded without provider
    confirmation.
-   Resolve menu/price conflicts by server validation.
-   Provide staff with a retry/review workflow.
-   Keep a local audit trail sufficient to diagnose synchronisation
    issues.

A first pilot may launch online-only if offline synchronisation cannot
be tested safely. Do not advertise offline support until it is reliable.

## 15. Recommendation technical requirements

Initial ranking should be a backend service using explainable signals:

-   Location relevance.
-   Historical category/item preference.
-   Favourites.
-   Recent restaurant popularity.
-   Time of day.
-   Budget fit.
-   Availability and operating status.

Apply hard availability filters before ranking. Record algorithm version
and recommendation impressions so results can be evaluated.

Later stages may add collaborative filtering and a heterogeneous
graph/PPR model. Do not add a graph database until actual data and query
needs justify it; PostgreSQL relationships are adequate for initial
graph experiments.

## 16. Performance and scalability

Initial engineering targets to validate in testing:

-   Common read endpoints should return quickly under expected pilot
    load.
-   POS order creation should feel immediate under normal connectivity.
-   Paginate restaurant, order and report listings.
-   Add indexes for restaurant/date/status and user/date access
    patterns.
-   Cache only data that can tolerate short-lived staleness, such as
    public restaurant listings.
-   Do not cache authoritative bill balances or payment state as the
    source of truth.
-   Use connection pooling and bounded worker concurrency.
-   Monitor database query latency and queue backlog.

Set numeric service-level objectives only after load testing and pilot
measurements.

## 17. Observability and operations

-   Structured JSON logs with request/correlation IDs.
-   Error monitoring for frontend and backend.
-   Metrics for API latency, error rate, queue backlog and failed jobs.
-   Audit events for financial and access-sensitive operations.
-   Health and readiness endpoints.
-   Database backup monitoring.
-   Alerts for Telegram webhook failures and delivery queue backlog.
-   Document incident response and manual delivery fallback.

## 18. Testing strategy

### Unit tests

-   Pricing calculations.
-   Permission rules.
-   Order and delivery state transitions.
-   Bill balance and payment allocations.
-   Recommendation scoring.

### Integration tests

-   Prisma repositories and PostgreSQL transactions.
-   Order creation and idempotency.
-   One-open-session-per-table constraint.
-   Rider assignment concurrency.
-   Payment allocation concurrency.
-   Outbox and queue retries.

### End-to-end tests

-   Staff takeaway order.
-   Staff dine-in session with multiple orders.
-   Custom price override.
-   Student-app dine-in order with staff table assignment.
-   Student takeaway order.
-   Student delivery order and Telegram rider offer.
-   Partial and split payments.
-   Shift close and cash reconciliation.

### Security tests

-   Cross-restaurant data access.
-   Role escalation.
-   Unauthorised refunds and price changes.
-   Webhook verification.
-   Resource ID enumeration.
-   Sensitive data leakage in Telegram messages and logs.

## 19. Deployment environments

Use separate environments:

-   Local development.
-   Test/CI.
-   Staging with test Telegram group and payment sandbox.
-   Production.

Production must use separate credentials, database, Telegram bot
configuration and storage buckets from staging.

Deploy API and worker as separate processes from the same codebase where
practical. Apply database migrations through a controlled release step,
not automatically on every application boot.

## 20. CI/CD requirements

Pipeline should:

1.  Install locked dependencies.
2.  Run formatting and linting.
3.  Run type checks.
4.  Run unit tests.
5.  Run integration tests against a test database.
6.  Validate Prisma schema and migrations.
7.  Build all applications.
8.  Run dependency/security checks.
9.  Deploy to staging.
10. Run smoke tests.
11. Require approval for production deployment.

## 21. Technical decisions still requiring confirmation

-   Hosting provider and deployment region.
-   Whether managed PostgreSQL or self-managed PostgreSQL will be used.
-   Authentication provider versus NestJS-managed authentication.
-   Payment gateway and merchant settlement model.
-   Maps/geocoding provider and pricing.
-   Push notification provider.
-   Whether POS offline mode is required for the first pilot.
-   Receipt printer hardware and browser/OS compatibility.
-   Restaurant-specific tax/service-charge configuration.
-   Data retention and account deletion policy.
-   Whether UM email verification can use an approved university
    identity mechanism.

## 22. Release readiness checklist

-   [ ] API and database migrations reviewed.
-   [ ] Restaurant tenant isolation tested.
-   [ ] POS workflows tested on target tablet/desktop devices.
-   [ ] Price and payment calculations tested.
-   [ ] Order and rider assignment concurrency tested.
-   [ ] Telegram test group approved and configured.
-   [ ] Webhook secret verification enabled.
-   [ ] Manual delivery fallback documented.
-   [ ] Privacy notice and terms reviewed.
-   [ ] Backup restore tested.
-   [ ] Monitoring and alerting enabled.
-   [ ] Restaurant and student support process documented.
