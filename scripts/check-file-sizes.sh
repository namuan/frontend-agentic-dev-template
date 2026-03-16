#!/usr/bin/env bash
# check-file-sizes.sh
#
# Fails if any component file in src/features/ or src/lib/components/ exceeds
# MAX_LINES lines. Run in CI and in the pr-loop.
#
# MESSAGE FOR AGENT: If this script fails, the component is too large.
# Split it into smaller focused components. Business logic should be in a hook.
# See docs/FRONTEND.md#component-patterns.

set -euo pipefail

MAX_LINES=200
FAILED=0

while IFS= read -r -d '' file; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt "$MAX_LINES" ]; then
    echo "[FAIL] $file has $lines lines (max $MAX_LINES)."
    echo "       Split this component. See docs/FRONTEND.md#component-patterns."
    FAILED=1
  fi
done < <(find src/features src/lib/components -name '*.tsx' -print0 2>/dev/null)

if [ $FAILED -eq 1 ]; then
  exit 1
fi

echo "File size check passed."
