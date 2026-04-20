# 00 — Start Here

This file is the low-token entrypoint for coding agents.

## Fast task router
| Task type | Read first | Then read | Usually skip |
|---|---|---|---|
| auth bug / feature | `CLAUDE.md` | `docs/ai/02-api-map.md`, `docs/ai/03-domain-rules.md`, `docs/features/auth-*.md` | unrelated URL docs, broad repo scans |
| shorten URL bug / feature | `CLAUDE.md` | `docs/ai/02-api-map.md`, `docs/ai/03-domain-rules.md`, `docs/features/url-shorten.md` | auth docs unless auth is involved |
| redirect bug / feature | `CLAUDE.md` | `docs/ai/02-api-map.md`, `docs/ai/03-domain-rules.md`, `docs/features/url-redirect.md` | signup/signin docs |
| config / infra | `CLAUDE.md` | `docs/ai/01-architecture-map.md`, `build.gradle.kts`, `application.properties`, `docker-compose.yml` | feature docs not touched by change |
| tests only | `CLAUDE.md` | `docs/ai/05-test-strategy.md` + exact tests/source | most runtime docs |

## Minimal read bundles
### Bundle: auth
- `CLAUDE.md`
- `docs/ai/02-api-map.md`
- `docs/ai/03-domain-rules.md`
- `docs/features/auth-signup.md`
- `docs/features/auth-signin.md`
- `docs/features/auth-refresh-token.md`

### Bundle: shorten
- `CLAUDE.md`
- `docs/ai/02-api-map.md`
- `docs/ai/03-domain-rules.md`
- `docs/features/url-shorten.md`

### Bundle: redirect
- `CLAUDE.md`
- `docs/ai/02-api-map.md`
- `docs/ai/03-domain-rules.md`
- `docs/features/url-redirect.md`

### Bundle: infra
- `CLAUDE.md`
- `docs/ai/01-architecture-map.md`
- `build.gradle.kts`
- `src/main/resources/application.properties`
- `docker-compose.yml`

## Cheap search strategy
- Search inside the likely package first.
- Open only the controller, service, repository, DTO, validator, or config directly involved.
- Avoid reading generated, build, log, and unrelated docs files.

## Stop conditions
Stop reading when you can answer:
1. what contract is supposed to happen,
2. where that behavior lives,
3. what the smallest safe change is,
4. how to verify it.
