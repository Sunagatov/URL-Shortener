# Environment Variables Configuration

This document describes all configurable environment variables for the URL Shortener application.

## Server Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SERVER_BASE_URL` | Base URL for the application | - | `http://localhost:8080` |
| `SERVER_PORT` | Port the server listens on | `8080` | `8080` |

## Security

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | `defaultSecretKey...` | `your-secret-key-here` |
| `JWT_ACCESS_TOKEN_EXPIRATION` | Access token expiration in milliseconds | `3600000` (1 hour) | `3600000` |
| `JWT_REFRESH_TOKEN_EXPIRATION` | Refresh token expiration in milliseconds | `604800000` (7 days) | `604800000` |

## Database

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `MONGODB_URI` | MongoDB connection URI | - | `mongodb://localhost:27018` |
| `MONGODB_DATABASE` | MongoDB database name | - | `urlshortener` |

## CORS

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:3000` | `http://localhost:3000,http://localhost:3001` |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | Comma-separated wildcard origin patterns | `http://localhost:*,http://127.0.0.1:*` | `https://*.yourdomain.com` |

## Rate Limiting

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `RATE_LIMIT_REQUESTS` | Maximum requests per minute per IP | `100` | `1000` (dev), `100` (prod) |

## Cache

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `CACHE_MAX_SIZE` | Maximum number of cached entries | `10000` | `10000` |
| `CACHE_EXPIRE_MINUTES` | Cache entry expiration in minutes | `30` | `30` |
| `CACHE_NAMES` | Comma-separated list of cache names | `urlMappings,userDetails` | `urlMappings,userDetails` |

## API Docs

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `API_DOCS_ENABLED` | Enable/disable the OpenAPI JSON and Scalar API reference | `true` | `false` (prod), `true` (dev) |
| `SWAGGER_ENABLED` | Legacy alias for `API_DOCS_ENABLED` | `true` | `false` (prod), `true` (dev) |
| `SCALAR_PATH` | Public path for the Scalar API reference | `/api/v1/docs` | `/docs` |
| `SCALAR_THEME` | Scalar theme preset | `bluePlanet` | `deepSpace` |
| `SCALAR_LAYOUT` | Scalar layout mode | `modern` | `classic` |
| `SCALAR_DARK_MODE` | Force dark mode in Scalar | `false` | `true` |

## Logging

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `LOG_LEVEL_ROOT` | Root logger level | `WARN` | `WARN`, `INFO`, `DEBUG` |
| `LOG_LEVEL_MONGODB` | MongoDB driver log level | `WARN` | `WARN`, `INFO`, `DEBUG` |
| `LOG_LEVEL_SPRING_DATA` | Spring Data log level | `WARN` | `WARN`, `INFO`, `DEBUG` |
| `LOG_LEVEL_SPRING_WEB` | Spring Web log level | `WARN` | `WARN`, `INFO`, `DEBUG` |
| `LOG_LEVEL_APP` | Application log level | `INFO` | `WARN`, `INFO`, `DEBUG` |
| `LOG_MAX_FILE_SIZE` | Maximum log file size before rotation | `10MB` | `10MB`, `50MB` |
| `LOG_MAX_HISTORY` | Number of log files to keep | `30` | `30`, `90` |

## Scheduler

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SCHEDULER_URL_EXPIRATION_CRON` | Cron expression for URL expiration cleanup | `0 0 0 * * *` (midnight daily) | `0 0 2 * * *` (2 AM daily) |

## Environment-Specific Configurations

### Development (.env)
```bash
SERVER_BASE_URL=http://localhost:8080
SERVER_PORT=8080
JWT_SECRET=mySecretKey123456789012345678901234567890
MONGODB_URI=mongodb://localhost:27018
MONGODB_DATABASE=urlshortener
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ALLOWED_ORIGIN_PATTERNS=http://localhost:*,http://127.0.0.1:*
RATE_LIMIT_REQUESTS=1000
API_DOCS_ENABLED=true
LOG_LEVEL_APP=DEBUG
```

### Production (.env.prod)
```bash
SERVER_BASE_URL=https://yourdomain.com
SERVER_PORT=8080
JWT_SECRET=<strong-random-secret>
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=urlshortener
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_ALLOWED_ORIGIN_PATTERNS=https://*.yourdomain.com
RATE_LIMIT_REQUESTS=100
API_DOCS_ENABLED=false
LOG_LEVEL_APP=INFO
```

## Docker Compose Usage

All environment variables can be set in `docker-compose.yml`.

If you are inside `backend/`, that means `backend/docker-compose.yml`.
If you are at the monorepo root, that means the root `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - SERVER_BASE_URL=http://localhost:8080
      - JWT_SECRET=${JWT_SECRET}
      - MONGODB_URI=${MONGODB_URI}
      - CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
      - RATE_LIMIT_REQUESTS=1000
```

## Security Best Practices

1. **Never commit `.env` or `.env.prod` files** - They are in `.gitignore`
2. **Use strong JWT secrets** - Generate with: `openssl rand -base64 64`
3. **Disable public API docs in production** - Set `API_DOCS_ENABLED=false`
4. **Use restrictive CORS** - Only allow trusted origins
5. **Set appropriate rate limits** - Lower for production, higher for development
6. **Use MongoDB Atlas** - For production with proper authentication
