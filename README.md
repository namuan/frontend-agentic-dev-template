# Agent-first React development setup

A structured harness for building React applications with Codex CLI as the primary
code author. Based on the approach described in
[Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
by Ryan Lopopolo at OpenAI.

**The core principle:** humans design the environment and specify intent. Agents execute.
Every line of production code is written by Codex. Human engineers ask: *"what capability
is missing that would let the agent do this reliably?"* — and build that capability into
the repo itself.

---

## Table of contents

1. [How this works](#how-this-works)
2. [Prerequisites](#prerequisites)
3. [Repository structure](#repository-structure)
4. [Phase 1 — Repo knowledge setup](#phase-1--repo-knowledge-setup)
5. [Phase 2 — PR feedback loop](#phase-2--pr-feedback-loop)
6. [Phase 3 — Mechanical enforcement](#phase-3--mechanical-enforcement)
7. [Phase 4 — App legibility](#phase-4--app-legibility)
8. [Daily workflow](#daily-workflow)
9. [Weekly maintenance](#weekly-maintenance)
10. [Tuning the system over time](#tuning-the-system-over-time)
11. [Troubleshooting](#troubleshooting)
12. [File reference](#file-reference)

---

## How this works

Traditional development: engineers write code, tests, and docs.

Agent-first development: engineers write *the environment* — docs, lints, feedback loops,
and scripts — that allow Codex to write correct code reliably at high throughput.

The leverage comes from encoding decisions *once* and having them apply automatically to
every line of code Codex writes from that point forward. A linting rule about cross-domain
imports, written once, never needs to be re-explained. An architectural decision committed
to `ARCHITECTURE.md` is available to every future agent run without human intervention.

```
You write:          Codex writes:
─────────────       ─────────────────────────────────────
AGENTS.md      →    Pull requests
ARCHITECTURE   →    Components, hooks, API calls
docs/          →    Tests (Jest + Playwright)
lints          →    Documentation updates
scripts/       →    CI config, tooling
```

The result from the OpenAI team: ~1 million lines of code, 1,500 PRs, 3.5 PRs per
engineer per day, built in roughly 1/10th the time of manual development.

---

## Prerequisites

Install and authenticate these tools before starting:

```bash
# Node.js 20+
node --version

# Codex CLI
npm install -g @openai/codex
codex auth login

# GitHub CLI (for PR automation)
gh auth login

# Playwright (already in your project)
npx playwright install
```

Set your preferred model:
```bash
export CODEX_MODEL=o4-mini   # or o3, o4, etc.
# Add this to your shell profile (.zshrc / .bashrc)
```

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

---

## Repository structure

```
your-react-app/
│
├── AGENTS.md                          # ← Codex reads this first on every task
├── ARCHITECTURE.md                    # Domain map, dependency rules, state decisions
│
├── docs/
│   ├── DESIGN.md                      # Design system, component library, data-testid
│   ├── FRONTEND.md                    # React coding standards, patterns, testing rules
│   ├── QUALITY_SCORE.md               # Living quality grades per domain (agent-updated)
│   ├── RELIABILITY.md                 # Zod boundary validation, error handling patterns
│   ├── SECURITY.md                    # Security invariants (create this for your app)
│   ├── design-docs/
│   │   ├── index.md                   # Index of all design decisions
│   │   └── core-beliefs.md            # Agent-first operating principles
│   ├── exec-plans/
│   │   ├── active/                    # Plans currently in progress
│   │   │   └── TEMPLATE.md            # Copy this when starting non-trivial work
│   │   ├── completed/                 # Archive finished plans here
│   │   └── tech-debt-tracker.md       # Known debts with severity and fix instructions
│   ├── generated/
│   │   └── db-schema.md               # Auto-generated, do not edit manually
│   ├── product-specs/
│   │   └── index.md                   # Index of product feature specs
│   └── references/
│       └── *.llms.txt                 # LLM-friendly docs for key dependencies
│
├── scripts/
│   ├── agent-review.sh                # Run a Codex review pass on current branch
│   ├── pr-loop.sh                     # Full checks → review → fix → repeat loop
│   ├── garbage-collect.sh             # Weekly cleanup agent
│   ├── check-file-sizes.sh            # Fail if component > 200 lines
│   ├── check-testids.sh               # Warn on missing data-testid
│   └── prompts/
│       └── agent-review-prompt.md     # The reviewer system prompt — tune this
│
├── src/
│   ├── features/                      # Vertical feature domains (add yours here)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── settings/
│   ├── lib/                           # Cross-cutting, domain-agnostic code
│   │   ├── api/                       # Fetch wrapper, error types, Zod boundaries
│   │   ├── components/                # Pure shared UI components
│   │   ├── hooks/                     # Shared hooks
│   │   ├── styles/                    # tokens.css, global styles
│   │   ├── types/                     # Global TS types, shared Zod schemas
│   │   └── utils/                     # Pure utility functions
│   └── app/
│       ├── App.tsx
│       ├── router.tsx
│       └── providers.tsx
│
└── tests/
    ├── e2e/                           # Playwright specs, one file per user journey
    └── fixtures/                      # Shared test data, Page Object Models
```

---

## Phase 1 — Repo knowledge setup

**Goal:** Give Codex a coherent map of the repo so it can navigate intentionally, not
pattern-match blindly.

### Step 1 — Copy the scaffold into your repo

```bash
# From this repo, copy into your React project root
cp AGENTS.md /path/to/your-app/
cp ARCHITECTURE.md /path/to/your-app/
cp -r docs/ /path/to/your-app/docs/
cp -r scripts/ /path/to/your-app/scripts/
cp .eslintrc.cjs /path/to/your-app/
```

### Step 2 — Adapt ARCHITECTURE.md to your actual domains

Open `ARCHITECTURE.md` and replace the placeholder domains with your real feature names:

```bash
# Example: rename the domains
# features/auth      → already accurate if you have auth
# features/dashboard → rename to features/analytics, features/home, etc.
# features/settings  → keep or rename

# Also update the dependency rules section to match your actual folders
```

Then update the `import/no-restricted-paths` zones in `.eslintrc.cjs` to match:

```js
// Replace each 'target' path with your actual domain folders
{ target: './src/features/YOUR_DOMAIN', from: './src/features', except: ['./YOUR_DOMAIN'] }
```

### Step 3 — Install required ESLint plugins

```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-plugin-import \
  eslint-plugin-react \
  eslint-plugin-react-hooks
```

Run lint to confirm it works:
```bash
npm run lint
```

Fix any existing violations before starting agent tasks. An agent that inherits a
pre-existing messy lint baseline will have a confused starting point.

### Step 4 — Create your first product spec

For any feature you plan to build, write a spec in `docs/product-specs/` before
asking Codex to implement it. Use this format:

```markdown
# Feature: [Name]

## Problem
What user need does this address?

## Acceptance criteria
- [ ] User can do X
- [ ] System does Y when Z
- [ ] Error state: if W fails, user sees message M

## Out of scope
What this feature deliberately does not do.

## Open questions
Anything unresolved that the agent should surface, not guess at.
```

Specs are what turn vague prompts into reliable implementations. The richer the
acceptance criteria, the less you need to review the output.

### Step 5 — Verify AGENTS.md points to real files

Read through `AGENTS.md` and confirm every doc it references actually exists in your
repo. Remove or update any pointers to files you haven't created yet. A broken pointer
in `AGENTS.md` silently degrades every agent run.

---

## Phase 2 — PR feedback loop

**Goal:** Codex opens a PR, reviews its own work, fixes blocking issues, and only
escalates to you when genuine judgment is needed.

### The loop in plain English

```
1. You give Codex a task (one prompt)
2. Codex writes code and opens a PR
3. agent-review.sh reads the diff and produces a structured review
4. If BLOCKING issues exist → Codex fixes them and loops back to step 3
5. If no BLOCKING issues → PR is ready, you do a final human scan
6. Merge
```

### Running a task end-to-end

```bash
# Option A: Give Codex the task and run the full loop manually
codex "Add a user profile page that shows name, email, and avatar.
       See docs/product-specs/user-profile.md for acceptance criteria."

# Once Codex finishes, run the PR loop to validate and clean up
npm run agent:pr-loop "User profile page"

# Option B: Let pr-loop.sh drive the whole thing (checks + review + fix)
npm run agent:pr-loop "Add user profile page per docs/product-specs/user-profile.md"
```

### What the review catches

The reviewer prompt at `scripts/prompts/agent-review-prompt.md` flags:

| Category | Examples |
|---|---|
| **BLOCKING** | Missing Zod parse on API response, cross-domain import, `any` type, missing `data-testid`, component > 200 lines, unhandled error/loading state |
| **SUGGESTION** | Business logic in JSX, raw `<input>` instead of shared component, hook missing error state test |
| **Ignored** | Style preferences, valid naming alternatives, added comments |

### Tuning the reviewer prompt

The reviewer prompt is the most important thing to tune over time. After each real PR:

- Did it miss something important? Add it to the BLOCKING section.
- Did it flag false positives that slowed you down? Remove or relax that rule.
- Is a new pattern emerging in your codebase? Add a check for it.

The prompt is in plain Markdown — edit it like any other doc, commit it, and the next
agent run picks it up automatically.

### Human review

You do *not* need to review every PR line by line. Your job is:

1. Read the PR description (Codex writes this).
2. Check whether the acceptance criteria in the spec are met.
3. Open the app and do a quick smoke test for UI changes.
4. Merge if satisfied.

Reserve deep code review for PRs touching `src/lib/` shared infrastructure —
those have wider blast radius and are worth more scrutiny.

---

## Phase 3 — Mechanical enforcement

**Goal:** Encode architectural taste as linting rules and CI checks, so Codex can never
accidentally violate them, even at high throughput.

### What's enforced automatically

| Rule | Enforcement | What happens on violation |
|---|---|---|
| No cross-domain feature imports | `eslint-plugin-import` | CI fails, agent sees the error message |
| No `any` type | `@typescript-eslint` | CI fails |
| No `console.log` in production | ESLint | CI fails |
| Components ≤ 200 lines | `check-file-sizes.sh` | CI fails |
| All tests pass | `npm test` in `pr-loop.sh` | Loop iteration retries |
| TypeScript compiles | `tsc --noEmit` | Loop iteration retries |
| `data-testid` on interactive elements | `check-testids.sh` | CI warns (not blocking) |

### Making error messages work for agents

The most important property of a linting rule in an agent-first repo is its **error
message**. When the lint fails, the error text appears directly in Codex's context.
Write messages that tell the agent exactly what to do:

```js
// ❌ Unhelpful message (agent has to guess)
message: 'Cross-domain import not allowed'

// ✅ Actionable message (agent knows the fix)
message: '[ARCH] features/auth must not import from other feature domains. ' +
         'Move shared code to src/lib/ first. See ARCHITECTURE.md.'
```

When you add a new linting rule, always write the error message this way.

### Adding your own rules

As patterns emerge in your codebase, encode them. Common additions:

```js
// Enforce that React Query is used for data fetching (not raw useEffect + fetch)
// Enforce that Modal usage always includes an aria-label
// Enforce that route components are always lazy-loaded
// Enforce naming convention for Zod schemas (*Schema suffix)
```

Add each rule to `.eslintrc.cjs` with a message that explains both the rule and the fix.

### Adding structural tests

For constraints that ESLint can't express, write Jest tests in `tests/architecture/`:

```ts
// tests/architecture/dependencies.test.ts
import { findImports } from './helpers';

test('lib/components does not import from lib/api', () => {
  const violations = findImports('src/lib/components', 'src/lib/api');
  expect(violations).toHaveLength(0);
});
```

---

## Phase 4 — App legibility

**Goal:** Let Codex see and interact with the running application so it can validate
its own UI changes, reproduce bugs, and verify fixes without human QA.

This phase requires more setup but delivers the biggest autonomy gains. Once Codex can
boot the app, take screenshots, and query its own logs, prompts like *"fix the bug where
the dashboard crashes on empty data"* become fully autonomous — the agent can reproduce
the bug, fix it, and verify the fix without any human involvement.

### Step 1 — Make the app bootable per worktree

Each Codex task runs in its own git worktree. Configure the app to boot in isolation:

```bash
# vite.config.ts — use WORKTREE_ID to avoid port conflicts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: parseInt(process.env.VITE_PORT ?? '5173'),
  },
});
```

```bash
# scripts/boot-worktree.sh
#!/usr/bin/env bash
WORKTREE_ID="${1:-default}"
PORT=$((5173 + RANDOM % 1000))
echo "Booting worktree $WORKTREE_ID on port $PORT"
VITE_PORT=$PORT npm run dev &
echo $! > /tmp/worktree-$WORKTREE_ID.pid
echo "http://localhost:$PORT" > /tmp/worktree-$WORKTREE_ID.url
```

### Step 2 — Expose Playwright to Codex

Playwright is your biggest advantage here — it's already set up for E2E tests, so
you can point Codex at it for validation too.

Add a skill to `AGENTS.md`:

```markdown
## Validating UI changes

To verify a UI change visually:
1. Run `bash scripts/boot-worktree.sh` to start the app
2. Run `npx playwright test tests/e2e/YOUR_JOURNEY.spec.ts --headed` to see it
3. Or run `npx playwright screenshot --url http://localhost:5173/path` for a quick check

For bug reproduction:
1. Write a failing Playwright test that reproduces the bug first
2. Fix the code until the test passes
3. Include the test in the PR
```

### Step 3 — Add a screenshot skill

```bash
# scripts/screenshot.sh
#!/usr/bin/env bash
# Usage: bash scripts/screenshot.sh /dashboard output.png
URL="http://localhost:${VITE_PORT:-5173}$1"
OUTPUT="${2:-screenshot.png}"
npx playwright screenshot "$URL" "$OUTPUT" --full-page
echo "Screenshot saved to $OUTPUT"
```

With this in place, Codex can screenshot its own changes and reason about visual regressions.

### Step 4 — Add MSW for isolated E2E runs

Use Mock Service Worker so Codex can run E2E tests against deterministic data without
needing a real backend:

```bash
npm install --save-dev msw
```

```ts
// tests/fixtures/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);

// tests/fixtures/handlers.ts — define your API mocks here
// Codex can add handlers as it builds features
```

---

## Daily workflow

This is the typical rhythm once the system is running.

### Starting a task

```bash
# 1. Write or find the product spec
cat docs/product-specs/my-feature.md

# 2. Create an exec plan for non-trivial work
cp docs/exec-plans/active/TEMPLATE.md docs/exec-plans/active/my-feature.md
# Fill in goal, acceptance criteria, and steps

# 3. Give Codex the task
codex "Implement the feature described in docs/product-specs/my-feature.md.
       Follow the exec plan in docs/exec-plans/active/my-feature.md.
       Write Jest tests for all hooks and a Playwright E2E test for the happy path."

# 4. Run the PR loop
npm run agent:pr-loop "My feature"
```

### Reviewing a PR

```bash
# See what Codex opened
gh pr list

# Review the description and diff
gh pr view --web

# Run E2E tests against the PR branch
git checkout pr-branch
npm run e2e

# Merge if satisfied
gh pr merge --squash
```

### When the agent gets stuck

Signs that the environment needs improvement rather than the prompt:

| Symptom | Root cause | Fix |
|---|---|---|
| Codex keeps making the same architectural mistake | Rule not in linter | Add ESLint rule with actionable message |
| Codex writes the same utility function repeatedly | Not discoverable in `src/lib/` | Add it to `src/lib/utils/` and document it in `docs/FRONTEND.md` |
| Codex guesses at API shapes | No Zod schema exists | Write the schema, add it to `src/lib/types/` |
| Codex makes wrong product decisions | Spec is ambiguous | Sharpen the acceptance criteria |
| PR loop hits max iterations | Task too large | Break it into smaller tasks with individual specs |

The rule: **never just re-prompt with more words**. Identify what's missing from the
environment and add it there.

---

## Weekly maintenance

Run the garbage collection agent once a week, ideally in a scheduled CI job:

```bash
npm run agent:gc
```

This opens a PR that:
- Updates `docs/QUALITY_SCORE.md` with current grades per domain
- Adds `TODO(gc)` comments on API calls missing Zod boundary validation
- Consolidates duplicated utility functions into `src/lib/utils/`
- Fixes stale references in `ARCHITECTURE.md` and `docs/DESIGN.md`

These PRs are typically trivial to review (under a minute) and can be auto-merged
if CI passes. Set up a GitHub Actions schedule:

```yaml
# .github/workflows/gc.yml
on:
  schedule:
    - cron: '0 9 * * MON'   # Every Monday at 9am UTC

jobs:
  gc:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run agent:gc
        env:
          CODEX_MODEL: o4-mini
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### What to review from the GC output

The quality score update is the most valuable output. Watch for:
- Any domain dropping to C or below → create an exec plan to address it
- `lib/api` boundary validation grade → should never drop below B
- E2E coverage gaps → assign a Playwright task

---

## Tuning the system over time

### The docs are the product

Treat `docs/` as carefully as `src/`. When you make an architectural decision,
write it down in `ARCHITECTURE.md` or a design doc *before* asking Codex to implement it.
If the decision only exists in your head, it doesn't exist for the agent.

### Progressive disclosure

Keep `AGENTS.md` short and stable. Put depth in the files it points to. Every time you
find yourself wanting to add a long explanation to `AGENTS.md`, ask: does this belong
in `docs/FRONTEND.md`, `docs/RELIABILITY.md`, or a new doc?

### Golden principles

As patterns solidify, encode them as explicit "golden principles" — opinionated,
mechanical rules that keep the codebase consistent for future agent runs. Add them to
the relevant doc and, where possible, to the linter.

Current golden principles (update this list as yours evolve):
- Parse external data at the boundary with Zod — never trust raw response shapes.
- Prefer shared utilities in `src/lib/` over hand-rolled helpers in feature folders.
- Every interactive element gets a `data-testid` — no exceptions.
- Components over 200 lines are always a smell — split them.
- Business logic lives in hooks, not in JSX.

### When to escalate to a human

The agent should handle: implementation, refactoring, bug fixing, test writing, doc updates.

Escalate to a human when:
- A product decision is genuinely ambiguous and the spec doesn't resolve it.
- A change touches security, authentication, or payment flows — have a human review.
- Two architectural approaches are both valid and the tradeoffs need a judgment call.
- The PR loop hits max iterations — the task is probably too large or under-specified.

---

## Troubleshooting

### `npm run lint` fails with "Cannot find module 'eslint-plugin-import'"

```bash
npm install --save-dev eslint-plugin-import
```

### `pr-loop.sh` exits after 1 iteration with no output

Check that `codex` is in your PATH and authenticated:
```bash
which codex
codex auth status
```

### Codex ignores ARCHITECTURE.md

Add this to the top of `AGENTS.md`:
```markdown
**Before writing any code, read ARCHITECTURE.md in full.**
Your first message must confirm which domain this task touches.
```

Explicit instruction in `AGENTS.md` is more reliable than hoping the agent
navigates there via the table of contents.

### The reviewer flags everything as BLOCKING

Your reviewer prompt is too aggressive. Open `scripts/prompts/agent-review-prompt.md`
and move some rules from BLOCKING to SUGGESTION. The goal is to block on correctness,
not style.

### `garbage-collect.sh` opens PRs with no changes

This is fine — it means the codebase is clean. Check the output for "No changes found."
If it consistently finds nothing, consider adding more checks to the GC script.

---

## File reference

| File | Purpose | Who updates it |
|---|---|---|
| `AGENTS.md` | Entry point for every agent run — the map | Human (keep short) |
| `ARCHITECTURE.md` | Domain layout, dependency rules, state decisions | Human |
| `docs/FRONTEND.md` | React standards, patterns, testing rules | Human |
| `docs/RELIABILITY.md` | Zod patterns, error handling, QueryClient config | Human |
| `docs/DESIGN.md` | Design tokens, shared components, `data-testid` rules | Human |
| `docs/QUALITY_SCORE.md` | Current quality grades per domain | GC agent (weekly) |
| `docs/exec-plans/active/*.md` | Work-in-progress plans | Human + agent |
| `docs/exec-plans/completed/*.md` | Archived finished plans | Human (move from active) |
| `docs/exec-plans/tech-debt-tracker.md` | Known debt with severity and fix notes | GC agent + human |
| `docs/product-specs/*.md` | Feature acceptance criteria | Human |
| `docs/references/*.llms.txt` | LLM-readable dependency docs | Human (update with deps) |
| `.eslintrc.cjs` | Architecture-enforcing linting rules | Human |
| `scripts/agent-review.sh` | Runs a review pass on the current branch diff | Do not edit |
| `scripts/pr-loop.sh` | Full checks → review → fix → repeat loop | Do not edit |
| `scripts/prompts/agent-review-prompt.md` | Reviewer system prompt | Human (tune regularly) |
| `scripts/garbage-collect.sh` | Weekly cleanup pass | Human (add checks as needed) |
| `scripts/check-file-sizes.sh` | Fails CI if component > 200 lines | Do not edit |
| `scripts/check-testids.sh` | Warns on missing `data-testid` | Do not edit |