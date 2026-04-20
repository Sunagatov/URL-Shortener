# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Run locally (MongoDB must be running)
docker compose up -d mongo
./gradlew bootRun

# Run everything in Docker
docker compose up -d --build

# Build JAR
./gradlew bootJar

# Run tests
./gradlew test

# Run a single test class
./gradlew test --tests "com.zufar.urlshortener.SomeTest"

# SonarCloud analysis (requires SHORTY_URL_SONAR_TOKEN env var)
./gradlew sonarqube
```

> **Note:** The Kotlin Gradle plugin requires Java 21. Running with Java 25 causes a version-parsing error at Gradle startup — use `JAVA_HOME` to point at a Java 21 JDK.

## Local Setup

Copy `.env` and fill in required values before running:

```
JWT_SECRET=<min 256-bit secret>
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=urlshortener
SERVER_BASE_URL=http://localhost:8080
```

Swagger UI: `http://localhost:8080/api/v1/swagger-ui`

## Architecture

### Package Layout

```
com.zufar.urlshortener/
├── auth/          # JWT auth: sign-up, sign-in, token refresh
├── shorten/       # URL shortening domain: create, redirect, delete, list
└── common/        # Cross-cutting: SecurityConfig, CorsConfig, CacheConfig,
                   #   RateLimitConfig, RateLimitFilter, GlobalExceptionHandler
```

### Request Flow

**Shorten a URL (`POST /api/v1/urls`):**
`UrlController` → `UrlShortener` (validates, encodes, checks for existing, saves) → `UrlRepository` (MongoDB). Result is cached in Caffeine under key `originalUrl`.

**Redirect (`GET /url/{urlHash}`):**
`UrlRedirectController` → `UrlMappingProvider` → `UrlRepository`. Returns HTTP 302. No auth required.

**Auth:**
`AuthController` → `AuthRequestValidator` → `UserRepository` → `JwtTokenProvider`. JWT filter (`JwtAuthenticationFilter`) runs before `UsernamePasswordAuthenticationFilter` on every request.

### Key Design Decisions

**URL hashing:** `StringEncoder` (companion object, not a Spring bean) applies CRC32 to the original URL, then Base58-encodes the result. The hash is the MongoDB `_id` — so two identical URLs always produce the same hash and the same short link.

**Cache:** Caffeine, named `urlMappings` (key = `originalUrl`) and `userDetails`. Cache is evicted entirely (`allEntries = true`) on URL deletion to avoid stale entries after re-creation.

**Rate limiting:** Bucket4j `ConcurrentHashMap<IP, Bucket>` in `RateLimitFilter` (`@Order(1)`). Per-IP, 100 req/min default. Buckets are created lazily.

**URL expiration:** `UrlExpirationTimeDeletionScheduler` runs a single `deleteAllByExpirationDateBefore(now)` MongoDB query daily at midnight (no in-memory load).

**Public vs. authenticated endpoints:**
- Public: `POST /api/v1/urls`, `GET /url/{hash}`, `/api/v1/auth/**`, `/api/v1/health`, Swagger paths
- Authenticated (JWT required): `GET/DELETE /api/v1/urls/**`, `GET /api/v1/users`

### MongoDB Collections

| Collection     | Entity        | Key Fields                                      |
|----------------|---------------|-------------------------------------------------|
| `url_mappings` | `UrlMapping`  | `urlHash` (PK), `originalUrl`, `expirationDate`, `userId` |
| `user_details` | `UserDetails` | `id`, `email` (unique), `password` (BCrypt)     |

### Validation

- `AuthRequestValidator` — orchestrates sign-up/sign-in field validation
- `EmailOfUserValidator` — format + max 64 chars (commons-validator)
- `PasswordOfUserValidator` — min 8, max 50, requires upper + lower + digit, no spaces
- `UrlValidator` — http/https only, max 2048 chars, blocks loopback addresses
- `DaysCountValidator` — 1–365, nullable (defaults to 365 in entity creator)

All validators throw `InvalidRequestException` → caught by `GlobalExceptionHandler` → 400.

### Error Handling

`GlobalExceptionHandler` (`@ControllerAdvice`) maps domain exceptions to HTTP status codes:
- `InvalidRequestException` / `IllegalArgumentException` → 400
- `UrlNotFoundException` → 404
- `EmailAlreadyExistsException` → 409
- `InvalidTokenException` / `BadCredentialsException` → 401
- `Exception` → 500

Response body: `ErrorResponse { errorMessage: String }`.

### Correlation IDs

`CorrelationIdFilter` generates a UUID per request, stores it in MDC (`correlationId`), and returns it as `X-Correlation-ID` response header. All log lines include it via the Logback pattern.
