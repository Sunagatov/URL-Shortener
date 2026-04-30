# Modern URL Analytics Plan

## Document Status

- status: proposed implementation plan
- audience: backend, frontend, product, DevOps
- scope: analytics for shortened links, account dashboards, and QR scans
- target standard: modern link analytics comparable to mainstream 2026 link-management products

---

## Executive Summary

The current project has only a basic analytics primitive: a redirect increments `clickCount`. That is useful for a vanity total, but it is not a modern analytics product. A 2026-grade URL shortener is expected to answer:

- how many clicks happened during a selected time range
- how performance changed versus the previous period
- which links performed best
- where traffic came from
- which devices and browsers users used
- which countries generated engagement
- how link clicks differ from QR scans
- how analytics behave across an entire account, not just one link

To support that, the system must move from counter-only tracking to an event-based analytics architecture with:

- asynchronous event capture at redirect time
- normalized dimensions such as referrer, country, device, browser, and OS
- privacy-aware storage and retention
- query APIs for per-link and account-wide reporting
- a frontend analytics dashboard
- a rollup strategy for scale

This document describes the full product, data, API, architecture, operational, and rollout plan.

---

## Background And Current State

### What Exists Today

From the current codebase:

- redirects work and return `302`
- redirects increment `clickCount`
- URL mappings have owner association
- users can list and inspect owned links
- there is no analytics dashboard
- there are no analytics endpoints
- there is no historical click-event record
- there is no referrer, geo, device, browser, or OS breakdown
- QR analytics are not implemented

### Why The Current Model Is Insufficient

A single incrementing counter cannot support:

- time-series charts
- date-range filtering
- period-over-period deltas
- referrer reports
- country reports
- device/browser/OS reports
- bot filtering
- account-level aggregation by time window
- QR-vs-link engagement comparisons

Even if `clickCount` is perfectly accurate, it is analytically shallow.

### Product Reality In 2026

Modern users expect a shortener to function as a lightweight traffic intelligence product, not just a redirect service. The default baseline in 2026 includes:

- per-link performance reporting
- account-wide reporting
- device and referrer breakdowns
- QR tracking
- export or reporting hooks
- at least basic bot filtering

Without these capabilities, the product remains a utility rather than a link-management platform.

---

## Vision

Build an analytics system that preserves redirect speed while producing useful, privacy-aware, queryable traffic intelligence for both individual links and entire user accounts.

The design goal is not to clone every enterprise reporting feature immediately. The design goal is to create a clean architecture that:

- supports a solid v1 quickly
- does not paint the system into a corner
- can scale from hobby traffic to meaningful production usage

---

## Goals

- Track analytics at event level rather than only by summary count.
- Maintain low redirect latency.
- Provide useful per-link analytics to end users.
- Provide account-wide analytics for authenticated users.
- Support date-range reporting and time-series aggregation.
- Add QR analytics without building a separate analytics architecture.
- Keep the design privacy-aware and operationally manageable.
- Allow later addition of exports, unique visitor estimation, campaign views, and advanced dashboards.

---

## Non-Goals

These are explicitly not part of the first core milestone unless product requirements change:

- AI-generated natural-language analytics summaries
- custom user-built report designer
- PDF slide-ready report generation
- third-party ad network attribution models
- cross-device identity stitching
- warehouse-scale streaming analytics stack
- real-time websocket dashboards
- organization/team/seat-based analytics permissions beyond current ownership model

These features may be added later, but they should not distort the v1 architecture.

---

## Guiding Principles

### 1. Redirect Speed Is Sacred

The redirect path is the core product path. Analytics must not materially degrade it.

### 2. Event Data First, Pretty Charts Second

Good analytics UIs depend on reliable event capture and aggregation. The data layer comes first.

### 3. Privacy By Default

The system should minimize retention of identifiable network and agent data.

### 4. Normalize Early

Raw request metadata is messy. Normalize referrer, country, device, browser, and OS into stable dimensions at ingest time when practical.

### 5. Query The Shapes The UI Needs

Analytics APIs should return UI-ready aggregates rather than leaking raw event complexity into the frontend.

