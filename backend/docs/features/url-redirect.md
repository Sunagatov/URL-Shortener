# Feature: URL Redirect

## Overview
Redirects users from a shortened URL to the original destination URL.

## User Story
**As a** user  
**I want to** click on a shortened URL  
**So that** I am redirected to the original website

## API Endpoint
```
GET /{urlHash}
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
Cache-Control: max-age=3600, public, no-transform
Referrer-Policy: no-referrer
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
2. **Lookup URL Mapping**: Query database/cache by urlHash
3. **Check Expiration**: Reject expired mappings with 404
4. **Track Analytics**: Emit an async visit event (link click or QR scan)
5. **Return Redirect**: Send 302 response with Location, Cache-Control, and Referrer-Policy headers

## Redirect Flow

```
User clicks: https://116.203.197.65/abc123
    ↓
Backend receives GET /abc123
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
- Rate limiting applied through the `public_redirect` policy
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
<!--suppress HttpUrlsUsage -->
```nginx
location ~ ^/[1-9A-HJ-NP-Za-km-z]{8}$ {
    proxy_pass http://url-shortener-app:8080;
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
<a href="https://116.203.197.65/abc123">Click here</a>
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
curl -I https://116.203.197.65/abc123

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
2. **Expired URL**: Returns 404 error (expired mappings are rejected, not redirected)
3. **Malformed Hash**: Returns 404 error
4. **Empty Hash**: Returns 404 error
5. **QR Scan**: Append `?qr` to the short URL to track QR scan analytics separately

## Performance

- Database lookup: O(1) with index on `urlHash`
- Average response time: 10-50ms
- Caching: URL mappings cached by configured cache TTL
- Cache hit response time: ~1ms

## Logging

```
INFO: Received redirect request for shortUrl='https://116.203.197.65/abc123' 
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
