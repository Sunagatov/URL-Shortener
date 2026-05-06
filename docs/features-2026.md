# Feature Roadmap — 2026

## What Already Exists (May 2026)

| Area | What's there | Key code |
|---|---|---|
| Core | URL shortening (CRC32+Base58), custom aliases (3–30 chars, `[a-zA-Z0-9_-]`), expiration 1–365 days, click & QR-scan counters | `UrlManagementService`, `StringEncoder`, `UrlMapping` |
| Redirect | HTTP 302, `?qr` flag distinguishes QR scans from clicks, cache-control header based on remaining TTL | `UrlRedirectController` |
| Auth | Email/password sign-up, Google OAuth, email verification, password reset, JWT + refresh tokens, token versioning | `AuthService`, `JwtTokenProvider`, `GoogleAuthService` |
| Analytics | Per-visit events with country/city, device type, browser, OS, referrer domain/category, bot detection (4 categories), source type, 90-day TTL | `UrlVisitEvent`, `TrackUrlVisitService`, `BotDetectionService`, `GeoLookupService` |
| Analytics UI | Timeseries chart, breakdown panel, top links table, date-range filter, event-type filter, per-account and per-URL views, CSV export | `AccountAnalyticsPage`, `UrlAnalyticsQueryService` |
| Management | URL CRUD, bulk delete, paginated list (max 100/page), user profile + password change | `UrlManagementService`, `UserAccountService` |
| Platform | Per-route rate limiting with 5 distinct policies (`auth`, `public_create`, `public_redirect`, `authenticated_api`, `frontend_logs`), Caffeine cache keyed by `urlHash`, correlation IDs, frontend log ingestion | `RateLimitConfig`, `UrlMappingAccessService`, `CorrelationIdFilter` |

### Gaps in the current implementation (fix these before new features)

| Gap | Detail | Effort |
|---|---|---|
| No QR code generation | `qrScanCount` and `?qr` tracking exist, but the app never generates a QR image | S |
| `UpdateUrlRequest` only changes `originalUrl` | Expiry date and alias cannot be updated after creation | S |
| No full-text search | URL list only supports pagination; no keyword search across `originalUrl` or `shortUrl` | S |
| No anonymous link claim | Links created while logged out (`userId=null`) cannot be claimed when the user later signs up | M |
| No bulk import | Bulk delete exists in the UI; bulk creation via CSV upload does not | M |
| Analytics retention hardcoded | `RETENTION_DAYS = "7776000s"` (90 days) is a constant; changing it requires a code deploy | S |

---

## Proposed Features

Features are grouped thematically. Each entry names the exact backend classes that would change to keep estimates honest.

---

### Group A — Link Control

#### A1. Password-Protected Links
Visitors must enter a password before being redirected.

- Add `passwordHash: String?` (BCrypt) to `UrlMapping`
- In `UrlRedirectController.redirect()`: if hash is set, return a plain HTML interstitial page instead of the 302; validate submitted password, then issue a short-lived session cookie and redirect
- No JS required — works with any browser and curl
- **Touches:** `UrlMapping`, `UrlRedirectController`, `UrlManagementService.buildUrlMapping()`, `ShortenUrlRequest`
- **Effort:** M

#### A2. Link Expiry by Click Cap
Automatically disable a link after N clicks.

- Add `maxClicks: Long?` to `UrlMapping`
- In `UrlMappingAccessService.getActiveUrlMapping()`: add `clickCount >= maxClicks` check alongside the existing `expirationDate` check; return 410 Gone when exhausted
- Useful for one-time invite links and limited promotional offers
- **Touches:** `UrlMapping`, `UrlMappingAccessService`, `ShortenUrlRequest`
- **Effort:** S

#### A3. Scheduled Link Activation
A link is inactive before a future `activeFrom` timestamp.

