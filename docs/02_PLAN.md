# UM Food --- Product and Delivery Plan

**Document:** Product Plan\
**Version:** 1.0\
**Status:** Proposed baseline

## 1. Product vision

Build a university-focused food ecosystem that gives students one place
to discover and order food, gives restaurants a practical POS and
operations system, and connects delivery requests to an existing
community rider network.

UM Food should remain useful to a restaurant even if it does not
participate in the student marketplace. The restaurant POS is an
independent value proposition.

## 2. Product goals

1.  Digitise restaurant walk-in, dine-in and takeaway operations.
2.  Let students discover and order from participating restaurants.
3.  Support dine-in, takeaway and delivery through a unified order
    model.
4.  Integrate the existing Telegram rider community with structured
    delivery requests.
5.  Provide useful restaurant sales and operations analytics.
6.  Introduce recommendations based on location, preferences and order
    history.
7.  Establish an architecture that can later support other campuses.

## 3. Confirmed scope decisions

  Topic               Decision
  ------------------- ---------------------------------------------------
  Backend             NestJS
  Web applications    Next.js
  Database            PostgreSQL
  ORM                 Prisma
  Student app         PWA-first
  Restaurant POS      Responsive web application
  Ordering channels   Student app and staff POS
  Fulfilment          Dine-in, takeaway, delivery
  Dine-in entry       Staff-entered and student-app
  Pricing             Fixed menu prices plus authorised custom pricing
  Table QR            Disabled for initial release
  Delivery            Existing Telegram community, with bot integration
  Architecture        Modular monolith initially

## 4. Product principles

-   Restaurant operations must not depend on marketplace availability.
-   One order model should support all channels and fulfilment types.
-   Payment state must be independent from preparation and delivery
    state.
-   The backend is authoritative for price, permissions and financial
    calculations.
-   The Telegram group is not the database.
-   Collect only the personal data required for a feature.
-   Start with explainable recommendation rules before machine learning.
-   Prefer a controlled pilot over a large initial rollout.

## 5. MVP scope

### 5.1 Must have --- P0

**Platform foundation** - Authentication and account management. -
Role-based access control. - Restaurant onboarding and approval. -
Restaurant-level data isolation. - Audit logging.

**Restaurant** - Restaurant profile and operating hours. - Staff
invitations and permissions. - Menu categories and items. - Variants and
add-ons. - Fixed, variable and open-price support. - Quantity-based
order lines. - Staff POS for walk-in orders. - Dine-in table
management. - Dining sessions and open bills. - Takeaway orders. -
Student-app order inbox. - Kitchen tickets and basic kitchen display. -
Cash and manual QR payment recording. - Partial and split payments. -
Basic sales reports. - Cashier shifts and reconciliation.

**Student** - Registration and sign-in. - Restaurant and menu
discovery. - Search and basic filters. - Cart and checkout. - Dine-in
ordering through app, with staff-controlled seating. - Takeaway
ordering. - Order status and history. - Basic notifications.

**Delivery** - Delivery job creation. - Telegram bot posting. - Rider
offer capture. - Student offer selection. - Atomic rider assignment. -
Pickup and delivery status. - Delivery fee record separate from food
payment. - Manual fallback if Telegram is unavailable.

### 5.2 Should have --- P1

-   Location-aware discovery.
-   Weighted personalised recommendations.
-   Favourites.
-   Reviews and moderation.
-   Promotions and discounts.
-   More detailed analytics.
-   Multiple kitchen stations.
-   Order preparation estimates.
-   Rider performance history.
-   Reorder.
-   Restaurant item availability controls.
-   Offline-tolerant POS order queue with safe synchronisation.

### 5.3 Later --- P2/P3

-   Table QR ordering.
-   Dedicated rider PWA.
-   Group ordering.
-   Loyalty points.
-   Advanced collaborative filtering.
-   Graph-based recommendations and Personalized PageRank.
-   Learning-to-rank.
-   Multi-campus tenant support.
-   Integrated marketplace settlements, subject to
    legal/payment-provider review.
-   Inventory and supplier management.

Table QR ordering is explicitly excluded from the MVP and must not be
accidentally included in MVP acceptance criteria.

## 6. Validation plan

### 6.1 Stakeholder discovery

Interview:

-   10--15 restaurant owners/managers.
-   20--30 students.
-   Telegram group administrators.
-   5--10 active riders.
-   Relevant UM representatives or campus operations stakeholders.

### 6.2 Restaurant questions

-   Current order-taking and POS process.
-   Dine-in table and open-bill process.
-   How staff add items and custom prices.
-   Menu and availability update process.
-   Peak-hour order volume.
-   Kitchen workflow and preparation stations.
-   Current payment methods.
-   Willingness to accept app orders.
-   Preferred pricing model for POS software.
-   Device and connectivity constraints.

### 6.3 Student questions

-   Food discovery behaviour.
-   Typical order frequency and spend.
-   Pickup versus dine-in versus delivery preferences.
-   Use of existing Telegram delivery group.
-   Preferred payment method.
-   Pain points in current ordering.
-   Interest in recommendations and favourites.
-   Willingness to use a new UM-focused app.