### 6. Design For Incremental Scale

Start with raw events plus strong indexes. Add rollups only when query cost justifies them.

---

## User Personas And Their Questions

### Link Owner

Questions:

- Is this link getting traffic?
- Did performance improve this week?
- Which channel is driving clicks?
- Are users mostly mobile or desktop?
- Which countries are clicking?

### Content Marketer

Questions:

- Which of my links performed best this month?
- Which traffic sources matter?
- Are my QR campaigns working?

### Product Operator / Admin

Questions:

- Is traffic spiking abnormally?
- Are bots skewing counts?
- Are analytics ingestion jobs failing?

---

## Success Criteria

The analytics initiative is successful when:

- per-link analytics answer the most common traffic questions
- account-wide reporting is usable
- redirect latency stays within acceptable bounds
- bot noise is reasonably filtered from user-facing totals
- raw analytics retention is defined and enforced
- the system supports both link clicks and QR scans using one analytics model

---

## Functional Scope

### Core Analytics Features

The core release should provide:

- total clicks
- clicks in selected range
- last 7 days clicks
- previous-period comparison
- clicks-over-time chart
- top referrers
- top locations
- top device types
- top browsers
- top operating systems
- top-performing links across an account

### Extended Analytics Features

The next layer should provide:

- QR scan tracking
- separate event filters by type
- CSV export
- unique-visitor estimation
- campaign segmentation

### Explicitly Deferred Advanced Features

- cohort analysis
- funnel analysis
- conversion event integrations
- UTM auto-attribution dashboards
- anomaly detection and alerting

---

## Definitions

Use consistent vocabulary across backend and frontend.

- `link click`: a redirect event generated by a standard short link visit
- `qr scan`: a redirect event generated by a QR path or QR-associated visit
- `event`: one analytics record at visit level
- `summary`: high-level totals and comparison metrics
- `timeseries`: traffic grouped into time buckets
- `breakdown`: traffic grouped by a dimension like country or referrer
- `selected period`: the user-chosen reporting window
- `previous period`: the immediately preceding window of equal length
- `bot`: automated traffic excluded from standard user-facing metrics

---

## Current Gaps Against The Target

### Data Gaps

- no event history
- no event dimensions
- no date-range aggregation
- no bot classification
- no QR event types

### API Gaps

- no analytics routes
- no summary DTOs
- no breakdown DTOs
- no timeseries DTOs

### UI Gaps

- no charts
- no dashboard entry points
- no analytics state management
- no range selector

### Operational Gaps

- no event retention policy
- no analytics monitoring
- no background processing guarantees
- no backfill policy

---

## Target Product Experience

### Per-Link Analytics Experience

When a user opens a link details page, they should see:

- a summary strip with totals and deltas
- a date-range selector
- a line chart for clicks-over-time
- cards or panels for referrers, locations, devices, browsers, and OS
- an empty state if traffic is too low
- a label when data is filtered to exclude bots

### Account Analytics Experience

When a user opens an account analytics dashboard, they should see:

- total clicks in selected period
- total clicks in previous period
- percentage change
- aggregate timeseries across all their links
- top links table
- aggregate referrer/location/device breakdowns

### QR Analytics Experience

When QR is implemented, the user should be able to:

- see QR scans separately from normal clicks
- filter charts by event type
- understand whether QR drove traffic different from normal link sharing

---

## Architecture Overview

The recommended architecture is:

1. redirect request arrives
2. destination URL is resolved
3. redirect response is prepared immediately
4. lightweight tracking payload is emitted asynchronously
5. background tracking layer enriches and persists the event
6. query APIs aggregate raw events or rollups for analytics views

This separates traffic-serving from analytics-serving concerns.

---

## Ingestion Architecture Options

### Option A: In-Process Async Write

Flow:

- redirect controller creates a lightweight tracking command
- service submits it to async executor
- async worker enriches and writes to MongoDB

Pros:

- easy to implement
- minimal moving parts
- good first step for current project size

Cons:

- weaker durability if process dies after response but before write
- burst handling is limited by app instance resources

### Option B: Queue-Backed Ingestion

Flow:

