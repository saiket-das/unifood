# UM Food --- Database Schema and ERD

**Version:** 1.1\
**Database:** PostgreSQL\
**ORM:** Prisma\
**Status:** Logical schema baseline; implementation details require
review.


**Change history:** 1.1 — Daily menu confirmation and online availability; self pickup and provisional rider delivery with guarded kitchen release, payment boundaries and recovery.

## 1. Design principles

-   PostgreSQL is the system of record.
-   UUID primary keys are used for major entities.
-   All restaurant-owned data is scoped by `restaurant_id` directly or
    through a parent relation.
-   Money is stored in integer minor units (sen) where practical, with
    currency code `MYR`. If Prisma `Decimal` is used instead,
    calculations must never use binary floating point.
-   Timestamps are stored in UTC (`timestamptz`).
-   Historical order lines store item name, description and price
    snapshots.
-   Completed financial records are not hard-deleted.
-   Important actions have actor and audit information.
-   State transitions are validated by backend services and, where
    useful, database constraints.
-   The schema supports dine-in, takeaway and delivery without separate
    order tables.

## 2. Core enums

``` sql
CREATE TYPE user_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'DEACTIVATED');
CREATE TYPE restaurant_status AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');
CREATE TYPE restaurant_role AS ENUM ('OWNER', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN');
CREATE TYPE order_source AS ENUM ('STUDENT_APP', 'STAFF_POS');
CREATE TYPE fulfilment_type AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');
CREATE TYPE order_status AS ENUM (
  'PROVISIONAL', 'PENDING_RESTAURANT', 'ACCEPTED', 'PREPARING', 'READY',
  'FULFILMENT_IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'DISPUTED'
);
CREATE TYPE payment_status AS ENUM (
  'UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUND_PENDING',
  'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED'
);
CREATE TYPE payment_method AS ENUM ('CASH', 'MANUAL_QR', 'BANK_TRANSFER', 'GATEWAY', 'OTHER');
CREATE TYPE table_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'OUT_OF_SERVICE');
CREATE TYPE dining_session_status AS ENUM ('OPEN', 'CLOSING', 'CLOSED', 'CANCELLED');
CREATE TYPE pricing_type AS ENUM ('FIXED', 'VARIABLE', 'WEIGHT_BASED', 'OPEN_PRICE');
CREATE TYPE delivery_status AS ENUM (
  'REQUESTED', 'OFFERING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED',
  'COMPLETED', 'EXPIRED', 'CANCELLED', 'DISPUTED'
);
CREATE TYPE availability_reason AS ENUM ('SOLD_OUT', 'TEMPORARILY_UNAVAILABLE');
CREATE TYPE preconfirmation_status AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED');
CREATE TYPE assignment_status AS ENUM ('ACTIVE', 'CANCELLED', 'COMPLETED');
CREATE TYPE payment_record_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REFUND_REQUIRED', 'REFUND_COMPLETED');
CREATE TYPE payment_purpose AS ENUM ('FOOD', 'DELIVERY_FEE');
CREATE TYPE offer_status AS ENUM ('PENDING', 'SELECTED', 'NOT_SELECTED', 'WITHDRAWN', 'EXPIRED');
CREATE TYPE ticket_status AS ENUM ('NEW', 'ON_HOLD', 'IN_PROGRESS', 'READY', 'CANCELLED');
CREATE TYPE bill_status AS ENUM ('OPEN', 'PARTIALLY_PAID', 'PAID', 'VOIDED');
CREATE TYPE shift_status AS ENUM ('OPEN', 'CLOSED', 'REVIEW_REQUIRED');
```

## 3. Identity and access tables

### users

-   `id UUID PK`
-   `email VARCHAR UNIQUE`
-   `phone VARCHAR NULL`
-   `display_name VARCHAR`
-   `password_hash VARCHAR NULL` (if local credential auth is used)
-   `status user_status`
-   `email_verified_at TIMESTAMPTZ NULL`
-   `created_at`, `updated_at`

### user_profiles

-   `user_id UUID PK/FK users`
-   `avatar_url TEXT NULL`
-   `preferred_area_id UUID NULL`
-   `personalisation_enabled BOOLEAN DEFAULT TRUE`
-   `created_at`, `updated_at`

