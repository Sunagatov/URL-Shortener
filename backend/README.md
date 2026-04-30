<div style="text-align: center;">
  <br>
  <h1>🔗 URL Shortener Backend</h1>
  <p><strong>A Kotlin + Spring Boot backend for URL shortening — fast, secure, and scalable.</strong></p>
  <p>
    <a href="https://t.me/zufarexplained">💬 Community</a> ·
    <a href="http://116.203.197.65:3000/">🚀 Live Demo</a> ·
    <a href="https://github.com/Sunagatov/URL-Shortener/issues?q=is%3Aopen+label%3A%22good+first+issue%22">🟢 Good First Issues</a> ·
    <a href="https://github.com/Sunagatov/URL-Shortener/issues">🐛 Issues</a>
  </p>

  [![License: CC BY-NC 4.0](https://img.shields.io/badge/license-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
  [![GitHub Stars](https://img.shields.io/github/stars/Sunagatov/URL-Shortener)](https://github.com/Sunagatov/URL-Shortener/stargazers)
  [![GitHub Forks](https://img.shields.io/github/forks/Sunagatov/URL-Shortener?style=social)](https://github.com/Sunagatov/URL-Shortener/network/members)
  [![Contributors](https://img.shields.io/github/contributors/Sunagatov/URL-Shortener)](https://github.com/Sunagatov/URL-Shortener/graphs/contributors)
  [![Docker Pulls](https://img.shields.io/docker/pulls/zufarexplainedit/url-shortener.svg)](https://hub.docker.com/r/zufarexplainedit/url-shortener/)
</div>

---

## 🚀 Quick Start

**📋 Prerequisites:** Java 21+, Gradle 8.5+, MongoDB 7+, Docker Desktop

```bash
# 1. 📥 Clone
git clone https://github.com/Sunagatov/URL-Shortener.git && cd URL-Shortener

# 2. 📂 Enter the backend module
cd backend

# 3. 🔧 Fill in your local credentials
cp .env.example .env.local
# edit JWT_SECRET and MONGODB_URI in .env.local
```

> ⚠️ **Never commit real credentials.** `.env.example` is a tracked sample. `.env.local` is ignored and auto-imported for local startup.

---

### Option A — IntelliJ + infra in Docker *(recommended for development)*

```bash
# Start only MongoDB
docker compose up -d mongo
```

Then run the app from IntelliJ or terminal:

```bash
./gradlew bootRun
```

Spring Boot auto-imports `.env.local` for local startup, so exporting those variables manually is not required.

---

### Option B — Everything in Docker

Docker also reads `.env.local` for local secrets and app config. Edit `.env.local` for local values; Compose overrides only the Mongo host inside the app container so it connects to `mongo` instead of `localhost`.

```bash
docker compose up -d --build
```

From the monorepo root, use:

```bash
docker compose up -d --build
```

**Production:**
```bash
# Fill in .env.prod, then:
docker compose -f docker-compose.prod.yml up -d --build
```

---

**🧪 Run the tests:**
```bash
./gradlew test
```

---

## 🤔 What is this?

URL Shortener Backend is a REST API that generates short URLs from long ones, handles redirects, and manages user authentication with JWT tokens. Built with Kotlin and Spring Boot, it features caching, rate limiting, and MongoDB for storage.

---

## 🛠️ Tech Stack

| 📂 Category | 🔧 Technology |
|---|---|
| 💻 Language | Kotlin 2.1 |
| ☕ JVM | Java 21 (LTS) |
| 🏗️ Framework | Spring Boot 3.5, Spring Security, Spring Actuator |
| 🗄️ Database | MongoDB 7 |
| 🔐 Auth | JWT (access + refresh tokens) |
| ⚡ Caching | Caffeine (1 hour TTL) |
| 🚦 Rate Limiting | Custom filter (100 req/min per IP) |
| 🧪 Testing | JUnit 5, Spring Boot Test, Mockito |
| 📝 API Docs | OpenAPI 3 (Scalar) |
| 🚢 Deployment | Docker (multi-stage build) |

---

## ✨ Features

| Feature | Description | Spec |
|---|---|---|
| 🔐 **Sign Up** | User registration with email/password and 6-digit email verification | [docs/features/auth-signup.md](docs/features/auth-signup.md) |
| 🔑 **Sign In** | Authentication with credentials, token generation | [docs/features/auth-signin.md](docs/features/auth-signin.md) |
| 🔄 **Token Refresh** | Refresh access tokens without re-authentication | [docs/features/auth-refresh-token.md](docs/features/auth-refresh-token.md) |
| 🔗 **Shorten URL** | Generate short URLs with optional expiration | [docs/features/url-shorten.md](docs/features/url-shorten.md) |
| ↗️ **URL Redirect** | Fast 302 redirects with caching and analytics | [docs/features/url-redirect.md](docs/features/url-redirect.md) |

> Each feature has a comprehensive spec covering user stories, functional requirements, API endpoints, data models, security, and acceptance criteria.

---

## 📁 Project Structure

```
src/main/kotlin/com/zufar/urlshortener/
├── auth/                # Authentication (JWT, sign up, sign in)
├── common/              # Shared config (CORS, cache, rate limit, security)
├── shorten/             # URL shortening domain
│   ├── controller/      # REST endpoints
│   ├── service/         # Business logic
│   ├── repository/      # MongoDB repositories
│   └── dto/             # Request/response models
└── user/                # User management
```

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ | Secret key for JWT signing (min 256 bits) |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `MONGODB_DATABASE_NAME` | ❌ | Optional. Defaults to `urlshortener`. Legacy `MONGODB_DATABASE` is also supported. |
| `SERVER_BASE_URL` | ❌ | Defaults to `http://localhost:8080` |
| `SERVER_PORT` | ❌ | Defaults to `8080` |
| `APP_AUTH_EMAIL_VERIFICATION_ENABLED` | ❌ | Defaults to `false` |
| `APP_AUTH_EMAIL_VERIFICATION_EXPIRATION_MINUTES` | ❌ | Defaults to `10` |
| `APP_AUTH_EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS` | ❌ | Defaults to `60` |
| `APP_AUTH_EMAIL_VERIFICATION_MAIL_FROM` | ❌ | Defaults to `noreply@shorty.local` |
| `MAIL_HOST` | ❌ | Defaults to `smtp.postmarkapp.com` for Postmark SMTP |
| `MAIL_PORT` | ❌ | Defaults to `587` |
| `MAIL_USERNAME` | ❌ | Postmark SMTP username |
| `MAIL_PASSWORD` | ❌ | Postmark SMTP password |
| `MAIL_SMTP_AUTH` | ❌ | Defaults to `true` |
| `MAIL_SMTP_STARTTLS_ENABLE` | ❌ | Defaults to `true` |
| `APP_URLS_EXPIRATION_DEFAULT_DAYS` | ❌ | Defaults to `365` |
| `APP_URLS_EXPIRATION_MAX_DAYS` | ❌ | Defaults to `365` |
| `APP_URLS_SHORT_CODE_MAX_GENERATION_ATTEMPTS` | ❌ | Defaults to `10` |
| `APP_URLS_PAGINATION_DEFAULT_PAGE` | ❌ | Defaults to `0` |
| `APP_URLS_PAGINATION_DEFAULT_SIZE` | ❌ | Defaults to `10` |
| `APP_URLS_PAGINATION_MAX_SIZE` | ❌ | Defaults to `100` |
| `APP_URLS_REDIRECT_MAX_CACHE_SECONDS` | ❌ | Defaults to `3600` |
| `CORS_ALLOWED_ORIGINS` | ❌ | Defaults to `http://localhost:3000` |
| `RATE_LIMIT_ENABLED` | ❌ | Defaults to `true` |
| `RATE_LIMIT_TRUSTED_PROXIES` | ❌ | Comma-separated trusted proxy CIDRs/IPs for `X-Forwarded-For` handling |
| `RATE_LIMIT_BUCKET_CACHE_MAX_SIZE` | ❌ | Defaults to `100000` |
| `RATE_LIMIT_BUCKET_CACHE_EXPIRE_MINUTES` | ❌ | Defaults to `10` |
| `RATE_LIMIT_AUTH_CAPACITY` | ❌ | Defaults to `20` |
| `RATE_LIMIT_AUTH_REFILL_TOKENS` | ❌ | Defaults to `20` |
| `RATE_LIMIT_AUTH_REFILL_MINUTES` | ❌ | Defaults to `1` |
| `RATE_LIMIT_PUBLIC_CREATE_CAPACITY` | ❌ | Defaults to `30` |
| `RATE_LIMIT_PUBLIC_CREATE_REFILL_TOKENS` | ❌ | Defaults to `30` |
| `RATE_LIMIT_PUBLIC_CREATE_REFILL_MINUTES` | ❌ | Defaults to `1` |
| `RATE_LIMIT_PUBLIC_REDIRECT_CAPACITY` | ❌ | Defaults to `240` |
| `RATE_LIMIT_PUBLIC_REDIRECT_REFILL_TOKENS` | ❌ | Defaults to `240` |
| `RATE_LIMIT_PUBLIC_REDIRECT_REFILL_MINUTES` | ❌ | Defaults to `1` |
| `RATE_LIMIT_FRONTEND_LOGS_CAPACITY` | ❌ | Defaults to `30` |
| `RATE_LIMIT_FRONTEND_LOGS_REFILL_TOKENS` | ❌ | Defaults to `30` |
| `RATE_LIMIT_FRONTEND_LOGS_REFILL_MINUTES` | ❌ | Defaults to `1` |
| `RATE_LIMIT_AUTHENTICATED_API_CAPACITY` | ❌ | Defaults to `120` |
| `RATE_LIMIT_AUTHENTICATED_API_REFILL_TOKENS` | ❌ | Defaults to `120` |
| `RATE_LIMIT_AUTHENTICATED_API_REFILL_MINUTES` | ❌ | Defaults to `1` |
| `CACHE_MAX_SIZE` | ❌ | Defaults to `10000` |
| `CACHE_EXPIRE_MINUTES` | ❌ | Defaults to `30` |
| `CACHE_NAMES` | ❌ | Defaults to `urlMappings` |
| `LOG_LEVEL_ROOT` | ❌ | Defaults to `WARN` |
| `LOG_LEVEL_APP` | ❌ | Defaults to `INFO` |
| `LOG_LEVEL_HTTP_ACCESS` | ❌ | Defaults to `INFO` |
| `LOG_SLOW_REQUEST_THRESHOLD_MS` | ❌ | Defaults to `1000` |
| `LOG_MAX_FILE_SIZE` | ❌ | Defaults to `10MB` |
| `LOG_MAX_HISTORY` | ❌ | Defaults to `30` |

See `.env.example` for local defaults and `.env.prod` for the production template.

Rate limiting is policy-based rather than global:

- `auth`: public auth endpoints, keyed by client IP
- `public_create`: `POST /api/v1/urls`, keyed by client IP
- `public_redirect`: short-link redirects, keyed by client IP
- `frontend_logs`: browser log ingestion, keyed by client IP
- `authenticated_api`: authenticated API traffic, keyed by `userId` when available, otherwise by client IP

429 responses include `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and structured JSON metadata including `code`, `requestId`, and `retryAfterSeconds`.

Email verification uses a 6-digit code with a default 10-minute lifetime when `APP_AUTH_EMAIL_VERIFICATION_ENABLED=true`. The default SMTP shape targets Postmark (`smtp.postmarkapp.com:587` with STARTTLS). If the feature is enabled but `MAIL_USERNAME` or `MAIL_PASSWORD` are not configured, the backend falls back to local development mode and writes the current code to the backend logs so the `/verify-email` flow still works locally.

For structured JSON logs in production, enable the `json-logs` Spring profile. Example:

```bash
SPRING_PROFILES_ACTIVE=json-logs
```

---

## 🤝 Contributing

🎉 Contributions are welcome.

| 🎯 Situation | 🚀 Action |
|---|---|
| 🐛 Found a bug | [Open an issue](https://github.com/Sunagatov/URL-Shortener/issues/new) with the `bug` label |
| 💡 Want a feature | Start a [Discussion](https://github.com/Sunagatov/URL-Shortener/discussions) first |
| 👨💻 Ready to code | Pick a [`good first issue`](https://github.com/Sunagatov/URL-Shortener/issues?q=is%3Aopen+label%3A%22good+first+issue%22), comment "I'm on it" |
| 🔧 Big change | Comment on the issue before writing code — tickets may have hidden constraints |

---

## 📄 License

📜 CC BY-NC 4.0 — free for educational and personal use with author attribution. Commercial use requires explicit written permission from the author ([zufar.sunagatov@gmail.com](mailto:zufar.sunagatov@gmail.com)).

---

## 📞 Contact

- 💬 **Telegram community:** [Zufar Explained IT](https://t.me/zufarexplained)
- 👤 **Personal Telegram:** [@lucky_1uck](https://web.telegram.org/k/#@lucky_1uck)
- 📧 **Email:** [zufar.sunagatov@gmail.com](mailto:zufar.sunagatov@gmail.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Sunagatov/URL-Shortener/issues)

❤️
