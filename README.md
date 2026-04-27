# URL-Shortener

Monorepo for the URL shortener application.

## Structure

- `backend/` - Kotlin + Spring Boot API
- `frontend/` - React + TypeScript SPA

## Local Development

Run each module directly:

```bash
cd backend
./gradlew bootRun
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Or run the full local stack from the repo root:

```bash
docker compose up -d --build
```

This starts:

- MongoDB on `localhost:27017`
- Backend on `http://localhost:8080`
- Frontend on `http://localhost:3000`

## Working Conventions

- Backend-only docs and tooling live under `backend/`.
- Frontend-only docs and tooling live under `frontend/`.
- Root-level CI and local orchestration should reference module paths explicitly.

## Notes

- Backend-specific setup remains in `backend/README.md`.
- Frontend-specific setup remains in `frontend/README.md`.