- Add `activeFrom: Instant?` to `UrlMapping`
- Same `getActiveUrlMapping()` method: add `activeFrom?.isAfter(now) == true` → 404
- Works alongside `expirationDate` — a link can have both a start and an end
- **Touches:** `UrlMapping`, `UrlMappingAccessService`, `ShortenUrlRequest`
- **Effort:** S

#### A4. Smart Redirects (Geo / Device Targeting)
Route visitors to different destinations based on country or device type.

- Add `redirectRules: List<RedirectRule>` to `UrlMapping` where `RedirectRule` carries `condition` (country code or device type) and `targetUrl`
- Evaluate rules in `UrlRedirectController.redirect()` before constructing the `URI`; fall back to `originalUrl` if no rule matches
- Reuses `GeoLookupService` and `UserAgentParserService` already running on every redirect
- **Touches:** `UrlMapping`, `UrlRedirectController`, `ShortenUrlRequest`
- **Effort:** M

#### A5. A/B Split Testing
Send a configurable percentage of traffic to each of multiple destinations.

- Replace `originalUrl: String` with `targets: List<SplitTarget>` (url + integer weight) when the feature is enabled; keep `originalUrl` as a computed property pointing at the first target for backwards compatibility
- Pick a target with weighted-random selection in `UrlRedirectController`; record which variant was served by adding `variant: String?` to `UrlVisitEvent`
- Analytics dashboard shows per-variant click counts and a delta card
- **Touches:** `UrlMapping`, `UrlVisitEvent`, `UrlRedirectController`, `UrlAnalyticsQueryService`
- **Effort:** L

---

### Group B — Analytics & Insights

#### B1. UTM Parameter Builder
Append UTM query parameters to the destination URL before creating the short link.

- Pure frontend feature: a UI wizard (source, medium, campaign, term, content) appends params to `originalUrl` before calling `POST /api/v1/urls`
- Store the five UTM values in separate fields on `UrlMapping` for later filtering in analytics queries
- **Touches:** `ShortenUrlRequest`, `UrlMapping`, frontend `UrlShortenerHero`
- **Effort:** S (frontend) + S (backend fields)

#### B2. Conversion Goals
Track when a visitor completes an action after clicking the link (e.g., reaching a thank-you page).

- New `EventType.CONVERSION` emitted by a lightweight pixel (`GET /api/v1/pixel/{urlHash}`) embedded on the destination page
- Conversion rate = conversions / clicks shown on analytics summary cards and timeseries
- **Touches:** `EventType`, new `PixelController`, `UrlAnalyticsQueryService`, `AnalyticsMetrics`
- **Effort:** M

#### B3. Configurable Analytics Retention
Let admins (or pro users) extend retention beyond the current hardcoded 90 days.

- Externalise `RETENTION_DAYS` into `application.yml` (`app.analytics.retention-days: 90`)
- Per-user override stored on `UserAccountDocument` for paid tiers
- TTL index on `UrlVisitEvent` must be updated via a MongoDB `collMod` command on deploy
- **Touches:** `UrlVisitEvent`, `UserAccountDocument`, application config
- **Effort:** S

#### B4. Click-Time Heatmap
Show which hours of the day / days of the week get the most traffic.

- New aggregation query grouped by `dayOfWeek` and `hour(occurredAt)` using existing `UrlVisitEvent` data
- Rendered as a 7×24 heatmap grid on the analytics page
- No new data collection — purely a new query and UI component
- **Touches:** `UrlAnalyticsQueryService`, new `AnalyticsHeatmapResponse` DTO, frontend analytics page
- **Effort:** M

---

### Group C — Social & Sharing

#### C1. Open Graph / Link Preview Override
Let users set a custom OG title, description, and image so that Slack, iMessage, and Twitter show a rich preview.

- Add `ogTitle`, `ogDescription`, `ogImageUrl` to `UrlMapping`
- `UrlRedirectController` detects crawlers (reuse `BotDetectionService.detect()` with `BotCategory.SOCIAL_PREVIEW`) and returns an HTML page with OG meta tags; a `<meta http-equiv="refresh">` redirects real browsers immediately
- **Touches:** `UrlMapping`, `UrlRedirectController`, `BotDetectionService`, `ShortenUrlRequest`
- **Effort:** M

