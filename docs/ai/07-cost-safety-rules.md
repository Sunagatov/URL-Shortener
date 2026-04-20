# 07 — Cost + Safety Rules

## Spend fewer tokens
- Read narrow, not broad.
- Reuse existing summaries in `docs/ai/`.
- Prefer stable context files over rediscovering facts from many source files.
- Do not repeat already-confirmed repo facts.
- Do not dump large file contents into chat.

## Avoid expensive failure modes
- Do not assume prose docs are fully current.
- Do not assume one auth token duration from docs without checking runtime config.
- Do not assume one MongoDB env key from README prose without checking runtime config.
- Do not assume cache TTL from README or feature docs without checking properties.

## Safe defaults
- smallest diff
- targeted verification
- explicit risk callout if uncertain
- update docs when contracts actually change
