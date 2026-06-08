# AI Agent Notes

Use this file only as a router. Do not duplicate detailed project knowledge here.

| Need | Read |
| --- | --- |
| Repo-wide boundaries and commands | `AGENTS.md` |
| Local monorepo startup | `README.md` |
| Backend setup and backend environment variables | `backend/README.md` |
| Frontend setup and frontend scripts | `frontend/README.md` |
| Backend feature behavior | `backend/docs/features/*.md` |
| Cross-cutting feature inventory | `docs/features-2026.md` |
| Backend implementation | `backend/src/main/kotlin` and `backend/src/test/kotlin` |
| Frontend implementation | `frontend/src`, `frontend/e2e`, and nearby tests |
| Production deploy/runtime/secrets/observability/backups | Vault |

Rules:

- Prefer source code and tests over stale docs when they disagree.
- Keep agent-specific files as thin pointers to `AGENTS.md`.
- Do not place credentials, production IPs, raw SOPS commands, or one-off deploy recipes in active agent docs.
- Archive historical context instead of letting active agent docs contradict current code.
