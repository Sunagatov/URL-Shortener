# 06 — Prompt Templates

These templates are designed to keep AI coding sessions cheaper.

## 1. Narrow bug-fix prompt
```text
Read only CLAUDE.md, docs/ai/00-start-here.md, docs/ai/03-domain-rules.md, the matching feature doc, and the exact source files needed for this bug.
Do not scan the whole repository.
Make the smallest safe fix.
Then list:
1) root cause,
2) files changed,
3) exact verification run,
4) any remaining risk.
```

## 2. Auth task prompt
```text
This task is in the auth area.
Read only:
- CLAUDE.md
- docs/ai/02-api-map.md
- docs/ai/03-domain-rules.md
- docs/features/auth-signup.md
- docs/features/auth-signin.md
- docs/features/auth-refresh-token.md
Then inspect only the exact auth/common/user source files you need.
Avoid broad scans and unrelated refactors.
```

## 3. URL shorten task prompt
```text
This task is in the URL shorten area.
Read only:
- CLAUDE.md
- docs/ai/02-api-map.md
- docs/ai/03-domain-rules.md
- docs/features/url-shorten.md
Then inspect only the exact shorten/common source files involved.
Preserve endpoint path and duplicate-URL behavior unless the task says otherwise.
```

## 4. Redirect task prompt
```text
This task is in the redirect area.
Read only:
- CLAUDE.md
- docs/ai/02-api-map.md
- docs/ai/03-domain-rules.md
- docs/features/url-redirect.md
Then inspect only the redirect-related files.
Keep the redirect hot path simple.
```

## 5. Config drift prompt
```text
Check runtime truth first.
Use application.properties, build.gradle.kts, docker-compose.yml, and code as primary truth.
If docs disagree, report the drift explicitly instead of guessing.
```
