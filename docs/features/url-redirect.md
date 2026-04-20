# Feature: URL Redirect

## Overview
Redirects users from a shortened URL to the original destination URL.

## User Story
**As a** user  
**I want to** click on a shortened URL  
**So that** I am redirected to the original website

## API Endpoint
```
GET /url/{urlHash}
```

## Request

### Headers
```
None required (public endpoint)
```

### Path Parameters
- **urlHash**: The unique identifier of the shortened URL (e.g., `abc123`)

## Response

### Success (302 Found)
```
HTTP/1.1 302 Found
Location: https://www.example.com/original-page
```

### Error Responses

#### 404 Not Found - URL Not Found
```json
{
  "errorMessage": "Original URL is absent for urlHash='abc123'"
}
```

## Business Logic

1. **Extract URL Hash**: Get hash from path parameter
2. **Log Request**: Record IP address and User-Agent
3. **Lookup URL Mapping**: Query database by urlHash
4. **Check Existence**: Verify mapping exists
5. **Return Redirect**: Send 302 response with Location header
6. **Track Analytics** (future): Increment click count

## Redirect Flow

```
User clicks: http://116.203.197.65/url/abc123
    ↓
Backend receives GET /url/abc123
    ↓
Lookup urlHash='abc123' in database
    ↓
Found: originalUrl='https://www.example.com'
    ↓
Return 302 redirect with Location header
    ↓
Browser redirects to https://www.example.com
```

## Security

- No authentication required (public endpoint)
- Rate limiting applied (100 req/min per IP)
- `X-Forwarded-For` is trusted only when the direct peer matches `RATE_LIMIT_TRUSTED_PROXIES`
- URL validation on creation prevents malicious URLs
- Logging of IP and User-Agent for analytics

## Database Query

```kotlin
val urlMapping = urlRepository.findByUrlHash(urlHash)
if (urlMapping.isEmpty) {
    throw UrlNotFoundException("Original URL is absent for urlHash='$urlHash'")
}
return ResponseEntity.status(HttpStatus.FOUND)
    .location(URI(urlMapping.get().originalUrl))
    .build()
```

## Nginx Configuration

### Current Setup
```nginx
location /url/ {
    proxy_pass http://url-shortener-app:8080/url/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## Frontend Integration

### Not Applicable
This is a direct browser redirect, no frontend JavaScript involved.

### Usage Example
```html
<a href="http://116.203.197.65/url/abc123">Click here</a>
```

## Analytics (Future Enhancement)

### Planned Features
- Click count tracking
- Geographic location (from IP)
- Device type (from User-Agent)
- Referrer tracking
- Time-based analytics

### Database Schema (Future)
```json
{
  "urlHash": "abc123",
  "clicks": [
    {
      "timestamp": "2024-03-14T10:30:00Z",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "country": "USA",
      "device": "mobile"
    }
  ]
}
```

## Testing

### Manual Test
```bash
# Test redirect
curl -I http://116.203.197.65/url/abc123

# Expected response
HTTP/1.1 302 Found
Location: https://www.example.com/original-page
```

### Browser Test
1. Create a short URL via API
2. Copy the short URL
3. Paste in browser address bar
4. Verify redirect to original URL

## Edge Cases

1. **Non-existent Hash**: Returns 404 error
2. **Expired URL**: Still redirects (expiration cleanup is async)
3. **Malformed Hash**: Returns 404 error
4. **Empty Hash**: Returns 404 error

## Performance

- Database lookup: O(1) with index on `urlHash`
- Average response time: 10-50ms
- Caching: URL mappings cached by configured cache TTL
- Cache hit response time: ~1ms

## Logging

```
INFO: Received redirect request for shortUrl='http://116.203.197.65/url/abc123' 
      from IP='192.168.1.1', User-Agent='Mozilla/5.0...'
INFO: Redirecting to the originalUrl='https://www.example.com'
```

## Acceptance Criteria

- [x] Valid short URL redirects to original URL
- [x] Invalid hash returns 404 error
- [x] Redirect uses 302 status code
- [x] IP and User-Agent are logged
- [x] Response time < 100ms
- [x] Works in all browsers

## Related Features
- [Shorten URL](url-shorten.md)
