# UM Food --- Product Requirements Document (PRD)

**Version:** 1.0\
**Status:** Working baseline\
**Product:** UM Food

## 1. Executive summary

UM Food is a university-focused food ordering and restaurant operations
platform. It combines a student-facing food discovery and ordering
application, a restaurant POS and management dashboard, platform
administration, and a Telegram-based delivery integration.

The platform supports restaurant walk-in orders, staff-entered dine-in
orders, student-app dine-in orders, takeaway and delivery. Restaurant
pricing supports fixed menu prices and authorised custom pricing.

## 2. Problem statement

Students discover and order food through fragmented restaurant channels
and informal delivery coordination. Restaurants may rely on manual
order-taking, paper records or disconnected tools for dine-in, takeaway,
sales and online orders. The existing Telegram rider community provides
a useful delivery network but relies on unstructured coordination.

UM Food aims to unify restaurant operations and student ordering while
preserving the existing delivery community's role.

## 3. Goals and non-goals

### Goals

-   Give restaurants an independently useful POS.
-   Centralise orders from staff POS and student app.
-   Support dine-in table sessions and open bills.
-   Support flexible item pricing and quantity entry.
-   Let students browse and order from participating restaurants.
-   Integrate delivery requests with Telegram.
-   Provide useful, measurable recommendations.
-   Build a reusable architecture for future campuses.

### Non-goals for MVP

-   Table QR ordering.
-   A proprietary rider fleet.
-   Multi-restaurant cart checkout.
-   Automated marketplace fund splitting or escrow.
-   Full inventory, procurement and supplier management.
-   Advanced AI recommendation models.
-   Guaranteed real-time GPS tracking of riders.
-   Official UM affiliation unless separately approved.

## 4. Personas

### Student

Wants to discover nearby food, compare menus and prices, place
dine-in/takeaway/delivery orders and track progress.

### Restaurant owner

Wants to manage menus, staff, orders, tables, payments and sales without
needing multiple disconnected tools.

### Cashier

Wants to enter orders quickly, calculate totals accurately, collect
payment and close shifts.

### Waiter

Wants to select a table, add items to its open session and send orders
to the kitchen.

### Kitchen staff

Wants clear preparation tickets with quantities, notes and station
routing.

### Rider

Wants structured delivery requests, transparent pickup/drop-off
information and a clear assignment process.

### Platform administrator

Wants to onboard restaurants, monitor service health, manage disputes
and enforce platform rules.

## 5. Product scope and confirmed decisions

  Area                   Requirement
  ---------------------- -------------------------------------
  Backend                NestJS
  Student app            Next.js PWA
  Restaurant POS         Next.js web
  Admin                  Next.js web
  Database               PostgreSQL
  ORM                    Prisma
  Cache/queues           Redis and BullMQ
  Ordering sources       STAFF_POS, STUDENT_APP
  Fulfilment types       DINE_IN, TAKEAWAY, DELIVERY
  Dine-in sources        Staff POS and student app
  Pricing                Fixed and authorised custom pricing
  Table QR               Disabled in MVP
  Delivery integration   Telegram Bot API

## 6. Functional requirements

Priority definitions: **P0** = required for MVP; **P1** = important next
increment; **P2** = later enhancement.

### 6.1 Identity and access

-   **FR-AUTH-001 (P0):** Users shall be able to register and
    authenticate securely.
-   **FR-AUTH-002 (P0):** The platform shall support student, owner,
    manager, cashier, waiter, kitchen, rider and administrator roles.
-   **FR-AUTH-003 (P0):** Restaurant staff access shall be scoped to
    their restaurant membership.
-   **FR-AUTH-004 (P0):** Owners shall invite, disable and assign roles
    to staff.
-   **FR-AUTH-005 (P0):** Sensitive actions shall require explicit
    permissions.
-   **FR-AUTH-006 (P0):** Authentication and sensitive changes shall be
    auditable.
