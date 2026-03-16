# Core beliefs

## Agent-first operating principles

This codebase is designed to be **understood and modified by AI agents**. The project structure,
documentation, and coding patterns prioritize **clarity over cleverness**.

### 1. Clarity is a feature

- Every file has a single, obvious purpose.
- Naming is explicit: prefer `fetchUserById` over `getUser`.
- Comments explain *why* something exists, not what the code does (the code is the *what*).
- No magic numbers, no implicit state, no hidden dependencies.

### 2. Boundaries are explicit

- Domain boundaries are clear and enforced.
- Data crossing a boundary is always validated (see [RELIABILITY.md](../RELIABILITY.md)).
- Each feature is independent—no tight coupling across domains.
- The shared library (`src/lib/`) is lean and grows only when a pattern appears in 2+ features.

### 3. Intent over cleverness

- Prefer straightforward code over concise code.
- Avoid generic abstractions until a pattern is proven (DRY is a guideline, not a law).
- If a pattern requires explanation, it needs documentation or simplification.

### 4. Tests are specifications

- A test should read like a specification of behavior.
- Tests live alongside the code they verify.
- Test data is realistic; mocks are simple and intentional.

### 5. Decisions are recorded

- Technical decisions are captured in `docs/exec-plans/active/` before implementation.
- The rationale is documented so future agents understand the trade-offs.
- Once completed, plans move to `docs/exec-plans/completed/` for reference.

### 6. Documentation grows with the codebase

- Docs are co-located with the code (tests, JSDoc) or in the `docs/` folder.
- The guide in [AGENTS.md](../../AGENTS.md) maps topics to their documentation.
- Every domain has a README (or section in ARCHITECTURE.md) explaining its responsibility.

### 7. Defaults prevent mistakes

- Linting and type checking are strict by default.
- Error messages are informative—they should guide the next step.
- Build tools enforce consistency (formatting, naming, imports).

---

## On agency

Agents can make decisions confidently when:
- The rules are clear and unambiguous.
- The codebase demonstrates the pattern in multiple places.
- The documentation explains the rationale, not just the rule.
- Edge cases are documented.

An agent should feel empowered to:
- Refactor code that violates these principles.
- Improve documentation.
- Propose new patterns when a need emerges.
- Open issues instead of guessing.

An agent should **never**:
- Bypass linting or type checks with `// eslint-disable` without a written reason.
- Make architectural decisions without documenting them.
- Assume a pattern is correct because it appears in legacy code.
