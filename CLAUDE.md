# CLAUDE.md

## Mission
Work in this repository with the **smallest correct change**. Prefer narrow reads, narrow edits, and targeted verification.

## Stable project facts
- Language: **Kotlin 2.1**
- JVM: **Java 21**
- Framework: **Spring Boot 3.5.x**
- Database: **MongoDB**
- Auth: **JWT access + refresh tokens**
- Cache: **Caffeine**
- Rate limiting: **Bucket4j / custom filter**
- Monitoring: **Spring Actuator + Prometheus**
- OpenAPI: **springdoc**

## Read order
For most tasks, read files in this order and stop as soon as you have enough context:
1. `CLAUDE.md`
2. `docs/ai/00-start-here.md`
3. One or two relevant files from `docs/ai/`
4. Relevant feature spec under `docs/features/`
5. Only then read the exact source files you need to change

Do **not** scan the whole repo unless the task explicitly requires broad refactoring.

## High-value runtime files
Read these when the task touches runtime behavior, versions, or configuration:
- `build.gradle.kts`
- `src/main/resources/application.properties`
- `docker-compose.yml`
- `README.md`

## Task routing
### Authentication task
Read:
- `docs/ai/02-api-map.md`
- `docs/ai/03-domain-rules.md`
- `docs/features/auth-signup.md`
- `docs/features/auth-signin.md`
- `docs/features/auth-refresh-token.md`
Then inspect only files under:
- `src/main/kotlin/com/zufar/urlshortener/auth/`
- `src/main/kotlin/com/zufar/urlshortener/common/`
- `src/main/kotlin/com/zufar/urlshortener/user/` if user lookup is involved

### URL shortening task
Read:
- `docs/ai/02-api-map.md`
- `docs/ai/03-domain-rules.md`
- `docs/features/url-shorten.md`
Then inspect only files under:
- `src/main/kotlin/com/zufar/urlshortener/shorten/`
- `src/main/kotlin/com/zufar/urlshortener/common/` if validation, cache, or security is involved

### Redirect task
Read:
- `docs/ai/02-api-map.md`
- `docs/ai/03-domain-rules.md`
- `docs/features/url-redirect.md`
Then inspect only the redirect-related controller/service/repository files.

### Infra/config task
Read:
- `docs/ai/01-architecture-map.md`
- `build.gradle.kts`
- `src/main/resources/application.properties`
- `docker-compose.yml`

## Cheap-working rules
- Prefer reading **1 focused spec + 1 focused source file** over many files.
- Prefer **path-scoped search** over repo-wide search.
- Do not reread large files once already summarized.
- Do not paste large unchanged code blocks into chat.
- Do not rewrite unrelated formatting or imports.
- Preserve existing public contracts unless the task explicitly changes them.

## Public API contracts to protect
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/signin`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/urls`
- `GET /url/{urlHash}`

## Source of truth rule
When prose docs and runtime config disagree, trust this order:
1. actual code
2. `application.properties`
3. `build.gradle.kts`
4. feature docs
5. README prose

## Known drift to remember
- Access token lifetime in docs may differ from runtime defaults.
- Cache TTL mentioned in docs may differ from runtime defaults.
- MongoDB env variable naming differs between README prose and runtime config.

## Before finishing
- Run the smallest relevant verification first.
- If the change is narrow, prefer targeted tests over the entire suite.
- If the change affects contract or config, update the matching doc under `docs/features/` or `docs/ai/`.

## Preferred final report format
1. What changed
2. Why it changed
3. Files touched
4. Verification run
5. Risks / follow-ups