#### C2. AI-Generated Memorable Slugs
Offer LLM-generated, human-readable slug suggestions instead of the CRC32 hash.

- Server fetches the destination page's `<title>` tag, sends it to Claude API (`claude-haiku-4-5-20251001` for cost), asks for 3 slug options ≤ 8 chars
- New endpoint `POST /api/v1/urls/suggest-slug` returns the suggestions; user picks one and passes it as `customAlias`
- Existing alias validation in `UrlManagementService.validateCustomAlias()` still applies
- **Touches:** new `SlugSuggestionService`, `UrlController`, no changes to core `UrlMapping`
- **Effort:** M

#### C3. Link-in-Bio / Micro Landing Page
One short link hosts a curated list of links (similar to Linktree).

- New MongoDB collection `bio_pages` with `slug`, `displayName`, `links: List<BioLink>`, `theme`
- Served as a server-side-rendered HTML page at `/{slug}` — `UrlRedirectController` checks `bio_pages` first when no `url_mappings` entry matches
- Each `BioLink` click is tracked as a `LINK_CLICK` event in `url_visit_events`
- **Touches:** new `BioPage` entity + controller + service, `UrlRedirectController` routing order
- **Effort:** L

---

### Group D — Security & Auth

#### D1. Two-Factor Authentication (TOTP)
TOTP-based 2FA for user accounts.

- Generate a TOTP secret; store encrypted on `UserAccountDocument`
- Display QR code for authenticator apps at account setup
- `AuthService.signIn()` gains a second step: if 2FA is enabled, return a `PENDING_2FA` status and require a `POST /api/v1/auth/verify-totp` before issuing the JWT
- Recovery codes (8, one-time-use) stored as BCrypt hashes
- **Touches:** `UserAccountDocument`, `AuthService`, `AuthController`, `JwtTokenProvider`
- **Effort:** L

#### D2. Audit Log
Immutable per-account record of all write operations for compliance.

- New MongoDB collection `audit_events` (no delete endpoint, TTL configurable)
- Events: `URL_CREATED`, `URL_DELETED`, `URL_UPDATED`, `PASSWORD_CHANGED`, `PROFILE_UPDATED`, `API_KEY_CREATED`, `2FA_ENABLED`
- Spring AOP `@Around` advice on service methods is cleaner than sprinkling log calls everywhere
- Paginated read endpoint; CSV export reuses `AnalyticsCsvExportService` pattern
- **Touches:** new `AuditEvent` entity + `AuditLogService` + `AuditController`; AOP config
- **Effort:** M

#### D3. Account Deletion & Data Export (GDPR)
Let users permanently delete their account or download all their data.

- `DELETE /api/v1/users/me` hard-deletes the `UserAccountDocument` and nulls `userId` on all owned `UrlMapping` documents (links become anonymous, not deleted)
- `GET /api/v1/users/me/export` streams a ZIP of: profile JSON, all `UrlMapping` records, analytics CSV — assembled on the fly, never written to disk
- **Touches:** `UserAccountService`, `UrlRepository`, new `DataExportService`
- **Effort:** M

---

### Group E — Integrations & Ecosystem

#### E1. Public REST API with API Keys
Scoped, long-lived API keys for programmatic access without session JWT.

- New collection `api_keys`: `name`, `keyHash` (SHA-256), `scopes: Set<Scope>`, `userId`, `createdAt`, `lastUsedAt`, `expiresAt?`
- `JwtAuthenticationFilter` gains a secondary path: if `Authorization: ApiKey <key>` header, hash it, look up the record, resolve the user
- Separate Bucket4j bucket per key ID (`RateLimitedRoute.API_KEY`) with quota set on the key record
- Scopes: `urls:read`, `urls:write`, `analytics:read`
- **Touches:** new `ApiKey` entity + `ApiKeyController` + `ApiKeyService`; `JwtAuthenticationFilter`; `RateLimitConfig`
- **Effort:** L