Avoid collecting student identifiers unless required for a defined
purpose. UM eligibility verification policy must be agreed before
implementation.

### platform_roles and user_platform_roles

-   `platform_roles(id, name UNIQUE)`
-   `user_platform_roles(user_id FK, role_id FK, created_at)`
-   Composite unique key `(user_id, role_id)`.

### restaurant_staff

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `user_id UUID FK`
-   `role restaurant_role`
-   `is_active BOOLEAN`
-   `created_at`, `updated_at`
-   Unique `(restaurant_id, user_id)`.

Use a permission matrix for actions beyond broad roles, such as refunds,
price overrides and shift approval.

## 4. Restaurant tables

### restaurants

-   `id UUID PK`
-   `name VARCHAR`
-   `slug VARCHAR UNIQUE`
-   `description TEXT NULL`
-   `status restaurant_status`
-   `phone VARCHAR NULL`
-   `email VARCHAR NULL`
-   `business_registration_ref VARCHAR NULL`
-   `created_by UUID FK users`
-   `created_at`, `updated_at`

### restaurant_locations

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `name VARCHAR`
-   `address TEXT`
-   `latitude DECIMAL NULL`
-   `longitude DECIMAL NULL`
-   `timezone VARCHAR DEFAULT 'Asia/Kuala_Lumpur'`
-   `is_active BOOLEAN`
-   `created_at`, `updated_at`

### restaurant_hours

-   `id UUID PK`
-   `restaurant_location_id UUID FK`
-   `weekday SMALLINT`
-   `opens_at TIME`
-   `closes_at TIME`
-   `is_closed BOOLEAN`
-   `valid_from DATE NULL`
-   `valid_until DATE NULL`

### restaurant_fulfilment_settings

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `dine_in_enabled BOOLEAN`
-   `takeaway_enabled BOOLEAN`
-   `delivery_enabled BOOLEAN`
-   `student_app_enabled BOOLEAN`
-   `accepting_orders BOOLEAN` (online only; unique `restaurant_id`)
-   `confirmed_business_date DATE NULL`, `confirmed_by UUID FK users NULL`, `confirmed_at TIMESTAMPTZ NULL`
-   `acceptance_updated_by UUID FK users NULL`
-   `updated_at`

## 5. Menu and pricing tables

### menus

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `name VARCHAR`
-   `is_active BOOLEAN`
-   `created_at`, `updated_at`

### menu_categories

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `menu_id UUID FK`
-   `name VARCHAR`
-   `sort_order INTEGER`
-   `is_active BOOLEAN`

### menu_items

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `category_id UUID FK`
-   `name VARCHAR`
-   `description TEXT NULL`
-   `image_url TEXT NULL`
-   `pricing_type pricing_type`
-   `base_price_minor BIGINT NULL`
-   `unit_of_measure VARCHAR NULL` (e.g. PIECE, GRAM, KG, PORTION)
-   `is_available BOOLEAN`
-   `unavailability_reason availability_reason NULL`, `availability_updated_at TIMESTAMPTZ`, `availability_updated_by UUID FK users NULL`
-   `allow_custom_price BOOLEAN DEFAULT FALSE`
-   `min_custom_price_minor BIGINT NULL`
-   `max_custom_price_minor BIGINT NULL`
-   `prep_time_minutes INTEGER NULL`
-   `created_at`, `updated_at`

### menu_item_variants

-   `id UUID PK`
-   `menu_item_id UUID FK`
-   `name VARCHAR`
-   `price_delta_minor BIGINT`
-   `is_available BOOLEAN`

### addon_groups

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `name VARCHAR`
-   `min_select INTEGER`
-   `max_select INTEGER`
-   `is_required BOOLEAN`

### addon_options

-   `id UUID PK`
-   `addon_group_id UUID FK`
-   `name VARCHAR`
-   `price_delta_minor BIGINT`
-   `is_available BOOLEAN`

### menu_item_addon_groups

-   `menu_item_id UUID FK`
-   `addon_group_id UUID FK`
-   Composite PK `(menu_item_id, addon_group_id)`.

