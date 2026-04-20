# 01 — Architecture Map

## Stack snapshot
- Kotlin JVM application
- Java 21 toolchain
- Spring Boot web application
- MongoDB persistence
- JWT-based authentication
- Caffeine caching
- Rate limiting
- Actuator + Prometheus
- OpenAPI / Swagger UI
- Scheduled tasks enabled

## Module layout
The README documents this package layout:
- `auth/` — JWT, sign up, sign in
- `common/` — shared configuration such as CORS, cache, rate limit, security
- `shorten/` — URL shortening domain, controller, service, repository, DTO
- `user/` — user management

## Main application entrypoint
- `src/main/kotlin/com/zufar/urlshortener/UrlShortenerApplication.kt`
- Scheduling is enabled, so background cleanup or maintenance behavior may exist.

## Runtime configuration surfaces
### Build and library versions
Use `build.gradle.kts` as the dependency source of truth.

### Application runtime defaults
Use `src/main/resources/application.properties` as the behavior source of truth.

### Local development infra
Use `docker-compose.yml` for local MongoDB and containerized app setup.

## Operational areas
### Security
- JWT secret and token expirations are env-driven.
- Spring Security is present.

### Cache
- Caffeine-backed cache is enabled.
- Cache names are configured in properties.

### Rate limit
- Request limit per IP is configured in properties.

### Metrics / observability
- Actuator endpoints are exposed.
- Prometheus registry is enabled.

### Scheduling
- A URL expiration scheduler cron is configured.

## Known doc/runtime drift
Treat these as important:
- README prose, feature docs, and runtime config do not fully agree on every default.
- If a bug report mentions “expected” behavior, confirm in runtime properties before changing code.