- redirect controller publishes tracking message
- queue consumer enriches and writes

Pros:

- better durability
- better burst handling
- better decoupling

Cons:

- higher complexity
- operational overhead

### Recommended Choice

For this codebase, start with Option A if traffic is moderate and the goal is incremental delivery. Design service boundaries so a queue can replace the executor later without rewriting the domain model or analytics APIs.

---

## Data Model

### Keep `UrlMapping` Lightweight

`UrlMapping` should remain the authoritative record for:

- identity
- ownership
- destination URL
- creation time
- expiration settings
- lightweight counters

Recommended summary fields in `UrlMapping`:

- `clickCount`
- `lastClickedAt`
- `qrScanCount`
- `lastQrScannedAt`

These are convenience summaries, not the reporting source of truth.

### New Raw Event Collection: `url_visit_events`

This collection stores analytics events at visit level.

Suggested canonical document:

```json
{
  "_id": "evt_01JABC...",
  "urlHash": "abc12345",
  "userId": "usr_123",
  "eventType": "link_click",
  "occurredAt": "2026-04-30T12:34:56Z",
  "requestId": "corr_...",
  "referrerRaw": "https://twitter.com/example/status/123",
  "referrerDomain": "twitter.com",
  "referrerCategory": "Twitter",
  "countryCode": "GB",
  "regionCode": "ENG",
  "city": "London",
  "deviceType": "mobile",
  "browser": "Chrome",
  "browserVersionMajor": "135",
  "operatingSystem": "Android",
  "operatingSystemVersionMajor": "15",
  "userAgentHash": "sha256:...",
  "ipHash": "sha256:...",
  "isBot": false,
  "botCategory": null,
  "isUniqueCandidate": true,
  "sourceType": "redirect",
  "qrCodeId": null,
  "metadataVersion": 1
}
```

### Why These Fields Exist

- `urlHash`: enables link-level analytics
- `userId`: enables account-level analytics without join-like lookups
- `eventType`: distinguishes clicks and scans
- `occurredAt`: enables time filtering and bucketing
- `referrer*`: enables source reporting and normalization
- `country/region/city`: enables geo reporting
- `device/browser/os`: enables client breakdowns
- `userAgentHash` and `ipHash`: allow privacy-aware dedupe and anomaly logic
- `isBot`: allows user-facing filtering
- `metadataVersion`: protects future schema evolution

### Optional Derived Collections

Later, if analytics scale requires it:

- `url_analytics_daily`
- `url_analytics_hourly`
- `account_analytics_daily`

These should be treated as accelerators, not as the only source of truth.

---

## Canonical Enumerations

### Event Types

```text
link_click
qr_scan
```

Future-safe additions:

```text
page_click
bio_link_click
api_resolve
```

### Device Types

```text
desktop
mobile
tablet
bot
unknown
```

### Source Types

```text
redirect
qr
internal_preview
```

### Bot Categories

```text
search_crawler
social_preview
uptime_monitor
generic_automation
unknown_bot
```

---

## Ingestion Pipeline In Detail

### Step 1: Capture Minimal Tracking Command

At redirect time, capture only the cheap fields directly available on the request:

- `urlHash`
- `userId`
- `occurredAt`
- remote IP
- `Referer`
- `User-Agent`
- optional correlation id
- redirect source context, if QR-triggered

### Step 2: Return Redirect

Prepare and return the `302` without waiting for:

- geo lookup
- UA parsing
- MongoDB aggregation work
- bot heuristics beyond trivial checks

### Step 3: Async Enrichment

The async worker:

- parses referrer
- classifies referrer category
- resolves geo
- parses UA
- classifies device/browser/OS
- classifies bot-ness
- hashes sensitive fields
- writes raw event
- updates lightweight counters

### Step 4: Summary Counter Update

Continue maintaining `clickCount` and later `qrScanCount` for fast high-level display and low-cost sorting.

### Failure Model

If enrichment fails:

- the redirect must still succeed
- the failure must be logged with correlation id
- partial fallback write should be considered if feasible

Minimal fallback event should include:

- `urlHash`
- `userId`
- `eventType`
- `occurredAt`
- `isBot = unknown default false?`

