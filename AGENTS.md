# AGENTS.md

This repository already contains good human-facing docs. To keep AI coding sessions cheaper and faster, use the AI docs layer instead of scanning the whole codebase.

## Start here
1. Read `CLAUDE.md`
2. Read `docs/ai/00-start-here.md`
3. Read only the task-specific AI doc and feature spec you need
4. Read the exact source files you plan to change

## Goal
Minimize token use by avoiding broad scans and repeated rediscovery of stable project facts.

## What this app is
A Kotlin + Spring Boot backend for URL shortening with MongoDB, JWT auth, Caffeine cache, rate limiting, Swagger/OpenAPI, and Prometheus/Actuator.

## Important runtime surfaces
- build and dependencies: `build.gradle.kts`
- runtime config: `src/main/resources/application.properties`
- local infra: `docker-compose.yml`
- feature contracts: `docs/features/*.md`
- AI navigation layer: `docs/ai/*.md`

## Safe operating rules
- Make the smallest correct diff.
- Avoid changing unrelated files.
- Prefer targeted tests.
- Preserve public API paths unless the task explicitly changes them.
- When docs conflict with config, trust runtime config and code first.