### price_overrides

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `order_item_id UUID FK`
-   `actor_user_id UUID FK users`
-   `original_unit_price_minor BIGINT NULL`
-   `final_unit_price_minor BIGINT`
-   `reason TEXT`
-   `created_at TIMESTAMPTZ`

## 6. POS, tables and dining sessions

### restaurant_tables

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `restaurant_location_id UUID FK`
-   `table_number VARCHAR`
-   `display_name VARCHAR NULL`
-   `capacity INTEGER`
-   `status table_status`
-   `area VARCHAR NULL`
-   `is_active BOOLEAN`
-   Unique `(restaurant_location_id, table_number)`.

No QR token is required in the MVP.

### dining_sessions

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `restaurant_table_id UUID FK`
-   `opened_by UUID FK users`
-   `closed_by UUID FK users NULL`
-   `status dining_session_status`
-   `opened_at TIMESTAMPTZ`
-   `closed_at TIMESTAMPTZ NULL`
-   `notes TEXT NULL`

Enforce at most one active session per table, preferably with a partial
unique index:

``` sql
CREATE UNIQUE INDEX one_open_session_per_table
ON dining_sessions (restaurant_table_id)
WHERE status IN ('OPEN', 'CLOSING');
```

### table_transfers

-   `id UUID PK`
-   `dining_session_id UUID FK`
-   `from_table_id UUID FK`
-   `to_table_id UUID FK`
-   `actor_user_id UUID FK`
-   `reason TEXT NULL`
-   `created_at TIMESTAMPTZ`

## 7. Orders and order items

### orders

-   `id UUID PK`
-   `order_number VARCHAR`
-   `restaurant_id UUID FK`
-   `restaurant_location_id UUID FK`
-   `customer_id UUID FK users NULL`
-   `created_by_user_id UUID FK users NULL`
-   `source order_source`
-   `fulfilment_type fulfilment_type`
-   `dining_session_id UUID FK NULL`
-   `status order_status`
-   `payment_status payment_status`
-   `currency CHAR(3) DEFAULT 'MYR'`
-   `subtotal_minor BIGINT`
-   `discount_minor BIGINT DEFAULT 0`
-   `charges_minor BIGINT DEFAULT 0`
-   `total_minor BIGINT`
-   `customer_note TEXT NULL`
-   `accepted_at TIMESTAMPTZ NULL` (final acceptance)
-   `kitchen_released_at TIMESTAMPTZ NULL`
-   `converted_from_order_id UUID FK orders NULL UNIQUE`
-   `completed_at TIMESTAMPTZ NULL`
-   `idempotency_key VARCHAR NULL`
-   `created_at`, `updated_at`

Recommended uniqueness: `(restaurant_id, idempotency_key)` where key is
not null.

### order_items

-   `id UUID PK`
-   `order_id UUID FK`
-   `menu_item_id UUID FK NULL`
-   `item_name_snapshot VARCHAR`
-   `item_description_snapshot TEXT NULL`
-   `pricing_type pricing_type`
-   `quantity DECIMAL(12,3)`
-   `unit_of_measure VARCHAR`
-   `unit_price_minor BIGINT`
-   `discount_minor BIGINT DEFAULT 0`
-   `line_total_minor BIGINT`
-   `special_instructions TEXT NULL`
-   `created_at`

### order_item_modifiers

-   `id UUID PK`
-   `order_item_id UUID FK`
-   `modifier_name_snapshot VARCHAR`
-   `quantity DECIMAL(12,3)`
-   `unit_price_delta_minor BIGINT`
-   `total_delta_minor BIGINT`

### order_status_history

-   `id UUID PK`
-   `order_id UUID FK`
-   `from_status VARCHAR NULL`
-   `to_status VARCHAR`
-   `actor_user_id UUID FK users NULL`
-   `source VARCHAR`
-   `reason TEXT NULL`
-   `created_at`

## 8. Kitchen tables

### kitchen_stations

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `name VARCHAR`
-   `is_active BOOLEAN`

### order_tickets

-   `id UUID PK`
-   `order_id UUID FK`
-   `dining_session_id UUID FK NULL`
-   `station_id UUID FK NULL`
-   `ticket_number VARCHAR`
-   `status ticket_status`
-   `created_at`
-   `started_at TIMESTAMPTZ NULL`
-   `ready_at TIMESTAMPTZ NULL`

