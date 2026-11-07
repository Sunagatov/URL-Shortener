# URL-Shortener

Monorepo for the URL shortener application.

<p>
  <a href="https://buymeacoffee.com/lucky_1uck">
    <img src="https://img.shields.io/badge/Support_the_project-FFDD00?style=for-the-badge&amp;logo=buymeacoffee&amp;logoColor=black" alt="Support the project" width="260" height="40">
  </a>
</p>

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

---

## ☕ Support the project

If URL Shortener is useful to you or inspires your own projects, you can support its development.

<p>
  <a href="https://buymeacoffee.com/lucky_1uck">
    <img src="https://img.shields.io/badge/Support_the_project-FFDD00?style=for-the-badge&amp;logo=buymeacoffee&amp;logoColor=black" alt="Support the project" width="260" height="40">
  </a>
</p>

