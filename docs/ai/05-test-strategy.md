# 05 — Test Strategy

## Default commands
### Run all tests
```bash
./gradlew test
```

### Run app locally
```bash
./gradlew bootRun
```

### Start local MongoDB only
```bash
docker compose up -d mongo
```

## Verification strategy by task
### Auth change
Verify:
- valid sign-up/sign-in still works
- invalid credentials still fail correctly
- refresh-token flow still behaves correctly
- token-related config assumptions still hold

### URL creation change
Verify:
- valid URL can be shortened
- invalid URL input still fails correctly
- duplicate URL behavior still matches contract
- auth requirement still holds

### Redirect change
Verify:
- known hash redirects with 302 + Location header
- missing hash returns 404
- hot path remains simple and fast

### Config / infra change
Verify:
- app still boots with expected env vars
- MongoDB config names still align
- Swagger / Actuator paths still make sense if touched

## Cheap regression checklist
- compile / boot still works
- no contract path changed accidentally
- no env key changed accidentally
- no auth/public route changed accidentally
- no cache/rate-limit property name changed accidentally

## When to update docs
Update matching docs when you change:
- endpoint path
- request or response shape
- validation rules
- default config behavior
