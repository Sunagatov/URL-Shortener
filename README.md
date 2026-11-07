# URL Shortener

A Kotlin and React application for creating short links, managing them in an account and inspecting usage analytics.

<p>
  <a href="https://buymeacoffee.com/lucky_1uck">
    <img src="https://img.shields.io/badge/Support_the_project-FFDD00?style=for-the-badge&amp;logo=buymeacoffee&amp;logoColor=black" alt="Support the project" width="260" height="40">
  </a>
</p>

## Features

- Public short-link creation and redirects.
- Account registration, sign-in and authenticated link management.
- Link details, expiration handling and analytics APIs.
- Request validation, policy-based rate limiting and configurable abuse safeguards.
- A React account interface with unit/component and end-to-end tests.

## Stack

| Layer | Technology |
| --- | --- |
| Backend | Kotlin 2.3, Java 25, Spring Boot 4, Spring Security |
| Database | MongoDB 7 |
| Frontend | React 19, TypeScript, Vite |
| Tests | JUnit/Spring tests, Vitest, Testing Library, Playwright |

## Start the local stack

Install Docker with Compose. From the repository root:

```bash
cp backend/.env.example backend/.env.local
```

Edit the local file to supply the values required by the backend, including a
local JWT signing secret. Root Compose reads `backend/.env.local`; it overrides
the MongoDB URI to use the database container. Then start the stack:

```bash
docker compose up -d --build
```

| Service | Local address |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:8080` |
| MongoDB | `localhost:27017` |

On Windows PowerShell, use `Copy-Item backend/.env.example backend/.env.local`
for the copy step. Email and external authentication/challenge integrations
need their own configuration; see the backend setup for optional services.

## Develop modules directly

Use JDK 25 for the backend and Node.js 20.19+ or 22.12+ with npm for Vite 8.

```bash
# Terminal 1, from backend/:
./gradlew bootRun

# Terminal 2, from frontend/:
npm ci
npm run dev
```

Use `gradlew.bat` on Windows. Direct backend startup needs MongoDB and its
environment variables configured independently of Compose. Set frontend
`VITE_BACKEND_REST_API_URL=http://localhost:8080` in your local frontend
environment when using the local API.

## Repository map

- [Backend README](backend/README.md): configuration, API, auth and rate-limiting details.
- [Frontend README](frontend/README.md): routes, scripts, browser tests and frontend conventions.
- [Feature documentation](backend/docs/features): API behaviour and safeguards.
- [Product feature notes](docs/features-2026.md): broader feature context.
- [Agent entry point](AGENTS.md): repository boundaries and focused development guidance.

## Checks

```bash
# backend/
./gradlew test

# frontend/
npm test
npm run type-check
npm run lint
npm run build
```

Playwright checks use `npm run test:e2e` from `frontend/` with the expected local
services available. Production deployment, secrets and server operations are
managed in the private Vault repository.

## ☕ Support the project

If this project helps you learn or build, you can support its development.

<p>
  <a href="https://buymeacoffee.com/lucky_1uck">
    <img src="https://img.shields.io/badge/Support_the_project-FFDD00?style=for-the-badge&amp;logo=buymeacoffee&amp;logoColor=black" alt="Support the project" width="260" height="40">
  </a>
</p>