#### E2. Webhooks on Click
Fire an HTTP POST to a user-configured endpoint each time a short link is clicked.

- `WebhookConfig` embedded on `UrlMapping` (or per-account): `url`, `secret` (HMAC-SHA256 signature header), `enabled`
- `TrackUrlVisitService` dispatches an async call after the event is persisted; payload mirrors `UrlVisitEvent` fields
- Retry: exponential back-off × 3; failures logged to a `webhook_delivery_log` collection (inspectable by the user)
- **Touches:** `UrlMapping`, `TrackUrlVisitService`, new `WebhookDeliveryService`
- **Effort:** M

#### E3. Rate Limit Response Headers
Expose `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` on every API response.

- `RateLimitFilter` already holds the bucket after the token check; attach remaining tokens and reset time to `HttpServletResponse`
- Helps API consumers implement back-off without guessing
- **Touches:** `RateLimitFilter`, `RateLimitPolicy`
- **Effort:** S

#### E4. Slack / Teams Bot
Shorten URLs directly from a chat message.

- Slack slash command `/shorten <url>` calls `POST /api/v1/urls` using a workspace-level API key (feature E1)
- OAuth flow to link a Slack workspace to a Shorty account
- Bot posts a follow-up after 24 h with click count
- **Touches:** new Slack OAuth controller; reuses `UrlManagementService` and API keys
- **Effort:** L

#### E5. Browser Extension
One-click shortening from any browser tab.

- Chrome/Firefox WebExtension; stores JWT (or API key) in extension storage
- Communicates with the existing `POST /api/v1/urls` endpoint
- Popup shows the short link with a copy button and recent links list
- **Touches:** no backend changes needed (uses existing API); separate release artifact
- **Effort:** M

---

### Group F — Collaboration

#### F1. Tags
Organise links into user-defined tags for filtering and bulk operations.

- Add `tags: List<String>` to `UrlMapping` with a MongoDB index on `{userId, tags}`
- `GET /api/v1/urls?tag=marketing` filters the paginated list
- Bulk-tag selected links from the URL management page; export by tag to CSV
- **Touches:** `UrlMapping`, `UrlRepository`, `UrlManagementService`, `UrlController`
- **Effort:** S

#### F2. Link Health Monitoring
Detect and alert when a destination URL returns non-2xx responses.

- Daily scheduled job (companion to `UrlExpirationTimeDeletionScheduler`) checks all active links using `WebClient` (non-blocking)
- Add `isDestinationHealthy: Boolean` + `lastHealthCheckedAt: Instant?` to `UrlMapping`
- On first failure: email the owner; on recovery: clear the flag and send a recovery email
- Broken links shown with a warning badge in the URL management UI
- **Touches:** `UrlMapping`, new `LinkHealthScheduler`, `UrlRepository`
- **Effort:** M

#### F3. In-App Notification Center
Surface alerts (broken link detected, click cap reached, link expiring soon) without email.

- New collection `notifications`: `userId`, `type`, `payload`, `readAt?`, `createdAt`
- `GET /api/v1/notifications` paginated; `PATCH /api/v1/notifications/{id}/read`
- Bell icon in `LayoutHeader` with unread count badge; polling or SSE
- **Touches:** new `Notification` entity + controller + service; `LayoutHeader`
- **Effort:** M

#### F4. Teams & Workspaces
Share a link library across multiple users with role-based access.

- New `Workspace` document; `UrlMapping` gains `workspaceId?` alongside `userId`
- Roles: `OWNER`, `EDITOR`, `VIEWER` — stored in a `WorkspaceMember` join document
- `UrlMappingAccessService` checks workspace membership before ownership
- Invite by email; transfer ownership
- **Touches:** new entities; `UrlMappingAccessService`; `SecurityConfig`; large frontend surface
- **Effort:** XL

---

### Group G — Platform & Infrastructure

#### G1. Redis Distributed Cache
Replace Caffeine with Redis so the service scales horizontally beyond a single node.

