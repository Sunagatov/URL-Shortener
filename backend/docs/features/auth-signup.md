# Feature: User Sign-Up

## Overview
User registration endpoint that allows new users to create an account and receive JWT tokens for authentication.

## User Story
**As a** new user  
**I want to** create an account  
**So that** I can save and manage my shortened URLs

## API Endpoint
```
POST /api/v1/auth/signup
```

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!",
  "country": "USA",
  "age": 28
}
```

### Validation Rules
- **firstName**: Required, not blank, max 50 characters, letters/hyphens/apostrophes only (`^[a-zA-Z'-]+$`)
- **lastName**: Required, not blank, max 50 characters, letters/hyphens/apostrophes only (`^[a-zA-Z'-]+$`)
- **email**: Required, valid email format, max 254 characters
- **password**: Required, minimum 15 characters, max 64 characters
- **country**: Required, not blank, max 50 characters, letters/hyphens/apostrophes/spaces (`^[a-zA-Z'\-]+(\s[a-zA-Z'\-]+)*$`)
- **age**: Required, must be between 13 and 120

## Response

### Success — Verification Disabled (200 OK)
```json
{
  "verificationRequired": false,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpc0lzQVJlZnJlc2hUb2tlbi..."
}
```

### Success — Verification Enabled (200 OK)
```json
{
  "verificationRequired": true,
  "email": "jane.doe@example.com",
  "expiresInSeconds": 600,
  "resendAvailableInSeconds": 60,
  "deliveryMode": "smtp"
}
```

### Error Responses

#### 400 Bad Request - Invalid Data
```json
{
  "errorMessage": "Required fields are missing or invalid."
}
```

#### 409 Conflict - Email Already Exists
```json
{
  "errorMessage": "Email is already in use."
}
```

## Business Logic

1. **Normalize Email**: Lowercase and trim the email address
2. **Validate Request**: Check all required fields are present and valid
3. **Check Email Uniqueness**: Verify email is not already registered (case-insensitive)
4. **Hash Password**: Encrypt password using BCrypt
5. **Create User**: Save user details to MongoDB
6. **Email Verification** (when enabled): Generate a 6-digit verification code, hash it, and send via email. Return a verification challenge response.
7. **Email Verification** (when disabled): Mark user as verified, generate JWT tokens, and return them immediately.
8. **Handle Race Condition**: If a `DuplicateKeyException` occurs on save (concurrent sign-up with same email), return 409 Conflict.

## Security

- Passwords are hashed using BCrypt before storage
- JWT tokens are signed with a secret key
- Access token expires in 15 minutes
- Refresh token expires in 7 days
- Email uniqueness is enforced at database level

## Database Schema

### Collection: `user_details`
```json
{
  "_id": "String",
  "firstName": "String",
  "lastName": "String",
  "email": "String (unique, indexed)",
  "password": "String (hashed, nullable for Google users)",
  "country": "String",
  "age": "Number",
  "authProvider": "String (LOCAL | GOOGLE)",
  "emailVerified": "Boolean",
  "emailVerifiedAt": "DateTime",
  "emailVerificationCodeHash": "String (hashed)",
  "emailVerificationCodeExpiresAt": "DateTime",
  "emailVerificationCodeSentAt": "DateTime",
  "tokenVersion": "Number",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

## Frontend Integration

### Constants Path
```typescript
// src/constants/index.ts
AUTH: {
  SIGNUP: '/v1/auth/signup'  // ✅ CORRECT (no /api/ prefix)
}
```

### API Service
```typescript
// src/services/ApiService.ts
export async function signUp(data: SignUpRequest): Promise<{ user: User } & AuthTokens> {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SIGNUP, data);
  return response.data;
}
```

### Base URL Configuration
```
REACT_APP_BACKEND_REST_API_URL=https://116.203.197.65/api
```

### Full URL Construction
```
baseURL + endpoint = https://116.203.197.65/api + /v1/auth/signup
Result: https://116.203.197.65/api/v1/auth/signup ✅
```

## Known Issues

### ❌ BUG: Double /api/ Prefix
**Problem**: Frontend constants included `/api/` prefix when baseURL already has it
```typescript
// ❌ WRONG
SIGNUP: '/api/v1/auth/signup'
// Results in: https://116.203.197.65/api/api/v1/auth/signup

// ✅ CORRECT
SIGNUP: '/v1/auth/signup'
// Results in: https://116.203.197.65/api/v1/auth/signup
```

**Status**: FIXED in constants/index.ts

## Testing

### Manual Test
```bash
curl -X POST https://116.203.197.65/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test123!",
    "country": "USA",
    "age": 25
  }'
```

### Expected Response
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "dGh..."
}
```

## Acceptance Criteria

- [x] User can register with valid data
- [x] Duplicate email returns 409 error
- [x] Invalid email format returns 400 error
- [x] Password is hashed before storage
- [x] JWT tokens are returned on success
- [x] User data is saved to MongoDB
- [x] Frontend integration works correctly

## Related Features
- [Sign In](auth-signin.md)
- [Refresh Token](auth-refresh-token.md)
- [User Profile](user-profile.md)
