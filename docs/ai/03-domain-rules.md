# 03 — Domain Rules

## URL shortening rules
- `originalUrl` must be valid.
- URL creation is authenticated.
- `daysCount` is optional and should remain positive when present.
- Duplicate original URLs are expected to return the existing short URL rather than creating duplicates.
- `urlHash` should remain unique and stable for lookup.

## Redirect rules
- Redirect is public.
- Successful redirect is HTTP 302.
- Missing mapping should return 404.
- Redirect performance matters; avoid unnecessary work on the hot path.

## Auth rules
- Sign up creates a user and returns tokens.
- Sign in validates credentials and returns tokens.
- Refresh token flow issues a new access token without full sign-in.
- Passwords must stay hashed.
- JWT signing secret must stay externalized via env vars.

## Runtime truth over prose
There are known inconsistencies between prose docs and runtime config.
Use this order:
1. code
2. `src/main/resources/application.properties`
3. `build.gradle.kts`
4. feature docs
5. README prose

## Known inconsistencies already detected
### Token lifetime drift
Feature docs mention access token lifetime as 15 minutes, but runtime config default is `3600000` ms (1 hour).

### Cache lifetime drift
Feature docs mention a 1 hour cache TTL, but runtime config default is `30` minutes.

### MongoDB env name drift
README prose mentions `MONGODB_DATABASE_NAME`, while runtime config uses `MONGODB_DATABASE`.

## Safe change rules
- Do not “fix” behavior to match prose docs unless the task explicitly says to change runtime behavior.
- If you align code and docs, decide which one is intended first and update both.