- Swap `CacheConfig` from `CaffeineCacheManager` to `RedisCacheManager`; connection via `spring-boot-starter-data-redis`
- Cache serialisation: JSON (not Java serialisation) to survive rolling deploys
- `UrlMappingAccessService` cache annotations remain unchanged — Spring Cache abstraction handles the swap
- Add Redis to `docker-compose.yml`
- **Touches:** `CacheConfig`, `docker-compose.yml`, `application.yml`
- **Effort:** S

#### G2. OpenTelemetry Metrics & Tracing
Structured metrics and distributed traces for operational visibility.

- Add `micrometer-tracing-bridge-otel` and export to OTLP collector
- `CorrelationIdFilter` already sets `correlationId` in MDC — promote it to an OTel span attribute
- Key counters: `urls_created_total`, `redirects_total{bot,human}`, `analytics_events_total`, `webhook_delivery_failures_total`
- Grafana dashboard template committed to `docs/grafana/`
- **Touches:** `build.gradle.kts`, `CorrelationIdFilter`, `TrackUrlVisitService`, new `MetricsConfig`
- **Effort:** M

#### G3. Custom Domains (Bring Your Own Domain)
Users short-link under their own domain (e.g., `go.acme.com/abc`).

- New `CustomDomain` document: `domain`, `userId`, `verified: Boolean`, `verificationToken`
- `UrlRedirectController` resolves `Host` header → owning user; generates `shortUrl` using that domain
- Wildcard TLS via Let's Encrypt / cert-manager (infrastructure concern outside the app)
- DNS verification: user adds a `TXT` record; a scheduled job polls for it
- **Touches:** new `CustomDomain` entity + controller; `UrlRedirectController`; `UrlManagementService`
- **Effort:** XL

#### G4. Subscription Tiers (Stripe)
Enforce feature quotas per plan.

| Tier | Links | Analytics retention | Custom domains | API keys | Webhooks |
|---|---|---|---|---|---|
| Free | 50 | 90 days | — | — | — |
| Pro | Unlimited | 1 year | 1 | 5 | 5 |
| Team | Unlimited | 2 years | 5 | 20 | Unlimited |

- `UserAccountDocument` gains `plan: Plan` and `stripeCustomerId`
- Quota checks enforced in `UrlManagementService.shorten()` (link count), `ApiKeyService`, `WebhookService`
- Stripe webhook handler updates plan on `customer.subscription.updated` events
- **Touches:** `UserAccountDocument`, `UrlManagementService`, new `SubscriptionService`; large frontend billing surface
- **Effort:** XL

---

## Prioritization

Effort key: **S** = 1–3 days, **M** = 1–2 weeks, **L** = 3–6 weeks, **XL** = 2+ months