### ticket_items

-   `id UUID PK`
-   `ticket_id UUID FK`
-   `order_item_id UUID FK`
-   `quantity DECIMAL(12,3)`
-   `notes TEXT NULL`

An order can create multiple tickets, for example kitchen and drinks
station tickets.

## 9. Bills and payments

### bills

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `dining_session_id UUID FK NULL`
-   `order_id UUID FK NULL`
-   `bill_number VARCHAR`
-   `status bill_status`
-   `subtotal_minor BIGINT`
-   `discount_minor BIGINT`
-   `charges_minor BIGINT`
-   `total_minor BIGINT`
-   `paid_minor BIGINT DEFAULT 0`
-   `balance_minor BIGINT`
-   `created_at`, `closed_at`

A dining session may have one main open bill in the initial
implementation. The model should allow future separate bills for
split-bill workflows.

### bill_items

-   `id UUID PK`
-   `bill_id UUID FK`
-   `order_item_id UUID FK`
-   `description_snapshot VARCHAR`
-   `quantity DECIMAL(12,3)`
-   `unit_price_minor BIGINT`
-   `line_total_minor BIGINT`

### payments

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `customer_id UUID FK users NULL`
-   `amount_minor BIGINT`
-   `currency CHAR(3) DEFAULT 'MYR'`
-   `method payment_method`
-   `status payment_record_status`
-   `purpose payment_purpose`
-   `delivery_job_id UUID FK delivery_jobs NULL` (required only for DELIVERY_FEE)
-   `provider_reference VARCHAR NULL`
-   `recorded_by UUID FK users NULL`
-   `confirmed_at TIMESTAMPTZ NULL`
-   `created_at`

### payment_allocations

-   `id UUID PK`
-   `payment_id UUID FK`
-   `bill_id UUID FK`
-   `amount_minor BIGINT`
-   `created_at`

### refunds

-   `id UUID PK`
-   `payment_id UUID FK`
-   `amount_minor BIGINT`
-   `reason TEXT`
-   `status VARCHAR`
-   `requested_by UUID FK users`
-   `approved_by UUID FK users NULL`
-   `created_at`, `processed_at`

A delivery-fee payment must not be confused with a restaurant payment.
Model it under the delivery financial records or a separately typed
payment obligation.

## 10. Cashier shifts

### cashier_shifts

-   `id UUID PK`
-   `restaurant_id UUID FK`
-   `user_id UUID FK`
-   `status shift_status`
-   `opening_cash_minor BIGINT`
-   `expected_cash_minor BIGINT NULL`
-   `actual_cash_minor BIGINT NULL`
-   `discrepancy_minor BIGINT NULL`
-   `opened_at TIMESTAMPTZ`
-   `closed_at TIMESTAMPTZ NULL`

### cash_movements

-   `id UUID PK`
-   `shift_id UUID FK`
-   `movement_type VARCHAR` (e.g. CASH_IN, CASH_OUT, REFUND,
    FLOAT_ADJUSTMENT)
-   `amount_minor BIGINT`
-   `reason TEXT`
-   `recorded_by UUID FK users`
-   `created_at`

## 11. Delivery and Telegram

### rider_profiles

-   `id UUID PK`
-   `user_id UUID FK users`
-   `status VARCHAR`
-   `verification_status VARCHAR`
-   `created_at`, `updated_at`

### rider_telegram_accounts

-   `id UUID PK`
-   `rider_profile_id UUID FK`
-   `telegram_user_id VARCHAR UNIQUE`
-   `telegram_chat_id VARCHAR NULL`
-   `linked_at TIMESTAMPTZ`
-   `is_active BOOLEAN`

### delivery_jobs