-   **FR-AUTH-007 (P1):** UM email verification shall be configurable as
    an eligibility rule.

### 6.2 Restaurant onboarding and settings

-   **FR-REST-001 (P0):** Owners shall submit restaurant profile and
    required business information.
-   **FR-REST-002 (P0):** Administrators shall approve, reject or
    request more information.
-   **FR-REST-003 (P0):** Owners shall manage operating hours and
    temporary closure.
-   **FR-REST-004 (P0):** Owners shall configure supported fulfilment
    methods.
-   **FR-REST-005 (P1):** Owners shall manage multiple restaurant
    locations.

### 6.3 Menu and pricing

-   **FR-MENU-001 (P0):** Owners/managers shall create and manage menu
    categories and items.
-   **FR-MENU-002 (P0):** Items shall support descriptions, images,
    availability and preparation notes.
-   **FR-MENU-003 (P0):** Items shall support variants and add-ons.
-   **FR-MENU-004 (P0):** Items shall support fixed pricing.
-   **FR-MENU-005 (P0):** Authorised staff shall be able to enter
    permitted custom/open prices.
-   **FR-MENU-006 (P0):** Order lines shall support quantity and, where
    configured, weight or other units.
-   **FR-MENU-007 (P0):** Price overrides shall record original price,
    final price, actor, time and reason.
-   **FR-MENU-008 (P0):** Historical order lines shall preserve the
    price and item description at purchase time.
-   **FR-MENU-009 (P1):** Restaurants shall configure price bounds and
    approval thresholds.

### 6.4 POS and orders

-   **FR-POS-001 (P0):** Staff shall create walk-in orders.
-   **FR-POS-002 (P0):** Staff shall choose dine-in or takeaway for
    eligible orders.
-   **FR-POS-003 (P0):** Staff shall add items, variants, add-ons, notes
    and quantities.
-   **FR-POS-004 (P0):** Staff shall see server-calculated totals before
    confirmation.
-   **FR-POS-005 (P0):** Staff shall view and process student-app
    orders.
-   **FR-POS-006 (P0):** Staff shall accept or reject online orders with
    a reason.
-   **FR-POS-007 (P0):** Orders shall have a source and a fulfilment
    type as separate fields.
-   **FR-POS-008 (P0):** Order creation shall be idempotent.
-   **FR-POS-009 (P1):** POS shall support offline-tolerant order
    capture and safe synchronisation.
-   **FR-POS-010 (P1):** POS shall support discounts, configured charges
    and complimentary items with permissions.

### 6.5 Dine-in and tables

-   **FR-DINE-001 (P0):** Restaurants shall create and manage tables.
-   **FR-DINE-002 (P0):** Staff shall open a dining session for a table.
-   **FR-DINE-003 (P0):** Staff shall add multiple orders to the same
    dining session.
-   **FR-DINE-004 (P0):** Dining sessions shall maintain an open bill.
-   **FR-DINE-005 (P0):** Staff shall transfer a session to another
    table.
-   **FR-DINE-006 (P1):** Staff shall merge sessions where permitted.
-   **FR-DINE-007 (P0):** Staff shall split bills by item or amount.
-   **FR-DINE-008 (P0):** Students shall place dine-in orders through
    the app.
-   **FR-DINE-009 (P0):** Restaurant staff shall control seating/table
    assignment for app-based dine-in orders.
-   **FR-DINE-010 (P0):** App-based dine-in shall not automatically
    reserve a table.
-   **FR-DINE-011 (P0):** Table QR ordering and QR table identification
    shall be disabled in MVP.

### 6.6 Kitchen

-   **FR-KITCHEN-001 (P0):** Confirmed orders shall generate preparation
    tickets.
-   **FR-KITCHEN-002 (P0):** Tickets shall show item, quantity,
    modifiers, notes and order/table reference.
-   **FR-KITCHEN-003 (P0):** Kitchen staff shall update ticket status.
-   **FR-KITCHEN-004 (P1):** Restaurants shall configure multiple
    preparation stations.