Prefer explicit classification over silent data invention.

---

## Referrer Handling

### Raw Referrer Capture

Store the raw referrer value only if privacy policy permits. If retained, consider shorter retention than normalized dimensions.

### Referrer Domain Extraction

Examples:

- `https://www.google.com/search?q=x` -> `google.com`
- `https://m.facebook.com/...` -> `facebook.com`
- empty referrer -> null

### Referrer Category Normalization

Map known domains to stable user-facing categories:

```text
google.com -> Google
facebook.com -> Facebook
instagram.com -> Instagram
linkedin.com -> LinkedIn
reddit.com -> Reddit
t.co -> Twitter
twitter.com -> Twitter
telegram.me -> Telegram
t.me -> Telegram
whatsapp.com -> WhatsApp
youtube.com -> YouTube
```

Rules:

- no referrer -> `Direct`
- QR event -> `Bitly QR Code` or product-specific equivalent
- unknown domain -> root domain label

### Why Normalization Matters

Without normalization, reports become polluted by:

- subdomain fragmentation
- mobile-site fragmentation
- URL-format differences

---

## User-Agent Parsing

### Output Dimensions

Derive:

- `deviceType`
- `browser`
- `browserVersionMajor`
- `operatingSystem`
- `operatingSystemVersionMajor`

### Parsing Rules

- use a maintained parser library
- do not build regex parsing manually unless unavoidable
- treat parser failure as `unknown`, not as an error

### Data Quality Principle

User-agent parsing is best-effort classification, not perfect identity.

---

## Geo Resolution

### Minimum Viable Geo

For the first milestone, country-level reporting is enough.

Recommended first-release dimensions:

- `countryCode`
- `regionCode` optional
- `city` optional

### Failure Rules

- if geo lookup fails, event still persists
- unresolved geography becomes `unknown`
- redirect never blocks on lookup failure

### Privacy Rule

Exact user IP should not be stored long-term solely for analytics if a hashed form is sufficient.

---

## Bot Detection

### Why It Matters

Without bot filtering, analytics get distorted by:

- crawlers
- social unfurlers
- uptime checkers
- scripted test traffic

### First-Release Heuristics

- known bot user-agent signatures
- social preview agents
- monitoring agent signatures
- suspicious non-browser traffic patterns

### Product Behavior

Default user-facing analytics should:

- exclude bot traffic
- clearly label that the default view excludes bots

Internal or advanced views may:

- include bot traffic as a toggle

### Storage Behavior

Prefer storing bot events with `isBot = true` rather than dropping them entirely. This preserves auditability and future tuning options.

---

## Unique Visitor Strategy

### Why This Is Hard

True user identity across browsers/devices is not available in a redirect service.

### Recommended v1 Position

Do not promise exact unique visitors in the first release.

### Optional Approximation Later

Estimate unique visitors by a rolling fingerprint candidate such as:

- `ipHash + uaHash + day`

This must be labeled clearly as estimated or approximate.

---

## Storage And Retention Strategy

### Raw Event Retention

Recommended:

- retain raw events for 90 to 180 days

### Aggregate Retention

Recommended:

- retain daily aggregates much longer
- potentially indefinitely if storage cost is acceptable

### Separate Retention By Field Sensitivity

If possible:

- drop `referrerRaw` earlier than normalized categories
- drop raw UA earlier than parsed dimensions

### Deletion Semantics

When a link is deleted:

- decide whether analytics should be hard-deleted immediately, soft-retained for audit, or TTL-removed later

Recommended default for a user-facing consumer product:

- delete or anonymize analytics on a defined schedule after link deletion

Exact behavior should be documented.

---

## MongoDB Schema Strategy

### Indexes For Raw Events

Initial recommended indexes:

- `{ urlHash: 1, occurredAt: -1 }`
- `{ userId: 1, occurredAt: -1 }`
- `{ urlHash: 1, eventType: 1, occurredAt: -1 }`
- `{ userId: 1, eventType: 1, occurredAt: -1 }`
- `{ occurredAt: -1 }` if global maintenance queries need it