| Priority | ID | Feature | Effort | Rationale |
|---|---|---|---|---|
| **High** | gap | QR code generation | S | Tracking scans without generating codes is a broken UX |
| **High** | gap | Extend `UpdateUrlRequest` (expiry + alias) | S | Users cannot fix mistakes after creation |
| **High** | gap | Full-text search on URL management page | S | Usability cliff once a user has more than ~20 links |
| **High** | gap | Configurable analytics retention | S | 90-day hardcode is a hidden limitation |
| **High** | A2 | Link expiry by click cap | S | Small model change, clear use-case (invite links) |
| **High** | A3 | Scheduled link activation | S | Reuses existing expiry pattern |
| **High** | F1 | Tags | S | Needed once users accumulate links |
| **High** | B1 | UTM parameter builder | S+S | Pure product value, no infra risk |
| **High** | E3 | Rate limit response headers | S | API usability; touches only `RateLimitFilter` |
| **Medium** | A1 | Password-protected links | M | High value; interstitial page is self-contained |
| **Medium** | gap | Anonymous link claim | M | Acquisition: guest users lose their links |
| **Medium** | gap | Bulk URL import (CSV) | M | Power-user workflow |
| **Medium** | B4 | Click-time heatmap | M | No new data; new query + UI component |
| **Medium** | C1 | OG / link preview override | M | High perceived value for social sharing |
| **Medium** | D2 | Audit log | M | Compliance; AOP approach keeps it non-invasive |
| **Medium** | D3 | Account deletion / data export | M | GDPR obligation |
| **Medium** | E2 | Webhooks on click | M | Opens integration ecosystem |
| **Medium** | F2 | Link health monitoring | M | Reuses scheduler pattern; ops value |
| **Medium** | F3 | In-app notification center | M | Needed to surface health + cap alerts |
| **Medium** | G1 | Redis distributed cache | S | Prerequisite for horizontal scaling |
| **Medium** | G2 | OpenTelemetry metrics & tracing | M | Ops visibility; no user-facing risk |
| **Medium** | C2 | AI-generated slugs | M | Memorable links; Claude Haiku keeps cost low |
| **Medium** | E1 | Public API with API keys | L | Unlocks integrations and power users |
| **Low** | A4 | Smart redirects (geo/device) | M | Valuable but niche; adds model complexity |
| **Low** | A5 | A/B split testing | L | Extends analytics; broader model change |
| **Low** | B2 | Conversion goals / pixel | M | Requires destination page cooperation |
| **Low** | B3 | Configurable per-user retention | M | Needs billing tier first |
| **Low** | D1 | 2FA / TOTP | L | Auth complexity; low early demand |
| **Low** | C3 | Link-in-bio page | L | Separate product surface |
| **Low** | E4 | Slack / Teams bot | L | Needs API keys first; separate OAuth app |
| **Low** | E5 | Browser extension | M | Separate release artifact |
| **Low** | F4 | Teams & workspaces | XL | Large data model change; multi-quarter effort |
| **Low** | G3 | Custom domains | XL | Infrastructure complexity (DNS, TLS) |
| **Low** | G4 | Subscription tiers | XL | Billing infra; plan-gates most other features |

---

## Suggested Quarterly Roadmap

### Q1 — Foundation
Close all gaps, deliver quick-win features users are already missing.
- QR code generation
- Extend `UpdateUrlRequest` (expiry + alias change)
- Full-text search on URL management page
- Link expiry by click cap (A2)
- Scheduled link activation (A3)
- Tags (F1)
- Configurable analytics retention (B3 config side)
- Rate limit response headers (E3)

### Q2 — Control & Insights
Give users richer link behaviour and analytics depth.
- UTM parameter builder (B1)
- Password-protected links (A1)
- Anonymous link claim
- Click-time heatmap (B4)
- OG / link preview override (C1)
- In-app notification center (F3)
- Link health monitoring (F2)
- Redis distributed cache (G1)

### Q3 — Platform & Ecosystem
Open the API, improve ops, and start integrations.
- Public API with API keys (E1)
- Webhooks on click (E2)
- Audit log (D2)
- Account deletion / data export — GDPR (D3)
- OpenTelemetry metrics & tracing (G2)
- AI-generated slugs (C2)
- Bulk URL import (gap)

### Q4 — Growth & Monetisation
Lay the foundation for team and commercial use.
- Subscription tiers / Stripe (G4) — prerequisite for gating below
- Smart redirects / A/B testing (A4, A5)
- Teams & workspaces (F4) — begins
- 2FA / TOTP (D1)
- Conversion goals / pixel (B2)
- Browser extension (E5)

---

## Won't Do (and Why)

| Feature | Reason |
|---|---|
| Desktop / mobile app | The web app + browser extension covers the use-case; native apps are a separate product team investment |
| URL shortening for internal/private IPs | `UrlValidator` already blocks loopback; extending to RFC-1918 blocks is a security rule, not a feature |
| Click fraud marketplace | The bot detection already filters analytics; an adversarial arms-race is out of scope |
| Self-hosted on-premise edition | Docker Compose already supports local deployment; a separate enterprise packaging track is a business decision, not an engineering feature |