-   `id UUID PK`
-   `order_id UUID FK UNIQUE`
-   `status delivery_status`
-   `pickup_label VARCHAR`
-   `pickup_latitude DECIMAL NULL`
-   `pickup_longitude DECIMAL NULL`
-   `dropoff_label VARCHAR`
-   `dropoff_latitude DECIMAL NULL`
-   `dropoff_longitude DECIMAL NULL`
-   `delivery_fee_minor BIGINT NULL`
-   `currency CHAR(3) DEFAULT 'MYR'`
-   `restaurant_deadline TIMESTAMPTZ NULL`, `offer_deadline TIMESTAMPTZ NULL`, `selection_deadline TIMESTAMPTZ NULL`, `assignment_deadline TIMESTAMPTZ NULL`
-   `preconfirmation_status preconfirmation_status`, `preconfirmed_by UUID FK users NULL`, `preconfirmed_at TIMESTAMPTZ NULL`, `preconfirmation_expires_at TIMESTAMPTZ NULL`, `estimated_prep_minutes INTEGER NULL`
-   `final_confirmed_at TIMESTAMPTZ NULL`, `failure_reason VARCHAR NULL`
-   `created_at`, `updated_at`

### delivery_offers

-   `id UUID PK`
-   `delivery_job_id UUID FK`
-   `rider_profile_id UUID FK`
-   `offer_amount_minor BIGINT`
-   `status offer_status`
-   `expires_at TIMESTAMPTZ`, `estimated_pickup_at TIMESTAMPTZ NULL` (only with reliable source)
-   `created_at`
-   Unique `(delivery_job_id, rider_profile_id)` if one active offer per
    rider/job is the chosen policy.

### delivery_assignments

-   `id UUID PK`
-   `delivery_job_id UUID FK`
-   `rider_profile_id UUID FK`
-   `offer_id UUID FK delivery_offers`
-   `status assignment_status`, `ended_at TIMESTAMPTZ NULL`, `end_reason VARCHAR NULL`
-   `assigned_at TIMESTAMPTZ`
-   `picked_up_at TIMESTAMPTZ NULL`
-   `delivered_at TIMESTAMPTZ NULL`
-   `completed_at TIMESTAMPTZ NULL`

### delivery_status_history

-   `id UUID PK`
-   `delivery_job_id UUID FK`
-   `from_status VARCHAR NULL`
-   `to_status VARCHAR`
-   `actor_user_id UUID FK users NULL`
-   `actor_rider_id UUID FK rider_profiles NULL`
-   `reason VARCHAR NULL`, `source VARCHAR`
-   `created_at`

### telegram_messages

-   `id UUID PK`
-   `delivery_job_id UUID FK NULL`
-   `telegram_chat_id VARCHAR`
-   `telegram_message_id VARCHAR NULL`
-   `message_type VARCHAR`
-   `delivery_status VARCHAR`
-   `created_at`, `updated_at`

Do not store sensitive customer details in the public group message.
Store Telegram identifiers as strings because provider IDs may exceed
32-bit integer ranges.

## 12. Student preferences and recommendations

### favourites

-   `id UUID PK`
-   `user_id UUID FK users`
-   `restaurant_id UUID FK restaurants NULL`
-   `menu_item_id UUID FK menu_items NULL`
-   `created_at`

Add a constraint requiring exactly one of `restaurant_id` or
`menu_item_id`.

### reviews

-   `id UUID PK`
-   `user_id UUID FK users`
-   `restaurant_id UUID FK restaurants`
-   `order_id UUID FK orders NULL`
-   `rating SMALLINT`
-   `comment TEXT NULL`
-   `moderation_status VARCHAR`
-   `created_at`

### user_interactions

-   `id UUID PK`
-   `user_id UUID FK users NULL`
-   `event_type VARCHAR`
-   `entity_type VARCHAR`
-   `entity_id UUID`
-   `restaurant_id UUID FK restaurants NULL`
-   `session_id VARCHAR NULL`
-   `metadata JSONB`
-   `occurred_at TIMESTAMPTZ`

### recommendation_impressions

-   `id UUID PK`
-   `user_id UUID FK users`
-   `entity_type VARCHAR`
-   `entity_id UUID`
-   `placement VARCHAR`
-   `algorithm_version VARCHAR`
-   `position INTEGER`
-   `impressed_at TIMESTAMPTZ`
-   `clicked_at TIMESTAMPTZ NULL`

Use retention limits and data minimisation for interaction events.

## 13. Notifications, disputes and audit

### notifications