Additional indexes may be added later for hot filters, but should be justified by actual query patterns.

### TTL Index

If MongoDB TTL is used:

- index on raw event retention timestamp or `occurredAt`
- use it only for raw-event deletion
- do not TTL-delete rollup collections unless specifically intended

### Write Amplification Tradeoff

Adding too many secondary indexes will slow writes. Start with the minimum set that supports the first dashboard queries.

---

## Rollup Strategy

### Why Rollups Exist

As raw events grow, repeatedly aggregating long time windows directly from visit-level data becomes expensive.

### When To Add Rollups

Add rollups when:

- dashboard queries become slow
- account analytics range queries are too expensive
- event volume makes ad hoc aggregation costly

### Suggested Rollups

#### `url_analytics_daily`

Dimensions:

- `urlHash`
- `userId`
- `date`
- `eventType`
- `isBot`

Metrics:

- `count`
- `lastOccurredAt`

#### `url_breakdown_daily`

Dimensions:

- `urlHash`
- `userId`
- `date`
- `eventType`
- `dimensionType`
- `dimensionValue`

Metrics:

- `count`

Where `dimensionType` could be:

- `referrer`
- `country`
- `device`
- `browser`
- `os`

### Rollup Computation Options

- synchronous write-side updates
- scheduled batch rollups
- streaming incremental rollups

Recommended path:

1. raw events only
2. scheduled batch daily rollups
3. optional incremental rollups later if needed

---

## Query Model

Analytics APIs should serve pre-aggregated shapes rather than raw events.

### Required Query Types

- per-link summary
- per-link timeseries
- per-link dimension breakdown
- account-wide summary
- account-wide timeseries
- account-wide top-links
- account-wide breakdowns

### Common Filters

- `from`
- `to`
- `timezone`
- `eventType`
- `includeBots` optional, default false

### Timezone Rule

Store timestamps in UTC.

For analytics output:

- aggregate according to requested timezone when computing buckets
- if no timezone provided, choose a documented default, ideally UTC or user preference if that feature exists

---

## API Design

### Principles

- keep APIs resource-oriented
- keep output UI-friendly
- validate ownership strictly
- avoid overly generic analytics endpoints for the first release

### Per-Link Endpoints

```text
GET /api/v1/urls/{urlHash}/analytics/summary
GET /api/v1/urls/{urlHash}/analytics/timeseries
GET /api/v1/urls/{urlHash}/analytics/referrers
GET /api/v1/urls/{urlHash}/analytics/locations
GET /api/v1/urls/{urlHash}/analytics/devices
GET /api/v1/urls/{urlHash}/analytics/browsers
GET /api/v1/urls/{urlHash}/analytics/operating-systems
```

### Account-Level Endpoints

```text
GET /api/v1/analytics/summary
GET /api/v1/analytics/timeseries
GET /api/v1/analytics/top-links
GET /api/v1/analytics/referrers
GET /api/v1/analytics/locations
GET /api/v1/analytics/devices
GET /api/v1/analytics/browsers
GET /api/v1/analytics/operating-systems
```

### Future Endpoints

```text
GET /api/v1/urls/{urlHash}/analytics/export.csv
GET /api/v1/analytics/export.csv
```

### Common Query Parameters

```text
from=2026-04-01T00:00:00Z
to=2026-04-30T23:59:59Z
timezone=Europe/London
eventType=link_click
includeBots=false
limit=10
```

### Validation Rules

- `from` must be before `to`
- max range for raw aggregation may be limited initially
- `eventType` must be recognized
- user must own the link for per-link routes

---

## Suggested DTO Contracts

### Summary Response

```json
{
  "urlHash": "abc12345",
  "selectedRange": {
    "from": "2026-04-24T00:00:00Z",
    "to": "2026-04-30T23:59:59Z",
    "timezone": "Europe/London"
  },
  "metrics": {
    "totalClicks": 7421,
    "clicksInRange": 381,
    "previousPeriodClicks": 301,
    "changeAbsolute": 80,
    "changePercent": 26.58,
    "lastClickedAt": "2026-04-30T11:20:02Z"
  },
  "filters": {
    "eventType": "link_click",
    "includeBots": false
  }
}
```