### 6.4 Rider and Telegram questions

-   Number of active riders and activity periods.
-   How fares are proposed.
-   How offers are selected.
-   Cancellation and dispute handling.
-   Existing payment arrangements.
-   Group administrator willingness to add a bot.
-   Rider willingness to submit structured offers.
-   Whether riders can start a private bot conversation.
-   Required privacy boundaries.

### 6.5 Pilot hypothesis

A practical initial pilot target:

  Participant                                   Target
  ------------------- --------------------------------
  Restaurants                                     3--5
  Students                                     50--100
  Active riders                                  5--10
  Initial geography              Agreed UM campus area
  Ordering              Dine-in, takeaway and delivery
  Delivery channel             Existing Telegram group

These are proposed validation targets, not claims about current demand.

## 7. Rollout phases

The estimates below assume a small, experienced team and are planning
ranges. Actual timing depends on team size, integrations, stakeholder
availability and scope changes.

  Phase   Deliverables                                   Indicative duration
  ------- ---------------------------------------------- ---------------------
  0       Validation, partnerships, campus permissions   1--2 weeks
  1       NestJS foundation, auth, restaurant and menu   2--3 weeks
  2       POS, pricing, tables, dining sessions, bills   3--5 weeks
  3       Kitchen, payments, shifts and reports          2--4 weeks
  4       Student app and online ordering                3--5 weeks
  5       Telegram delivery integration                  2--3 weeks
  6       Recommendations and personalisation            2--4 weeks
  7       Pilot hardening and launch                     2--3 weeks

Some work can run in parallel. Do not treat these ranges as guaranteed
deadlines.

## 8. Suggested team responsibilities

For a small team:

  -----------------------------------------------------------------------
  Responsibility                      Main work
  ----------------------------------- -----------------------------------
  Backend engineer                    NestJS, database, APIs, auth, order
                                      and payment logic

  Frontend engineer                   Student app, POS and admin
                                      interfaces

  Product/UI designer                 User research, workflows,
                                      responsive POS usability

  Integration engineer                Telegram, notifications, payment
                                      provider

  QA/operations                       Test cases, restaurant onboarding,
                                      pilot support
  -----------------------------------------------------------------------

One person can own multiple responsibilities, but ownership should be
explicit.

## 9. Success metrics

### Student marketplace

-   Weekly active students.
-   Search-to-restaurant-view rate.
-   Restaurant-view-to-cart rate.
-   Checkout conversion.
-   Repeat order rate.
-   Order cancellation rate.
-   Average order value.

### Restaurant POS

-   Active restaurants.
-   Daily orders processed through POS.
-   Staff adoption and active shifts.
-   POS transaction success rate.
-   Order-entry time.
-   Cash reconciliation discrepancy.
-   Online order acceptance rate.

### Delivery

-   Time to first rider offer.
-   Offer-to-assignment conversion.
-   Delivery completion rate.
-   Rider cancellation rate.
-   Median delivery duration.
-   Dispute rate.

### Recommendations

-   Recommendation impression-to-click rate.
-   Recommendation click-to-order conversion.
-   Repeat purchase rate.
-   Coverage of recommendations across restaurants.
-   Diversity of recommended restaurants.

Repeat orders and successful restaurant operations matter more than app
downloads.

## 10. Risks and mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Restaurants resist adoption         Free/assisted pilot, simple POS and
                                      menu migration

  Staff find POS slow                 Quick-entry interface, shortcuts
                                      and usability testing

  No riders accept a job              Expiry, manual fallback and
                                      transparent status

  Telegram bot unavailable            Queue events and retain jobs in
                                      database

  Duplicate orders                    Idempotency keys and transaction
                                      constraints

  Payment disputes                    Separate payment records, receipts
                                      and audit trail

  Poor recommendation quality         Start with explainable rules and
                                      measure outcomes

  Weak demand                         Validate before expanding
                                      restaurant count

  Campus access restrictions          Obtain written clarification and
                                      approvals

  Personal data exposure              Data minimisation, access controls
                                      and privacy review
  -----------------------------------------------------------------------

## 11. Launch gates

Do not launch broadly until:

-   Pilot restaurants have agreed to participate.
-   Campus and business permissions have been checked.
-   Restaurant staff can complete core POS workflows.
-   Orders cannot be duplicated by retries.
-   Payment records reconcile.
-   Delivery assignment cannot produce two winners.
-   Telegram failure has a manual fallback.
-   Privacy notice and terms are reviewed.
-   Backup and recovery have been tested.
-   Support and dispute ownership are defined.

## 12. Immediate next steps

1.  Conduct stakeholder interviews.
2.  Map at least one mamak-style restaurant workflow and one fixed-menu
    restaurant workflow.
3.  Confirm Telegram administrator cooperation.
4.  Confirm UM and local operating requirements.
5.  Finalise detailed SRS and acceptance criteria.
6.  Finalise ERD and migration strategy.
7.  Prototype POS order entry and table sessions.
8.  Implement backend foundation.
9.  Pilot POS before scaling the student marketplace.
