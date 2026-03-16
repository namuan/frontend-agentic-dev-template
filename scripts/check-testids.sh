#!/usr/bin/env bash
# check-testids.sh
#
# Warns when <button>, <input>, <select>, or <textarea> elements in feature
# components are missing data-testid attributes.
# This is a warning (exit 0) to avoid being too noisy, but it appears in CI output.
#
# MESSAGE FOR AGENT: Interactive elements need data-testid for Playwright tests.
# Format: data-testid="action-context", e.g. data-testid="submit-login-form".
# See docs/DESIGN.md#data-testid-convention.

set -euo pipefail

MISSING=0

while IFS= read -r -d '' file; do
  # Find interactive elements without data-testid on the same line
  if grep -nP '<(button|input|select|textarea)(?![^>]*data-testid)' "$file" > /dev/null 2>&1; then
    matches=$(grep -nP '<(button|input|select|textarea)(?![^>]*data-testid)' "$file" || true)
    if [ -n "$matches" ]; then
      echo "[WARN] Missing data-testid in $file:"
      echo "$matches" | head -5
      MISSING=1
    fi
  fi
done < <(find src/features -name '*.tsx' -print0 2>/dev/null)

if [ $MISSING -eq 1 ]; then
  echo ""
  echo "Some interactive elements are missing data-testid."
  echo "See docs/DESIGN.md#data-testid-convention."
fi

exit 0  # warning only, not a hard fail