-   **FR-KITCHEN-005 (P0):** Order status shall be derived/validated
    against ticket and fulfilment progress.

### 6.7 Billing and payments

-   **FR-PAY-001 (P0):** A bill shall be separate from an order and
    dining session.
-   **FR-PAY-002 (P0):** A bill shall support multiple payment records.
-   **FR-PAY-003 (P0):** Payments shall support cash and manually
    confirmed QR/bank transfer in MVP.
-   **FR-PAY-004 (P0):** Partial and split payments shall be supported.
-   **FR-PAY-005 (P0):** The system shall calculate outstanding balance
    server-side.
-   **FR-PAY-006 (P0):** A bill shall not be marked paid until confirmed
    allocations cover the balance.
-   **FR-PAY-007 (P0):** Refunds and voids shall require permissions and
    audit records.
-   **FR-PAY-008 (P1):** A payment gateway may be integrated after
    provider and legal review.
-   **FR-PAY-009 (P0):** Delivery fee payment shall be recorded
    separately from restaurant food payment.

### 6.8 Shifts and analytics

-   **FR-SHIFT-001 (P0):** Cashiers shall open and close shifts.
-   **FR-SHIFT-002 (P0):** Shifts shall record opening float and closing
    count.
-   **FR-SHIFT-003 (P0):** Expected cash shall account for cash sales,
    refunds and cash movements.
-   **FR-ANALYTICS-001 (P0):** Owners shall view daily and date-range
    sales summaries.
-   **FR-ANALYTICS-002 (P0):** Reports shall group sales by payment
    method and fulfilment type.
-   **FR-ANALYTICS-003 (P1):** Reports shall include product performance
    and peak hours.

### 6.9 Student marketplace

-   **FR-STUDENT-001 (P0):** Students shall browse participating
    restaurants.
-   **FR-STUDENT-002 (P0):** Students shall search restaurants and menu
    items.
-   **FR-STUDENT-003 (P0):** Students shall view menu prices and
    availability.
-   **FR-STUDENT-004 (P0):** Students shall add items, variants and
    add-ons to a cart.
-   **FR-STUDENT-005 (P0):** An MVP cart shall contain items from one
    restaurant.
-   **FR-STUDENT-006 (P0):** Students shall choose dine-in, takeaway or
    delivery where supported.
-   **FR-STUDENT-007 (P0):** Students shall view order status and
    history.
-   **FR-STUDENT-008 (P1):** Students shall favourite restaurants and
    items.
-   **FR-STUDENT-009 (P1):** Students shall rate eligible completed
    orders.
-   **FR-STUDENT-010 (P1):** Students shall receive reorder suggestions
    based on current availability and price.

### 6.10 Delivery and Telegram

-   **FR-DEL-001 (P0):** The platform shall create a delivery job for an
    eligible delivery order.
-   **FR-DEL-002 (P0):** Telegram bot shall publish structured delivery
    requests to an approved group.
-   **FR-DEL-003 (P0):** Riders shall submit offers through structured
    bot interactions.
-   **FR-DEL-004 (P0):** Backend shall validate and store offers.
-   **FR-DEL-005 (P0):** Students shall view eligible offers and select
    one.
-   **FR-DEL-006 (P0):** Exactly one rider shall be assigned to a job.
-   **FR-DEL-007 (P0):** Assignment shall be transaction-safe and
    idempotent.
-   **FR-DEL-008 (P0):** Assigned riders shall update pickup and
    delivery states.
-   **FR-DEL-009 (P0):** Private customer details shall only be
    disclosed to the assigned rider when needed.
-   **FR-DEL-010 (P0):** The system shall support expiry, cancellation,
    dispute and manual fallback.
-   **FR-DEL-011 (P0):** Telegram outage shall not lose the delivery
    job.
-   **FR-DEL-012 (P1):** Rider profiles and performance history shall be
    available to authorised operators.

