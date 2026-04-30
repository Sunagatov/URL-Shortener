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
| 🔐 **Sign Up** | User registration with email/password, JWT tokens | [docs/features/auth-signup.md](docs/features/auth-signup.md) |
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
| `CORS_ALLOWED_ORIGINS` | ❌ | Defaults to `http://localhost:3000` |
| `RATE_LIMIT_REQUESTS` | ❌ | Defaults to `100` (per minute per IP) |

See `.env.example` for local defaults and `.env.prod` for the production template.

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
