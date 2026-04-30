# Rate Limiting Modernization Plan

## Goal

Replace the current one-size-fits-all in-memory rate limiter with a clearer, safer, more observable setup that stays simple:

- no vendor lock-in
- no Redis dependency for this project stage
- no giant policy engine
- strong defaults with env overrides
- useful logs, metrics, and response headers

## Current Issues

- only one global `requests per minute` limit
- public and authenticated traffic share the same shaping model
- limiter keys only by client IP
- `Retry-After` is hardcoded to `60`
- no rate-limit response metadata beyond `errorMessage`
- no dedicated metrics for accepted vs blocked requests
- bypass rules are hardcoded inside the filter

## Design

### Traffic policies

Use a small set of explicit policies instead of per-endpoint micro-configuration:

1. `auth`
   - applies to `/api/v1/auth/**`
   - keyed by client IP
   - lower threshold to slow brute-force and credential stuffing

2. `public_create`
   - applies to `POST /api/v1/urls`
   - keyed by client IP
   - protects public URL creation from abuse

3. `public_redirect`
   - applies to public short-link redirects
   - keyed by client IP
   - threshold is higher than write/auth flows

4. `frontend_logs`
   - applies to `POST /api/v1/frontend/logs`
   - keyed by client IP
   - prevents client log spam from overwhelming the backend

5. `authenticated_api`
   - applies to authenticated application API traffic
   - keyed by authenticated `userId` when available, otherwise by client IP
   - avoids one office/public IP throttling many different signed-in users together

### Keying strategy

- authenticated request: `user:{userId}`
- unauthenticated request: `ip:{resolvedClientIp}`

This keeps the logic simple and materially better than IP-only limiting.

### Storage

Keep in-memory Bucket4j + Caffeine for now:

- fast
- no extra infrastructure
- good enough for current project scale

Expose cache sizing and expiry via env so it can be tuned without code changes.

## Response Behavior

### Headers

For matched requests, return:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

When blocked, also return:

- `Retry-After`

### Error body

429 responses should remain backward-compatible with the existing `errorMessage` field while adding useful metadata:

```json
{
  "errorMessage": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "status": 429,
  "path": "/api/v1/urls",
  "requestId": "....",
  "timestamp": "2026-04-30T12:34:56Z",
  "retryAfterSeconds": 18
}
```

## Logging

Add dedicated event-style logs:

- `rate_limit.exceeded`
- `rate_limit.response_headers_applied`

Log fields:

- policy
- method
- path
- key type
- subject
- client IP
- retry-after seconds
- request id

Do not log on every successful token consumption at `INFO`; that would be noise. Successful consumption should be monitored through metrics and response headers, not chatty logs.

## Monitoring

Expose Prometheus/Micrometer counters:

- `rate_limit_requests_total{policy,outcome}`
  - outcomes: `allowed`, `blocked`

Also expose a bucket cache size gauge:

- `rate_limit_bucket_cache_size`

## Configuration

Keep config env-driven but deliberately small.

### Global

- `RATE_LIMIT_ENABLED`
- `RATE_LIMIT_TRUSTED_PROXIES`
- `RATE_LIMIT_BUCKET_CACHE_MAX_SIZE`
- `RATE_LIMIT_BUCKET_CACHE_EXPIRE_MINUTES`

### Policy-specific

Per policy:

- `*_CAPACITY`
- `*_REFILL_TOKENS`
- `*_REFILL_MINUTES`

Policies:

- `RATE_LIMIT_AUTH_*`
- `RATE_LIMIT_PUBLIC_CREATE_*`
- `RATE_LIMIT_PUBLIC_REDIRECT_*`
- `RATE_LIMIT_FRONTEND_LOGS_*`
- `RATE_LIMIT_AUTHENTICATED_API_*`

## Frontend

Only add what has clear UX value:

- understand 429 payload metadata
- surface a friendlier retry message when `retryAfterSeconds` is present
- log a dedicated `frontend.api.rate_limited` event

Do not add client-side throttling logic for every endpoint. The backend remains the source of truth.

## Implementation Steps

1. Replace the old flat rate-limit config with grouped `@ConfigurationProperties`.
2. Introduce a small policy model and route matching in the backend.
3. Add modern response headers and dynamic `Retry-After`.
4. Expand the shared error payload to support structured 429 responses.
5. Add dedicated rate-limit metrics and logs.
6. Update frontend API error parsing and rate-limit UX messaging.
7. Update docs and env samples.
8. Verify with tests.

## Non-Goals

- Redis/distributed rate limiting
- admin UI for rate limits
- dynamic policy editing at runtime
- dozens of special-case endpoint policies
