# 04 — Change Playbook

## Goal
Reduce token use and avoid broad, noisy work.

## Workflow
1. Classify the task: auth, shorten, redirect, infra, tests.
2. Read the smallest matching context bundle from `00-start-here.md`.
3. Open only the exact source files involved.
4. Make the smallest correct diff.
5. Run targeted verification.
6. Update docs only if behavior or contract changed.

## Read budget rules
- Start with at most **5 files**.
- Only expand if one of those files proves insufficient.
- Do not open whole directories just to “understand the repo”.

## Diff rules
- Avoid opportunistic refactors.
- Avoid renames unless the task requires them.
- Avoid formatting-only churn.
- Preserve public API paths.
- Preserve env variable names unless the task is explicitly about config cleanup.

## Good prompts for coding agents
### Bug fix
“Read only `CLAUDE.md`, `docs/ai/00-start-here.md`, the matching feature doc, and the exact source files needed for this bug. Do not scan the whole repo. Make the smallest safe fix and list targeted verification.”

### Feature work
“Read only the relevant API/domain docs and target package. Reuse existing patterns. Do not refactor unrelated code. Update docs only if the external contract changes.”

### Config fix
“Use `application.properties`, `build.gradle.kts`, and `docker-compose.yml` as primary truth. Call out any README drift separately instead of silently changing behavior.”

## Good search habits
- Search by endpoint path, DTO name, exception text, env var, or property key.
- Search inside one package at a time.
- Search tests only after you know the target production code.
