# URL Shortener Frontend

**A modern React frontend for URL shortening: fast, type-safe, and production-ready.**

[Community](https://t.me/zufarexplained) |
[Good First Issues](https://github.com/Sunagatov/Shorty-URL-Frontend/issues?q=is%3Aopen+label%3A%22good+first+issue%22) |
[Issues](https://github.com/Sunagatov/Shorty-URL-Frontend/issues)

[![License: CC BY-NC 4.0](https://img.shields.io/badge/license-CC%20BY--NC%204.0-lightgrey.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Sunagatov/Shorty-URL-Frontend)](https://github.com/Sunagatov/Shorty-URL-Frontend/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Sunagatov/Shorty-URL-Frontend?style=social)](https://github.com/Sunagatov/Shorty-URL-Frontend/network/members)
[![Contributors](https://img.shields.io/github/contributors/Sunagatov/Shorty-URL-Frontend)](https://github.com/Sunagatov/Shorty-URL-Frontend/graphs/contributors)

---

## What this project is

Shorty URL Frontend is a React + TypeScript single-page application for the Shorty URL platform.

It allows users to:

- create shortened URLs
- sign up and sign in with email/password
- browse and manage their own URL mappings
- view URL details
- use authenticated account pages protected by route guards
- run unit, component, and Playwright E2E tests in a modern Vite-based setup

This project communicates with the Shorty URL backend via REST API.

---

## Tech stack

| Category               | Technology                |
| ---------------------- | ------------------------- |
| Language               | TypeScript 5              |
| Framework              | React 19                  |
| Routing                | React Router 7            |
| Forms and Validation   | React Hook Form 7 + Zod 4 |
| HTTP                   | Axios                     |
| Styling                | Tailwind CSS 3            |
| Icons                  | React Icons               |
| Build Tool             | Vite 8                    |
| Unit / Component Tests | Vitest + Testing Library  |
| E2E Tests              | Playwright                |

---

## Main routes

| Route                            | Purpose                           | Auth Required |
| -------------------------------- | --------------------------------- | ------------- |
| `/`                              | Public URL shortener landing page | No            |
| `/signin`                        | Sign-in page                      | No            |
| `/signup`                        | Sign-up page                      | No            |
| `/account/dashboard`             | Dashboard                         | Yes           |
| `/account/profile`               | User profile                      | Yes           |
| `/account/security`              | Security settings                 | Yes           |
| `/account/url-mappings`          | User URL list                     | Yes           |
| `/account/url-mappings/:urlHash` | URL details page                  | Yes           |

---

## Features

| Feature                  | Status          | Notes                                                     |
| ------------------------ | --------------- | --------------------------------------------------------- |
| Email/password sign up   | Implemented     | Client-side validation via Zod                            |
| Email/password sign in   | Implemented     | Token-based authentication flow                           |
| Protected account routes | Implemented     | `/account/*` routes are guarded                           |
| URL shortening           | Implemented     | Public home page supports shortening                      |
| User URL list            | Implemented     | Pagination and deletion flow                              |
| URL details page         | Implemented     | Uses canonical `expiresAt` field                          |
| Token refresh flow       | Implemented     | Axios-based refresh handling                              |
| Docker production image  | Implemented     | Nginx serves built assets                                 |
| Google/GitHub auth       | Not implemented | Buttons are intentionally disabled and marked coming soon |

---

## Project structure

The frontend uses a feature-first structure. Code is grouped by product area such as authentication, account management, and URL management instead of global technical layers.

```text
src/
├── app/                    # App bootstrap, router, layout, route map
├── features/
│   ├── account/            # Account pages, profile API, security flow
│   ├── auth/               # Auth provider, guards, sign-in/sign-up flows
│   └── urls/               # URL creation, listing, details, deletion
├── shared/
│   ├── api/                # Shared Axios client and cross-feature API hooks
│   ├── lib/                # Cross-cutting helpers such as API error parsing
│   ├── types/              # Shared TypeScript models
│   └── ui/                 # Reusable UI primitives
└── test/                   # Vitest setup

e2e/                        # Playwright tests
```

### Structure rules

- Keep route pages, feature-specific API calls, local models, and feature-only helpers inside the owning feature.
- Move code into `shared/` only when it is genuinely reused and not tied to a single feature domain.
- Keep `app/` thin. It should compose providers, layout, and routes, not own business logic.
- Prefer `@/` imports over deep relative paths.

---

## Requirements

- Node.js 20+ recommended
- npm
- Shorty URL backend running and reachable

---

## Environment variables

Create a `.env` file in the project root:

```bash
REACT_APP_BACKEND_REST_API_URL=http://localhost:8080
```

### Required variables

| Variable                         | Required | Description                      |
| -------------------------------- | -------- | -------------------------------- |
| `REACT_APP_BACKEND_REST_API_URL` | Yes      | Base URL of the backend REST API |

Never commit real environment values.

---

## Local development

```bash
git clone https://github.com/Sunagatov/URL-Shortener.git
cd URL-Shortener/frontend
npm install
npm run dev
```

The Vite dev server runs on:

```text
http://localhost:3000
```

---

## Available scripts

| Command                   | Description                            |
| ------------------------- | -------------------------------------- |
| `npm run dev`             | Start Vite dev server                  |
| `npm start`               | Alias for Vite dev server              |
| `npm run build`           | Type-check and build production assets |
| `npm run preview`         | Preview production build locally       |
| `npm run type-check`      | Run TypeScript type checks             |
| `npm run test`            | Run Vitest test suite                  |
| `npm run test:watch`      | Run Vitest in watch mode               |
| `npm run test:e2e`        | Run Playwright E2E tests               |
| `npm run test:e2e:ui`     | Run Playwright in UI mode              |
| `npm run test:e2e:headed` | Run Playwright in headed mode          |
| `npm run test:e2e:report` | Open Playwright HTML report            |
| `npm run format`          | Format source files with Prettier      |
| `npm run format:check`    | Check formatting                       |

---

## Testing

### Unit / component tests

```bash
npm run test
```

### E2E tests

```bash
npm run test:e2e
```

### Important E2E note

The E2E suite expects a working backend with the expected authentication and URL APIs.

By default:

- frontend runs on `http://localhost:3000`
- backend should be reachable through `REACT_APP_BACKEND_REST_API_URL`

You can override the frontend port for Playwright if needed:

```bash
PLAYWRIGHT_FRONTEND_PORT=3001 npm run test:e2e
```

---

## Production build

```bash
npm run build
```

The production bundle is generated in:

```text
build/
```

---

## Docker

This repository includes Docker support for serving the built frontend with Nginx.

### Build image

```bash
docker build -t shorty-url-frontend .
```

### Run container

```bash
docker run --rm -p 8080:80 shorty-url-frontend
```

Then open:

```text
http://localhost:8080
```

From the monorepo root, build with:

```bash
docker build -f frontend/Dockerfile --build-arg REACT_APP_BACKEND_REST_API_URL=http://localhost:8080 -t shorty-url-frontend frontend
```

---

## Authentication notes

- account pages are protected behind route guards
- sign-up requires `firstName`, `lastName`, `country`, `age`, `email`, and `password`
- sign-in uses email/password
- social auth buttons are currently placeholders and intentionally disabled

---

## Known limitations

- Google OAuth and GitHub OAuth are not wired yet
- profile editing is not fully implemented
- some feature documentation may still lag behind the code and should be updated incrementally
- full E2E success depends on a compatible running backend

---

## Contributing

Contributions are welcome.

| Situation               | Action                                            |
| ----------------------- | ------------------------------------------------- |
| Found a bug             | Open an issue                                     |
| Want a feature          | Open an issue or discussion                       |
| Want to contribute code | Pick an issue and leave a comment before starting |
| Large change            | Align on approach first                           |

---

## License

[CC BY-NC 4.0](LICENSE)

Free for educational and personal use with attribution. Commercial use requires explicit written permission from the author.

---

## Contact

- Telegram community: [Zufar Explained IT](https://t.me/zufarexplained)
- Email: [zufar.sunagatov@gmail.com](mailto:zufar.sunagatov@gmail.com)
- Issues: [GitHub Issues](https://github.com/Sunagatov/Shorty-URL-Frontend/issues)
