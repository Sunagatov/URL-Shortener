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
Authorization: Bearer {accessToken}
```

### Body
```json
{
  "originalUrl": "https://www.example.com/some/very/long/url/path",
  "daysCount": 30
}
```

### Validation Rules
- **originalUrl**: Required, valid URL format, max 2048 characters, no spaces
- **daysCount**: Optional, positive integer (default: 30 days)

## Response

### Success (200 OK)
```json
{
  "shortUrl": "http://116.203.197.65/url/abc123"
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

#### 401 Unauthorized
```json
{
  "errorMessage": "Unauthorized access."
}
```

## Business Logic

1. **Validate URL**: Check format, length, and no spaces
2. **Trim URL**: Remove leading/trailing whitespace
3. **Generate Hash**: Create SHA-256 hash of original URL
4. **Check Existing**: Look for existing mapping with same hash
5. **Return Existing or Create New**:
   - If exists: Return existing short URL
   - If new: Create mapping and return new short URL
6. **Set Expiration**: Calculate expiration date (now + daysCount)
7. **Save to Database**: Store URL mapping
8. **Return Response**: Send short URL to client

## URL Hash Generation

```kotlin
fun encode(originalUrl: String): String {
    val messageDigest = MessageDigest.getInstance("SHA-256")
    val hashBytes = messageDigest.digest(originalUrl.toByteArray())
    return Base64.getUrlEncoder()
        .withoutPadding()
        .encodeToString(hashBytes)
        .substring(0, 8)
}
```

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
static async createUrl(data: CreateUrlRequest): Promise<UrlMapping> {
  const response = await axiosInstance.post(API_ENDPOINTS.URLS.CREATE, data);
  return response.data;
}
```

### Full URL
```
http://116.203.197.65/api/v1/urls
```

## Caching

- URL mappings are cached using Caffeine
- Cache key: `urlHash`
- Cache expiration: 1 hour
- Cache is invalidated on URL deletion

## Rate Limiting

- Rate limit: 100 requests per minute per IP
- Implemented using custom RateLimitFilter
- Returns 429 Too Many Requests when exceeded

## Testing

### Manual Test
```bash
curl -X POST http://116.203.197.65/api/v1/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "originalUrl": "https://www.example.com/long/url",
    "daysCount": 30
  }'
```

### Expected Response
```json
{
  "shortUrl": "http://116.203.197.65/url/abc123"
}
```

## Edge Cases

1. **Duplicate URL**: Returns existing short URL (idempotent)
2. **URL with Spaces**: Returns 400 error
3. **URL Too Long (>2048)**: Returns 400 error
4. **Invalid URL Format**: Returns 400 error
5. **Expired Token**: Returns 401 error

## Performance

- Hash generation: O(1)
- Database lookup: O(1) with index on `urlHash`
- Cache hit: ~1ms
- Cache miss: ~10-50ms (database query)

## Acceptance Criteria

- [x] User can shorten a valid URL
- [x] Duplicate URLs return same short URL
- [x] Invalid URLs return 400 error
- [x] URLs with spaces are rejected
- [x] URLs over 2048 chars are rejected
- [x] Expiration date is set correctly
- [x] Short URL is unique
- [x] Frontend integration works correctly

## Related Features
- [URL Redirect](url-redirect.md)
- [Get URL Mappings](url-list.md)
- [Delete URL](url-delete.md)
- [Get URL Details](url-details.md)
