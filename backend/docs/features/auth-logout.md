# Feature: User Logout

## Overview
Logout is currently handled client-side by deleting stored JWT tokens. There is no dedicated backend logout endpoint in this service at the moment.

## Current Behavior

1. Frontend removes the stored access token
2. Frontend removes the stored refresh token
3. Protected requests fail until the user signs in again

## API Endpoint
There is no `POST /api/v1/auth/logout` endpoint currently implemented.

## Security Notes

- JWT access tokens remain valid until they expire
- Refresh tokens remain valid until they expire
- Logging out only clears client-side state in the current implementation

## Related Features
- [Sign In](auth-signin.md)
- [Sign Up](auth-signup.md)
- [Refresh Token](auth-refresh-token.md)