-   `id UUID PK`
-   `user_id UUID FK users`
-   `type VARCHAR`
-   `title VARCHAR`
-   `body TEXT`
-   `data JSONB`
-   `read_at TIMESTAMPTZ NULL`
-   `created_at`

### disputes

-   `id UUID PK`
-   `order_id UUID FK orders NULL`
-   `delivery_job_id UUID FK delivery_jobs NULL`
-   `reported_by UUID FK users`
-   `category VARCHAR`
-   `description TEXT`
-   `status VARCHAR`
-   `resolution TEXT NULL`
-   `created_at`, `resolved_at`

### audit_logs

-   `id UUID PK`
-   `actor_user_id UUID FK users NULL`
-   `restaurant_id UUID FK restaurants NULL`
-   `action VARCHAR`
-   `entity_type VARCHAR`
-   `entity_id UUID`
-   `before_data JSONB NULL`
-   `after_data JSONB NULL`
-   `ip_address INET NULL`
-   `created_at`

Avoid storing passwords, payment credentials, authentication secrets or
unnecessary personal data in audit payloads.

## 14. Recommended indexes and constraints

-   Index `orders(restaurant_id, created_at DESC)`.
-   Index `orders(customer_id, created_at DESC)`.
-   Index `orders(restaurant_id, status)`.
-   Index `order_items(order_id)`.
-   Index `dining_sessions(restaurant_table_id, status)`.
-   Unique partial index for one open dining session per table.
-   Index `delivery_jobs(status, offer_deadline)`.
-   Index `delivery_offers(delivery_job_id, status)`.
-   Partial unique index on `delivery_assignments(delivery_job_id) WHERE status = 'ACTIVE'`; historical assignments remain.
-   Index delivery deadlines, preconfirmation expiry and outbox pending events.
-   Index `user_interactions(user_id, occurred_at DESC)`.
-   Index `menu_items(restaurant_id, is_available)`.
-   Index `audit_logs(restaurant_id, created_at DESC)`.

Add foreign keys and check constraints for positive quantities,
non-negative amounts where appropriate, valid rating ranges and
consistent state data.

## 15. ERD overview

``` mermaid
erDiagram
    USERS ||--o{ RESTAURANT_STAFF : joins
    RESTAURANTS ||--o{ RESTAURANT_STAFF : employs
    RESTAURANTS ||--o{ RESTAURANT_LOCATIONS : has
    RESTAURANTS ||--o{ MENUS : owns
    MENUS ||--o{ MENU_CATEGORIES : contains
    MENU_CATEGORIES ||--o{ MENU_ITEMS : contains
    MENU_ITEMS ||--o{ MENU_ITEM_VARIANTS : offers
    RESTAURANTS ||--o{ RESTAURANT_TABLES : has
    RESTAURANT_TABLES ||--o{ DINING_SESSIONS : hosts
    DINING_SESSIONS ||--o{ ORDERS : groups
    RESTAURANTS ||--o{ ORDERS : receives
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ ORDER_TICKETS : creates
    DINING_SESSIONS ||--o{ BILLS : has
    BILLS ||--o{ PAYMENT_ALLOCATIONS : settled_by
    PAYMENTS ||--o{ PAYMENT_ALLOCATIONS : allocated
    ORDERS ||--o| DELIVERY_JOBS : may_create
    DELIVERY_JOBS ||--o{ DELIVERY_OFFERS : receives
    DELIVERY_JOBS ||--o{ DELIVERY_ASSIGNMENTS : assignment_history
    RESTAURANTS ||--|| RESTAURANT_FULFILMENT_SETTINGS : configures
    DELIVERY_JOBS ||--o{ PAYMENTS : delivery_fee
    USERS ||--o{ AUDIT_LOGS : performs
    ORDERS ||--o{ ORDER_STATUS_HISTORY : records
    DELIVERY_JOBS ||--o{ DELIVERY_STATUS_HISTORY : records
    DELIVERY_OFFERS ||--o{ DELIVERY_ASSIGNMENTS : selected_for
    RESTAURANTS ||--o{ AUDIT_LOGS : owns
    RIDER_PROFILES ||--o{ DELIVERY_OFFERS : submits
```