### Timeseries Response

```json
{
  "urlHash": "abc12345",
  "bucket": "day",
  "points": [
    { "timestamp": "2026-04-24T00:00:00Z", "count": 42 },
    { "timestamp": "2026-04-25T00:00:00Z", "count": 55 }
  ]
}
```

### Breakdown Response

```json
{
  "dimension": "referrer",
  "items": [
    { "label": "Direct", "count": 120, "percentage": 39.34 },
    { "label": "Google", "count": 87, "percentage": 28.52 },
    { "label": "Twitter", "count": 41, "percentage": 13.44 }
  ]
}
```

### Top Links Response

```json
{
  "items": [
    {
      "urlHash": "abc12345",
      "shortUrl": "https://sho.rt/abc12345",
      "originalUrl": "https://example.com/a",
      "clicksInRange": 381
    }
  ]
}
```

---

## Aggregation Semantics

### Selected Period

The selected period is always the user-requested time range.

### Previous Period

If selected period length is N, previous period is the immediately preceding N-length range.

### Percentage Change

Rules:

- if previous is zero and current is zero -> `0`
- if previous is zero and current is greater than zero -> either `null`, `Infinity`, or a product-defined special state

Recommended:

- return `null` for `changePercent` when denominator is zero
- let frontend render "new" or em dash

### Bucket Selection

Suggested logic:

- <= 48 hours -> hourly buckets
- <= 90 days -> daily buckets
- > 90 days -> weekly buckets

This can be tuned later.

---

## Backend Service Design

Suggested services:

- `TrackUrlVisitService`
- `UrlVisitEventWriter`
- `ReferrerClassifier`
- `UserAgentParserService`
- `GeoLookupService`
- `BotDetectionService`
- `UrlAnalyticsQueryService`
- `AccountAnalyticsQueryService`
- `AnalyticsDateRangeService`
- `AnalyticsBucketService`

### Responsibilities

#### `TrackUrlVisitService`

- receives tracking command from redirect layer
- dispatches asynchronous processing

#### `UrlVisitEventWriter`

- persists enriched events
- updates lightweight counters

#### `ReferrerClassifier`

- parses raw referrer
- extracts normalized domain and category

#### `UserAgentParserService`

- parses UA into device/browser/OS dimensions

#### `GeoLookupService`

- resolves geographic dimensions from client IP

#### `BotDetectionService`

- marks known bots and automation

#### `UrlAnalyticsQueryService`

- runs per-link summary, timeseries, and breakdown queries

#### `AccountAnalyticsQueryService`

- aggregates analytics across all links owned by current user

---

## Redirect Flow Changes

### Current Behavior

Redirect currently resolves the link and increments a counter.

### Required Changes

The redirect layer must:

- continue resolving the destination
- construct a tracking command with request metadata
- emit tracking asynchronously
- preserve existing redirect behavior and headers

### Critical Constraint

No network-bound enrichment should happen inline in the request thread unless the implementation has been explicitly benchmarked and proven negligible.

---

## Ownership And Security Model

### Per-Link Analytics Access

Only the owner of a link should be able to access that link's analytics.

### Account-Wide Analytics Access

Only the authenticated user should access their own account-wide analytics.

### Public Access

Analytics should not be public by default.

### Abuse Considerations

- analytics endpoints may need their own rate limits
- export endpoints will need stricter limits later
- invalid or unauthorized analytics queries should return JSON errors consistent with the rest of the API

---

## Frontend Product Plan

### Per-Link Analytics UI

Extend the URL details page with:

- date range selector
- KPI cards
- timeseries chart
- top referrers panel
- top locations panel
- top devices panel
- top browsers panel
- top operating systems panel

### Account Dashboard UI

Create an analytics page or extend the dashboard with:

- account summary cards
- aggregate timeseries
- top-performing links table
- source and geo panels

### UX Requirements

- default to last 7 days
- preserve filters in URL state if possible
- skeleton loaders during requests
- clean empty states for no traffic
- visible explanation if bots are excluded
- responsive layout on mobile and desktop

