# Abuse safeguards

URL creation allowances use atomic MongoDB reservations over a rolling 24-hour
window. They survive restarts and are independent of URL deletion and expiry.
Reservations count attempts: failed aliases or a later rejected quota do not
refund earlier reservations. Short-code collision retries reserve only once.

| Setting | Default |
| --- | --- |
| `APP_URLS_PROTECTION_GLOBAL_DAILY_QUOTA` | 2000 |
| `APP_URLS_PROTECTION_ANONYMOUS_DAILY_QUOTA` | 25 per IP |
| `APP_URLS_PROTECTION_AUTHENTICATED_DAILY_QUOTA` | 250 per account |
| `APP_URLS_PROTECTION_DESTINATION_HOST_DAILY_QUOTA` | 500 per destination host |

Changing a destination host also reserves global and destination allowance.
Changing only its path does not. Set the global allowance to `0` to pause new
creations and host changes. Database failure returns `503`; exhausted allowance
returns `429`. Quota buckets expire after their admission history is no longer
needed. These controls bound usage, not the database provider's billing total.

Public abuse reports have one persistent vote per reporter IP and short link.
Reports can add a warning and request review; only an authorized moderator can
permanently disable a link. Destination edits preserve report-based warnings.

`RATE_LIMIT_TRUSTED_PROXIES` accepts literal proxy IPs/CIDRs.
`RATE_LIMIT_TRUSTED_PROXY_HOSTS` accepts operator-owned internal proxy DNS names,
with a short address cache for container replacement. Forwarded IPs are validated
as literals and processed from the trusted end of the chain. Production proxy
configuration belongs in Vault.

When Turnstile is enabled, configure `TURNSTILE_SECRET_KEY` and
`TURNSTILE_EXPECTED_HOSTNAMES`; the backend checks both hostname and action.
Frontend protection flags and its public site key must match at build time.
Email verification separately requires working SMTP delivery.

Analytics uses `APP_ANALYTICS_TRACKING_WORKERS=2`,
`APP_ANALYTICS_TRACKING_QUEUE_CAPACITY=100` and
`APP_ANALYTICS_TRACKING_EVENTS_PER_MINUTE=60` by default. These limits apply
across users within each backend process. Excess work is dropped before
enrichment, including when the queue is full; redirects continue normally.
Visit counters therefore represent accepted analytics, not every request under
overload. Monitor `analytics.tracking.dropped`.

`LOG_TOTAL_SIZE_CAP=100MB` bounds each application/frontend archive stream.
Docker log retention and container CPU/memory/process limits belong in Vault.

## Verification

Run `./gradlew test`. To include real MongoDB concurrency and persistence checks,
set `URL_SHORTENER_TEST_MONGO_URI=mongodb://127.0.0.1:27083` to a disposable local
MongoDB with no database name. Tests create and remove their own uniquely named
test databases; non-loopback endpoints are rejected.
