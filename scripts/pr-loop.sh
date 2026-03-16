#!/usr/bin/env bash
# pr-loop.sh
#
# Full agent PR loop:
#   1. Run checks (lint, typecheck, test)
#   2. Run agent self-review
#   3. If review has BLOCKING issues, feed them back to Codex to fix
#   4. Repeat until clean or max iterations reached
#
# Usage:
#   ./scripts/pr-loop.sh "task description or PR title"
#
# The agent writes code, this script closes the feedback loop.

set -euo pipefail

TASK="${1:-Fix issues found in review}"
MAX_ITERATIONS=5
MODEL="${CODEX_MODEL:-o4-mini}"
ITERATION=0

run_checks() {
  echo "==> Running lint..."
  npm run lint 2>&1 || return 1

  echo "==> Running typecheck..."
  npm run typecheck 2>&1 || return 1

  echo "==> Running unit tests..."
  npm test -- --passWithNoTests 2>&1 || return 1

  return 0
}

run_review() {
  bash scripts/agent-review.sh 2>&1
}

extract_blocking() {
  # Returns the BLOCKING section if present
  local review="$1"
  echo "$review" | awk '/### BLOCKING/,/### SUGGESTION|### Summary/' | grep -v '^###'
}

has_blocking() {
  local review="$1"
  echo "$review" | grep -q "REQUEST CHANGES"
}

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  echo ""
  echo "========================================"
  echo "  PR loop iteration $ITERATION / $MAX_ITERATIONS"
  echo "========================================"

  # Step 1: Run checks
  if ! run_checks; then
    echo "==> Checks failed on iteration $ITERATION. Asking Codex to fix..."
    codex --model "$MODEL" \
      "Fix all lint, typecheck, and test failures in the current branch. \
       Run 'npm run lint', 'npm run typecheck', and 'npm test' and fix every error. \
       Do not skip or suppress any errors. \
       See ARCHITECTURE.md and docs/FRONTEND.md for standards."
    continue
  fi

  echo "==> Checks passed."

  # Step 2: Run agent review
  REVIEW=$(run_review)
  echo "$REVIEW"

  if ! has_blocking "$REVIEW"; then
    echo ""
    echo "==> No blocking issues. PR is ready to merge."
    exit 0
  fi

  # Step 3: Feed blocking issues back to Codex
  BLOCKING=$(extract_blocking "$REVIEW")
  echo "==> Blocking issues found. Asking Codex to fix..."

  codex --model "$MODEL" \
    "Fix the following BLOCKING issues found in the agent review of this PR. \
     Address each one. Do not introduce new issues. \
     Consult ARCHITECTURE.md, docs/FRONTEND.md, and docs/RELIABILITY.md as needed.

BLOCKING ISSUES:
$BLOCKING"
done

echo ""
echo "==> Reached max iterations ($MAX_ITERATIONS) without resolving all issues."
echo "    Escalating to human review."
exit 1