### Visualization Recommendations

- line chart for timeseries
- horizontal bar charts for referrers and locations
- bar or donut charts for device split
- compact ranked list for top links

### Avoid

- over-animated charts
- chart types that obscure numeric comparison
- excessive decoration that reduces readability

---

## QR Analytics Design

### Product Requirement

QR analytics must not be built as a separate analytics universe. It should reuse the same event architecture.

### Core Rules

- QR scans are events in the same collection
- `eventType = qr_scan`
- QR-specific filters are applied at query layer
- per-link views can show clicks, scans, or both

### Additional QR Fields

If needed later:

- `qrCodeId`
- `qrTemplateId`
- `qrVariant`

### QR Reporting Views

Per-link:

- total scans
- scans over time
- scans by country
- scans by browser
- scans by OS

Account-wide:

- total scans across account
- top scanned QR-enabled links

---

## Reporting Semantics For Mixed Events

When both link clicks and QR scans exist:

- the API must clearly state which event types are included
- the UI must label totals clearly

Recommended modes:

- `all`
- `link_click`
- `qr_scan`

This prevents ambiguous totals.

---

## Operational Architecture

### Monitoring

Track at minimum:

- redirect latency p50/p95/p99
- async analytics task failure rate
- analytics event write throughput
- event enrichment failure rate
- geo lookup failure rate
- analytics API latency
- rollup job latency and failure rate

### Logging

Log analytics failures with:

- correlation id
- url hash
- stage of failure
- exception class

Do not log sensitive raw fields carelessly.

### Alerting

Alert when:

- event writes fail repeatedly
- analytics queue/executor backlog grows dangerously
- redirect latency regresses after analytics rollout
- rollup jobs stop running

---

## Performance Considerations

### Redirect Path

Budget should heavily favor redirect speed. Analytics write and enrichment must be decoupled enough that:

- temporary analytics slowness does not break redirects
- temporary geo/UA parsing issues do not fail redirects

### Query Path

The analytics query path is allowed to be heavier than redirect, but it must still be reasonable for dashboard use.

Suggested goals:

- summary queries: fast enough for above-the-fold load
- timeseries and breakdown queries: avoid multi-second responses for normal account sizes

Exact SLOs can be defined later.

---

## Backfill Policy

### What Can Be Backfilled

From the current system, only total count-like fields exist.

### What Cannot Be Backfilled Honestly

You cannot reconstruct:

- historical timeseries
- historical referrers
- historical countries
- historical devices
- historical QR scans

### Product Communication

For pre-analytics-era links:

- show totals if available
- clearly mark detailed analytics as available only from launch date onward

Do not fabricate historical breakdowns.

---

## Migration Plan

### Schema Migration

1. add new event collection
2. add any new summary fields to `UrlMapping`
3. add indexes
4. deploy tracking write path behind a feature flag if desired

### Application Migration

1. release backend tracking
2. verify event ingestion
3. release analytics endpoints
4. release frontend UI
5. enable QR event support later

### Safety Strategy

Use staged rollout if production traffic is meaningful:

- track-only mode first
- UI hidden or internal first
- public UI after validation

---

## Testing Strategy

### Unit Tests

Test:

- referrer normalization
- UA parsing wrapper behavior
- bot detection logic
- date range calculations
- previous period calculation
- bucket selection logic

### Integration Tests

Test:

- redirect emits analytics command
- analytics write persists expected dimensions
- ownership checks protect analytics endpoints
- aggregation results match seeded event fixtures

### Performance Tests

Test:

- redirect latency with analytics enabled
- dashboard queries over realistic event volumes
- rollup jobs over large data windows

### Frontend Tests

Test:

- date range filter behavior
- chart and breakdown rendering
- empty/loading/error states
- event-type filter behavior when QR is added

---

## Acceptance Criteria

### Phase 1 Acceptance

- redirect still succeeds when analytics enrichment fails
- raw click events are persisted asynchronously
- `clickCount` continues to update
- event documents contain normalized core dimensions where available

### Phase 2 Acceptance

- per-link summary endpoint returns correct totals and comparison values
- per-link timeseries endpoint returns correct buckets
- per-link breakdown endpoints return stable percentages and counts

