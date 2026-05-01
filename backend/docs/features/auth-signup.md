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
- **firstName**: Required, not blank
- **lastName**: Required, not blank
- **email**: Required, valid email format
- **password**: Required, minimum 8 characters
- **country**: Required, not blank
- **age**: Required, must be a positive number

## Response

### Success (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpc0lzQVJlZnJlc2hUb2tlbi..."
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

1. **Validate Request**: Check all required fields are present and valid
2. **Check Email Uniqueness**: Verify email is not already registered
3. **Hash Password**: Encrypt password using BCrypt
4. **Create User**: Save user details to MongoDB
5. **Generate Tokens**: Create access and refresh JWT tokens
6. **Return Response**: Send tokens to client

## Security

- Passwords are hashed using BCrypt before storage
- JWT tokens are signed with a secret key
- Access token expires in 15 minutes
- Refresh token expires in 7 days
- Email uniqueness is enforced at database level

## Database Schema

### Collection: `users`
```json
{
  "_id": "ObjectId",
  "firstName": "String",
  "lastName": "String",
  "email": "String (unique, indexed)",
  "password": "String (hashed)",
  "country": "String",
  "age": "Number",
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
