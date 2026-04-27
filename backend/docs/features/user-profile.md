# Feature: User Profile

## Overview
The backend currently exposes authenticated user retrieval rather than a dedicated profile-management feature document. This page exists to keep related feature links valid.

## Current API Surface

### Get Current User
```text
GET /api/v1/users
```

Returns the authenticated user's details when a valid JWT access token is provided.

## Notes

- Profile read access is authenticated
- Profile update endpoints are not documented in this backend yet
- Frontend account/profile screens should rely on the currently supported backend contract

## Related Features
- [Sign Up](auth-signup.md)
- [Sign In](auth-signin.md)
- [Refresh Token](auth-refresh-token.md)
