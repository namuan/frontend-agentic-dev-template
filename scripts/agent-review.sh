#!/usr/bin/env bash
# agent-review.sh
#
# Runs an agent review pass on the current branch's diff.
# Invoke from AGENTS.md step 4, or from a PR description check.
#
# Usage:
#   ./scripts/agent-review.sh                  # review current branch vs main
#   ./scripts/agent-review.sh --base my-branch # review vs a specific base
#
# Requirements:
#   - codex CLI installed and authenticated
#   - gh CLI installed (for PR context, optional)
#   - CODEX_MODEL env var (defaults to o4-mini)

set -euo pipefail

BASE="${1:-main}"
MODEL="${CODEX_MODEL:-o4-mini}"
REVIEW_PROMPT_FILE="scripts/prompts/agent-review-prompt.md"

echo "==> Generating diff against $BASE..."
DIFF=$(git diff "$BASE"...HEAD -- '*.ts' '*.tsx' '*.css' '*.json' 2>/dev/null || true)

if [ -z "$DIFF" ]; then
  echo "No diff found. Nothing to review."
  exit 0
fi

DIFF_LENGTH=$(echo "$DIFF" | wc -l)
echo "==> Diff is $DIFF_LENGTH lines. Running agent review..."

# Build the review prompt
PROMPT=$(cat "$REVIEW_PROMPT_FILE")
PROMPT="$PROMPT

<diff>
$DIFF
</diff>"

# Run Codex review
echo "$PROMPT" | codex --model "$MODEL" --quiet

echo ""
echo "==> Agent review complete."
echo "    Address any BLOCKING issues before merging."
echo "    SUGGESTION items are optional but recommended."
