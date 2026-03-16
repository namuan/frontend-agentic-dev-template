# Tech debt tracker

Items here are known debts. Each has a severity and an owner (agent or human).
The cleanup agent scans this file and opens PRs for items marked `auto-fixable: true`.

## Format

```
### [ID] Short description
- **Severity**: low | medium | high
- **Domain**: features/auth | lib/api | etc.
- **Auto-fixable**: true | false
- **Added**: YYYY-MM-DD
- **Description**: What the problem is and why it matters.
- **Fix**: What needs to happen.
```

---

## Open items

<!-- Add new items above this line -->
