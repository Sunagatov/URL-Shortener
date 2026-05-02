# Feature: Shorten URL

## Overview
Core feature that generates a shortened URL from a long URL with optional expiration time.

## User Story
**As a** user  
**I want to** shorten a long URL  
**So that** I can share it easily

## API Endpoint
```
POST /api/v1/urls
```

## Request

### Headers
```
Content-Type: application/json
Authorization: Bearer {accessToken}  # optional
```

### Body
```json
{
  "originalUrl": "https://www.example.com/some/very/long/url/path",
  "daysCount": 30,
  "customAlias": "my-link"
}
```

### Validation Rules
- **originalUrl**: Required, valid URL format, max 2048 characters, no spaces
- **daysCount**: Optional, integer between 1 and 365 (default: 365 days)
- **customAlias**: Optional, 3–30 characters, letters/numbers/hyphens/underscores only. Reserved aliases (e.g., `signin`, `admin`, `api`) are rejected.

## Response

### Success (200 OK)
```json
{
  "shortUrl": "https://116.203.197.65/abc123"
}
```

### Error Responses

#### 400 Bad Request - Invalid URL
```json
{
  "errorMessage": "URL must not contain spaces."
}
```

#### 400 Bad Request - URL Too Long
```json
{
  "errorMessage": "URL too long"
}
```

#### 409 Conflict - Custom Alias Taken
```json
{
  "errorMessage": "Custom alias 'my-link' is already in use"
}
```

#### 409 Conflict - Reserved Alias
```json
{
  "errorMessage": "This alias is reserved and cannot be used"
}
```

## Business Logic

1. **Validate URL**: Check format, length, and no spaces
2. **Trim URL**: Remove leading/trailing whitespace
3. **Generate Hash**: Generate a random short code
4. **Create Mapping**: Build a URL mapping and associate it with the authenticated user when a valid bearer token is present
5. **Set Expiration**: Calculate expiration date (now + daysCount, or the service default)
6. **Save to Database**: Store URL mapping, retrying on short-code collision
7. **Return Response**: Send short URL to client

## URL Hash Generation

The service generates a random URL-safe code and retries insertion if the generated code collides with an existing mapping.

## Database Schema

### Collection: `url_mappings`
```json
{
  "_id": "ObjectId",
  "urlHash": "String (unique, indexed)",
  "shortUrl": "String",
  "originalUrl": "String",
  "userId": "String (indexed)",
  "createdAt": "DateTime",
  "expirationDate": "DateTime",
  "clickCount": "Number (default: 0)"
}
```

## Frontend Integration

### Constants Path
```typescript
// src/constants/index.ts
URLS: {
  CREATE: '/v1/urls'  // ✅ CORRECT
}
```

### API Service
```typescript
// src/services/ApiService.ts
async function createUrl(data: CreateUrlRequest): Promise<UrlMapping> {
  const response = await axiosInstance.post(API_ENDPOINTS.URLS.CREATE, data);
  return response.data;
}
```

### Full URL
```
https://116.203.197.65/api/v1/urls
```

## Caching

- URL mappings are cached using Caffeine
- Cache key: `urlHash`
- Cache expiration: configured by `CACHE_EXPIRE_MINUTES` (default: 30 minutes)
- Cache is invalidated on URL deletion

## Rate Limiting

- Public create requests use the `public_create` rate-limit policy
- The limiter is implemented with Bucket4j + Caffeine and configured through env-backed policy settings
- `X-Forwarded-For` is only used when the direct remote address matches `RATE_LIMIT_TRUSTED_PROXIES`
- Returns 429 Too Many Requests with `Retry-After` and `X-RateLimit-*` headers when exceeded

## Testing

### Manual Test
```bash
curl -X POST https://116.203.197.65/api/v1/urls \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://www.example.com/long/url",
    "daysCount": 30
  }'
```

### Expected Response
```json
{
  "shortUrl": "https://116.203.197.65/abc123"
}
```

## Edge Cases

1. **Duplicate URL**: Can create a new short URL for the same original URL
2. **URL with Spaces**: Returns 400 error
3. **URL Too Long (>2048)**: Returns 400 error
4. **Invalid URL Format**: Returns 400 error
5. **Expired Token**: Request can still proceed as anonymous because authentication is optional for creation

## Performance

- Hash generation: O(1)
- Database lookup: O(1) with index on `urlHash`
- Cache hit for lookup flows: ~1ms
- Cache miss for lookup flows: ~10-50ms (database query)

## Acceptance Criteria

- [x] User can shorten a valid URL
- [x] Duplicate original URLs can be shortened independently
- [x] Invalid URLs return 400 error
- [x] URLs with spaces are rejected
- [x] URLs over 2048 chars are rejected
- [x] Expiration date is set correctly
- [x] Short URL is unique
- [x] Frontend integration works correctly

## Related Features
- [URL Redirect](url-redirect.md)