### 6.11 Recommendations

-   **FR-REC-001 (P1):** Feed shall support location relevance.
-   **FR-REC-002 (P1):** Feed shall use order history and favourites.
-   **FR-REC-003 (P1):** Feed shall include popularity and time-of-day
    signals.
-   **FR-REC-004 (P1):** Unavailable/closed restaurants shall be
    filtered or clearly labelled.
-   **FR-REC-005 (P1):** Recommendation impressions and clicks shall be
    measurable.
-   **FR-REC-006 (P2):** Collaborative filtering may use aggregate
    interaction patterns.
-   **FR-REC-007 (P3):** Graph-based PPR and learning-to-rank may be
    introduced after sufficient data.

## 7. Business rules

1.  An order belongs to exactly one restaurant.
2.  `source` and `fulfilment_type` are independent dimensions.
3.  A dining session may contain multiple orders.
4.  An order may generate multiple kitchen tickets.
5.  A bill may aggregate items from multiple orders in one dining
    session.
6.  A bill may be settled by multiple payments.
7.  Payment status and fulfilment status are independent.
8.  A delivery job is separate from the restaurant food order.
9.  Delivery fee and food amount are separate financial obligations.
10. Custom prices require permission and an audit record.
11. Price and item snapshots must not change when the menu changes.
12. No table QR ordering in MVP.
13. App-based dine-in requires restaurant confirmation and
    staff-controlled seating.
14. Backend calculations are authoritative.
15. Completed financial records must not be hard-deleted.

## 8. Order and payment states

### Order states

Suggested lifecycle:

`PENDING_RESTAURANT → ACCEPTED → PREPARING → READY → FULFILMENT_IN_PROGRESS → COMPLETED`

Possible exception states:

`REJECTED`, `CANCELLED`, `DISPUTED`.

Valid transitions depend on fulfilment type. For dine-in,
`FULFILMENT_IN_PROGRESS` may represent served. For takeaway, it
represents collected. For delivery, it is driven by delivery assignment
and completion.

### Payment states

`UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUND_PENDING`,
`PARTIALLY_REFUNDED`, `REFUNDED`, `FAILED`.

Do not derive payment state from order state.

### Delivery states

`REQUESTED → OFFERING → ASSIGNED → PICKED_UP → DELIVERED → COMPLETED`

Exceptions: `EXPIRED`, `CANCELLED`, `DISPUTED`.

## 9. Non-functional requirements

-   **Security:** secure authentication, role-based access, restaurant
    scoping, secret management and audit logs.
-   **Privacy:** data minimisation, transparent notices, appropriate
    consent/permissions and retention rules.
-   **Reliability:** idempotent commands, transactions, retries and
    durable background jobs.
-   **Performance:** paginated APIs, database indexes and efficient POS
    interactions.
-   **Realtime:** authenticated and scoped order/table updates.
-   **Accessibility:** readable contrast, keyboard support and usable
    touch targets.
-   **Compatibility:** responsive desktop/tablet POS and mobile-first
    student app.
-   **Recoverability:** tested backups and restoration procedures.
-   **Observability:** structured logs, error tracking and operational
    metrics.
-   **Offline tolerance:** POS may queue eligible actions locally, but
    must distinguish local pending records from server-confirmed
    records.

## 10. Acceptance criteria

The MVP is acceptable when:

-   Staff can create and complete walk-in takeaway orders.
-   Staff can open a table session and add multiple orders to it.
-   Staff can apply permitted custom pricing and the action is audited.
-   Student-app orders appear in the correct restaurant POS.
-   App-based dine-in orders require staff seating confirmation.
-   Bills support partial and split payments.
-   Kitchen tickets display the correct items and modifiers.
-   Delivery offers can be collected and one rider can be assigned
    safely.
-   Telegram outage does not delete a delivery job.
-   Restaurant data is inaccessible to unrelated restaurant users.
-   Financial records can be reconciled and audited.
