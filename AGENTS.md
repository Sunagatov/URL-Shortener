# AGENTS.md

This repository is a Kotlin + Spring Boot backend for a URL shortener.

Use the smallest relevant context for each task.

## Read order
1. README.md
2. build.gradle.kts
3. src/main/resources/application.properties
4. docs/ai/repo-map.md
5. docs/ai/domain-rules.md
6. docs/ai/change-playbook.md

## Main features
- user sign up
- user sign in
- refresh token
- shorten URL
- redirect short URL

## Stack
- Kotlin
- Java 21
- Spring Boot
- MongoDB
- JWT
- Caffeine cache
- Bucket4j
- Springdoc
- Prometheus / Actuator

## Rules
- Prefer minimal diffs.
- Do not read unrelated files.
- Trust runtime config and source code over docs if they disagree.
- Add or update tests for behavior changes.
- Avoid renaming API contracts unless explicitly requested.

## Drift to verify before edits
- token lifetime in docs vs runtime config
- cache TTL in docs vs runtime config
- MongoDB env var name in README vs application.properties

## Useful commands
```bash
./gradlew test
./gradlew bootRun
docker compose up -d mongo
```