## 16. Schema decisions requiring implementation review

1.  Whether each restaurant location has its own menu or shares a
    restaurant-level menu.
2.  Whether dine-in bills are always one per session or can be split
    into multiple independent bills.
3.  Restaurant-local business-day cutoff and multi-location menu scope.
4.  Whether custom pricing is allowed for all items or only selected
    items.
5.  Whether weight-based pricing is needed in the first pilot.
6.  Payment timing and authorised manual verifier by fulfilment and obligation; gateway is future scope.
7.  Cancellation/refund amounts and liability policy; inventory decrement is future scope.
8.  Whether multiple currencies are ever required; MVP assumes MYR.

Do not generate production migrations until these decisions and
constraints have been reviewed.

## 17. Availability, provisional delivery and integrity details

The MVP uses the existing unified `orders` and `order_items` as the provisional checkout record: a delivery starts `PROVISIONAL`, with snapshots and exactly one `delivery_jobs.order_id`; it is not a committed food order and cannot have kitchen tickets. This avoids a second checkout-intent model. `PROVISIONAL → ACCEPTED` occurs only at final confirmation; preliminary capacity does not accept the order. For conversion, cancel the provisional order and job and create one new `PENDING_RESTAURANT` TAKEAWAY order linked by unique `converted_from_order_id`, all in one transaction after explicit confirmation and revalidation. Self pickup never has a delivery job. For a committed delivery with an unstarted ticket, an explicitly approved switch cancels the old delivery order and holds/cancels its ticket before creating the linked pickup order under the same lock; apply applicable refund review and never create two active committed orders.

The settings row is restaurant-scoped in the pilot; `confirmed_business_date` uses the restaurant location timezone and agreed cutoff, and must match the current business date before enabling or accepting online orders. Retain item flags across days. `audit_logs` provides item availability and acceptance history, with before/after, actor, tenant and time; index `(entity_type, entity_id, created_at)` for history. `is_available = true` requires null reason; false requires a reason. Updates, audit and outbox insert share a transaction. Enforce item/category/menu ownership via composite tenant foreign keys or equivalent constraints, and validate every item in a bulk update.

`delivery_jobs` belongs to a DELIVERY order; add preconfirmation expiry and deadline indexes. `delivery_offers` belongs to a job and rider; enforce offer/job consistency using a composite FK on `(offer_id, delivery_job_id)` for assignments. Lock the job and order, check selected unexpired offer, eligible rider and unexpired restaurant decision, fresh prices, availability, acceptance and payment terms. In one transaction create the sole ACTIVE assignment, set final confirmation and order acceptance timestamps, create ticket(s), record `kitchen_released_at`, histories and outbox events. Enforce one active assignment with the partial unique index; a unique `(order_id, station_id)` or equivalent release key prevents duplicate tickets on retries. Enforce timestamps/state with checks where possible and a single transactional service or database trigger for cross-table invariants; reject any delivery ticket or PREPARING transition without a committed order, active assignment, valid final acceptance and satisfied payment conditions. A cancellation before preparation must invalidate the active assignment and put any released but unstarted tickets on hold transactionally; a replacement assignment reactivates the same tickets after guards pass, without a second order or ticket. after preparation begins keep the order in intervention/reassignment and preserve ticket history. A transaction cannot cover Telegram or external payments.

Food `payments` allocate to bills; DELIVERY_FEE payments reference the job and never allocate to food bills. Enforce purpose/link consistency and amount/currency checks. Payment record states map to pending, confirmed, failed, refund required and refund completed; existing aggregate `payment_status` on orders remains independent of order and delivery state. Refund rows and audit preserve the decisions and manual confirmation actor.

### transactional_outbox

`id UUID PK`, `aggregate_type VARCHAR`, `aggregate_id UUID`, `event_type VARCHAR`, `payload JSONB`, `created_at TIMESTAMPTZ`, `published_at TIMESTAMPTZ NULL`, `attempts INTEGER`, `next_attempt_at TIMESTAMPTZ NULL`, `last_error TEXT NULL`; index unpublished rows by next attempt. Persist in the same transaction as business changes; a worker publishes idempotently and retries. Consumers deduplicate on event ID.
