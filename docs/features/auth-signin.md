# Feature: User Sign-In

## Overview
User authentication endpoint that validates credentials and returns JWT tokens.

## User Story
**As a** registered user  
**I want to** sign in to my account  
**So that** I can access my shortened URLs

## API Endpoint
```
POST /api/v1/auth/signin
```

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Validation Rules
- **email**: Required, valid email format
- **password**: Required, not blank

## Response

### Success (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpc0lzQVJlZnJlc2hUb2tlbi..."
}
```

### Error Responses

#### 400 Bad Request - Invalid Request
```json
{
  "errorMessage": "Email and password must not be empty."
}
```

#### 401 Unauthorized - Invalid Credentials
```json
{
  "errorMessage": "Invalid email or password."
}
```

## Business Logic

1. **Validate Request**: Check email and password are provided
2. **Authenticate User**: Verify credentials using Spring Security
3. **Generate Tokens**: Create access and refresh JWT tokens
4. **Return Response**: Send tokens to client

## Security

- Password verification uses BCrypt comparison
- Failed login attempts are logged
- JWT tokens are signed with secret key
- Access token expires in 15 minutes
- Refresh token expires in 7 days

## Frontend Integration

### Constants Path
```typescript
// src/constants/index.ts
AUTH: {
  SIGNIN: '/v1/auth/signin'  // ✅ CORRECT
}
```

### API Service
```typescript
// src/services/ApiService.ts
static async signIn(data: SignInRequest): Promise<{ user: User } & AuthTokens> {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SIGNIN, data);
  return response.data;
}
```

### Full URL
```
http://116.203.197.65/api/v1/auth/signin
```

## Testing

### Manual Test
```bash
curl -X POST http://116.203.197.65/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

## Acceptance Criteria

- [x] User can sign in with valid credentials
- [x] Invalid credentials return 401 error
- [x] Missing fields return 400 error
- [x] JWT tokens are returned on success
- [x] Frontend integration works correctly

## Related Features
- [Sign Up](auth-signup.md)
- [Refresh Token](auth-refresh-token.md)
- [Logout](auth-logout.md)
