#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-help}"

print_file() {
  local file="$1"
  if [[ -f "$ROOT/$file" ]]; then
    printf '\n===== %s =====\n\n' "$file"
    sed -n '1,240p' "$ROOT/$file"
  fi
}

case "$MODE" in
  auth)
    files=(
      "CLAUDE.md"
      "docs/ai/00-start-here.md"
      "docs/ai/02-api-map.md"
      "docs/ai/03-domain-rules.md"
      "docs/features/auth-signup.md"
      "docs/features/auth-signin.md"
      "docs/features/auth-refresh-token.md"
    )
    ;;
  shorten)
    files=(
      "CLAUDE.md"
      "docs/ai/00-start-here.md"
      "docs/ai/02-api-map.md"
      "docs/ai/03-domain-rules.md"
      "docs/features/url-shorten.md"
    )
    ;;
  redirect)
    files=(
      "CLAUDE.md"
      "docs/ai/00-start-here.md"
      "docs/ai/02-api-map.md"
      "docs/ai/03-domain-rules.md"
      "docs/features/url-redirect.md"
    )
    ;;
  infra)
    files=(
      "CLAUDE.md"
      "docs/ai/01-architecture-map.md"
      "build.gradle.kts"
      "src/main/resources/application.properties"
      "docker-compose.yml"
    )
    ;;
  testing)
    files=(
      "CLAUDE.md"
      "docs/ai/05-test-strategy.md"
    )
    ;;
  ai)
    files=(
      "CLAUDE.md"
      "AGENTS.md"
      "llms.txt"
      "docs/ai/00-start-here.md"
      "docs/ai/01-architecture-map.md"
      "docs/ai/02-api-map.md"
      "docs/ai/03-domain-rules.md"
      "docs/ai/04-change-playbook.md"
      "docs/ai/05-test-strategy.md"
      "docs/ai/06-prompt-templates.md"
      "docs/ai/07-cost-safety-rules.md"
      "docs/ai/repo-map.yaml"
    )
    ;;
  help|*)
    cat <<USAGE
Usage: ./tools/ai-context.sh <mode>

Modes:
  auth      Print compact auth context
  shorten   Print compact URL shorten context
  redirect  Print compact redirect context
  infra     Print compact runtime/config context
  testing   Print compact testing context
  ai        Print the AI context layer only

Example:
  ./tools/ai-context.sh auth
USAGE
    exit 0
    ;;
esac

for file in "${files[@]}"; do
  print_file "$file"
done
