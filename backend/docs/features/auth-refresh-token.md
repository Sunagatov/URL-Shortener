# Feature: Refresh Access Token

## Overview
Endpoint to obtain a new access token using a valid refresh token without requiring the user to sign in again.

## User Story
**As a** signed-in user  
**I want to** refresh my access token  
**So that** I can continue using the app without signing in again

## API Endpoint
```
POST /api/v1/auth/refresh-token
```

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "refreshToken": "dGhpc0lzQVJlZnJlc2hUb2tlbi..."
}
```

### Validation Rules
- **refreshToken**: Required, not blank, valid JWT format

## Response

### Success (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

#### 400 Bad Request - Missing Token
```json
{
  "errorMessage": "Refresh token must not be empty."
}
```

#### 401 Unauthorized - Invalid/Expired Token
```json
{
  "errorMessage": "Invalid or expired refresh token."
}
```

#### 404 Not Found - User Not Found
```json
{
  "errorMessage": "User not found for the provided refresh token."
}
```

## Business Logic

1. **Validate Request**: Check refresh token is provided
2. **Validate Token**: Verify JWT signature and expiration
3. **Extract Username**: Get email from JWT claims
4. **Find User**: Retrieve user from database
5. **Generate New Access Token**: Create fresh access token
6. **Return Response**: Send new access token

## Security

- Refresh token is validated for signature and expiration
- User existence is verified before issuing new token
- Old access token is not invalidated (stateless JWT)
- Refresh token remains valid until expiration

## Frontend Integration

### Constants Path
```typescript
// src/constants/index.ts
AUTH: {
  REFRESH: '/v1/auth/refresh-token'  // ✅ CORRECT
}
```

### Axios Interceptor
```typescript
// src/axiosConfig.ts
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = storage.getRefreshToken();
      const response = await axios.post(
        `${backendRestApiUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken }
      );
      const { accessToken } = response.data;
      storage.setAccessToken(accessToken);
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

### Full URL
```
https://116.203.197.65/api/v1/auth/refresh-token
```

## Token Lifecycle

```
1. User signs in → Receives access + refresh tokens
2. Access token expires (15 min) → API returns 401
3. Frontend intercepts 401 → Calls refresh endpoint
4. Backend validates refresh token → Returns new access token
5. Frontend retries original request with new token
6. Refresh token expires (7 days) → User must sign in again
```

## Testing

### Manual Test
```bash
curl -X POST https://116.203.197.65/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Acceptance Criteria

- [x] Valid refresh token returns new access token
- [x] Expired refresh token returns 401 error
- [x] Invalid refresh token returns 401 error
- [x] Missing refresh token returns 400 error
- [x] Non-existent user returns 404 error
- [x] Frontend automatically refreshes on 401
- [x] Original request is retried after refresh

## Related Features
- [Sign In](auth-signin.md)
- [Sign Up](auth-signup.md)
- [Logout](auth-logout.md)
