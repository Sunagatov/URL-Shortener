# URL-Shortener Agent Entry Point

This file is the canonical starting point for AI agents working in this repo.
Use it from Claude, Codex, Amazon Q, Kiro, Copilot, ChatGPT, and similar tools.

## Scope Boundary

- This repo owns the URL shortener source code, local development docs, local Compose setup, and tests.
- `backend/` owns the Kotlin/Spring Boot API, MongoDB data model, auth, redirects, analytics, rate limiting, logging, OpenAPI, and backend tests.
- `frontend/` owns the React/Vite SPA, routing, auth UI, account pages, URL management UI, analytics UI, frontend API client, and frontend tests.
- Vault owns production runtime facts: deploy steps, secrets, observability, backups, host state, and infra.
- Do not duplicate Vault knowledge here. Link to Vault when production/runtime/secrets/observability context is needed.

## Vault Context

The sibling `Vault` checkout is the private operations and knowledge-base repo
shared across these pet projects. Use it only when a task needs
production/runtime facts: deployment flow, Docker Compose on the host, systemd or
host setup, SOPS-managed secrets, backups/restores, observability, reverse proxy,
infra inventory, or cross-project operational decisions. Start with Vault's
`AGENTS.md` and follow its routing docs instead of asking where production,
secrets, monitoring, or server-state information lives.

## Minimal Read Order

Read only what is needed for the task.

1. `AGENTS.md`
2. `README.md`
3. Backend task: `backend/README.md`, then the smallest relevant files under `backend/src/main/kotlin` and `backend/src/test/kotlin`
4. Frontend task: `frontend/README.md`, then the smallest relevant files under `frontend/src`, `frontend/e2e`, and `frontend/src/**/*.test.*`
5. Feature/spec context: `backend/docs/features/*.md` or `docs/features-2026.md`
6. AI routing notes: `docs/ai/README.md`
7. Production/runtime/secrets/observability: Vault, not this repo

## Current Project Shape

- Monorepo with root Docker Compose orchestration.
- Backend: Kotlin, Spring Boot, Spring Security, MongoDB, Caffeine, Bucket4j, Micrometer Prometheus, OpenAPI Scalar, JUnit/Spring tests.
- Frontend: React, TypeScript, React Router, Vite, Axios, React Hook Form, Zod, Tailwind CSS, React Icons, Vitest, Testing Library, Playwright.
- Local default ports:
  - MongoDB: `localhost:27017`
  - Backend: `http://localhost:8080`
  - Frontend: `http://localhost:3000`

## Architecture Rules

- Keep backend domain code in the owning package: `auth`, `urls`, `analytics`, `users`, `frontendlogs`, or `shared`.
- Keep backend controllers thin; service classes own business rules; repositories own persistence access.
- Keep frontend code feature-first under `frontend/src/features/<feature>`.
- Keep frontend `app/` thin: providers, router, layout, route map, and composition only.
- Put genuinely shared frontend primitives in `frontend/src/shared`; do not let `shared` depend on `features` or `app`.
- Feature folders should not import each other directly. Route cross-feature behavior through `shared` or `app`.
- Keep tests close to the code they verify.

## Source Of Truth Rules

- Local source, tests, feature specs, and local dev commands belong in this repo.
- Production hostnames/IPs, deploy commands, backups, observability, SOPS usage, and live credentials belong in Vault.
- Never add raw tokens, API keys, JWT secrets, SMTP passwords, or production database URLs to agent docs.
- If an old doc conflicts with source code, prefer source code and update or archive the doc.
- Avoid loading broad generated or historical context unless the task explicitly needs it.

## Common Commands

Root:

```bash
docker compose up -d --build
```

Backend:

```bash
cd backend
./gradlew test
./gradlew bootRun
```

Frontend:

```bash
cd frontend
npm install
npm run lint
npm run type-check
npm run test
npm run build
npm run test:e2e
```

## Change Guidance

- Backend API changes should include controller/service tests and frontend API usage updates when behavior changes.
- Frontend UI changes should include component/unit tests or Playwright coverage when user-visible behavior changes.
- Auth, token refresh, rate limiting, logging, and redirect behavior are high-risk paths; inspect existing tests before editing.
- For production-facing changes, check Vault before assuming deploy, runtime, secrets, or monitoring details.
