# 02 — API Map

## Public endpoints
### Redirect
- `GET /url/{urlHash}`
- Public endpoint
- Expected outcome: HTTP 302 with `Location` header when hash exists

## URL endpoints
### Create short URL
- `POST /api/v1/urls`
- Public endpoint; bearer access token is optional and associates the mapping with the user when present
- Request contains `originalUrl` and optional `daysCount`

## Auth endpoints
### Sign up
- `POST /api/v1/auth/signup`

### Sign in
- `POST /api/v1/auth/signin`

### Refresh token
- `POST /api/v1/auth/refresh-token`

## Common API assumptions to preserve
- Auth endpoints live under `/api/v1/auth/*`
- URL creation lives under `/api/v1/urls`
- Redirect stays on `/url/{urlHash}` rather than under `/api/v1`

## Error behavior from docs
- invalid auth input: 400
- invalid credentials / invalid refresh token: 401
- duplicate email: 409
- missing URL mapping on redirect: 404
- invalid URL input on creation: 400

## Useful reminder
If you change validation or response shape, update both tests and the matching feature spec under `docs/features/`.