### Phase 3 Acceptance

- URL details page shows useful analytics modules
- filters work correctly
- empty-state and no-data experiences are acceptable

### Phase 4 Acceptance

- account dashboard aggregates all owned links correctly
- top links ranking is correct for selected range

### Phase 5 Acceptance

- QR scans are stored as `qr_scan`
- QR analytics can be queried separately from clicks
- per-link analytics can show combined and filtered views

---

## Rollout Phases

### Phase 0: Foundation Decisions

- confirm retention policy
- choose async execution model
- choose geo provider
- choose UA parser
- define privacy constraints

### Phase 1: Event Capture

- add event model
- add async tracking service
- persist click events
- update summary counters
- add indexes

### Phase 2: Query APIs

- build summary endpoint
- build timeseries endpoint
- build referrer/location/device/browser/OS breakdown endpoints
- add account-wide analytics endpoints

### Phase 3: Frontend Analytics

- add per-link analytics page sections
- add account dashboard views
- add date range filtering

### Phase 4: Data Quality And Hardening

- improve bot classification
- add retention jobs
- monitor and tune query performance

### Phase 5: QR Analytics

- track scan events
- add QR filters and UI

### Phase 6: Optimization

- add rollups if necessary
- add CSV export
- optionally add estimated unique visitors

---

## Recommended First Milestone

If the team wants the highest-impact narrow slice, ship this first:

1. raw event collection for clicks
2. async redirect tracking
3. per-link summary API
4. per-link timeseries API
5. per-link referrer, country, and device breakdowns
6. analytics UI on the existing URL details page

This is the smallest product slice that materially changes the system from a basic shortener into a modern analytics-capable platform.

---

## Concrete Work Breakdown

### Backend Domain Work

- define analytics event entity
- define enums for event type and device type
- add repository or MongoTemplate query layer
- implement tracking command object
- implement async writer service

### Backend Enrichment Work

- implement referrer parser/classifier
- integrate UA parser
- integrate geo lookup
- implement bot classifier
- implement sensitive-field hashing

### Backend API Work

- define DTOs
- define controllers
- implement query services
- implement date-range validation
- implement ownership enforcement

### Frontend Work

- add analytics API client
- add types
- add hooks for summary and breakdown loading
- build analytics cards and chart sections
- integrate into URL details page
- add account analytics page

### DevOps / Ops Work

- choose geo database/service
- configure retention
- add monitoring and dashboards
- load test redirect path

---

## Risks

### Risk: Redirect Latency Regression

Mitigation:

- async ingestion
- strict benchmarking
- avoid inline geo or DB-heavy work

### Risk: Analytics Inaccuracy Due To Bots

Mitigation:

- basic bot classification in v1
- store bot flag
- exclude bots by default in reports

### Risk: Query Cost Grows Quickly

Mitigation:

- start with good indexes
- add rollups only when needed

### Risk: Privacy Concerns

Mitigation:

- hash IPs
- minimize raw field retention
- document retention behavior

### Risk: Product Confusion Around Historical Data

Mitigation:

- clearly communicate analytics availability start date

---

## Open Questions

- What is the exact raw event retention period?
- Should city-level geo be included in the first public release?
- Which timezone should default dashboards use if the user has no saved preference?
- Should bot traffic be visible via a toggle in v1 or only excluded silently?
- Do we want account analytics as a dedicated page or folded into the existing dashboard?
- Should unique visitor estimation be deferred entirely?
- Should QR event fields be added now even before QR generation ships?
- Do deleted links keep historical analytics for a grace period or get purged immediately?

---

## Final Recommendation

Implement analytics as a dedicated event-based subsystem, not as an extension of `clickCount`.

Keep the redirect path fast. Capture only what is cheap inline. Enrich and persist asynchronously. Build query APIs around the actual dashboard needs. Add rollups only when the real data volume requires them. Treat QR analytics as a first-class event type within the same model. Make privacy and bot filtering part of the first design, not post-launch cleanup.

That approach gives this project a credible path from a simple URL shortener to a modern link analytics platform.
