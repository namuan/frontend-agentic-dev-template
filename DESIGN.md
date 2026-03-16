# Design system

## Tokens

All visual values come from CSS custom properties in `src/lib/styles/tokens.css`.
Never use raw hex codes, pixel values, or font names outside of that file.

```css
/* Usage */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  color: var(--color-text-primary);
}
```

## Shared component library

Reusable components live in `src/lib/components/`. Before creating a new component
in a feature domain, check whether a generic version belongs here instead.

Current shared components:
- `Button` — variants: primary, secondary, ghost, destructive
- `Input`, `Textarea`, `Select` — always use these, never raw `<input>`
- `Modal` — use for all overlay dialogs
- `Spinner` — loading state indicator
- `ErrorBoundary` — wraps each feature route
- `EmptyState` — zero-data placeholders
- `Toast` — ephemeral notifications via `src/lib/hooks/useToast.ts`

## Accessibility baseline

Every interactive element must be keyboard-navigable and have an accessible label.
- Buttons with only icons need `aria-label`.
- Form inputs always have an associated `<label>` (not placeholder-only).
- Modal dialogs trap focus and restore it on close.
- Run `axe-core` in Playwright tests for any new page-level component.

## data-testid convention

Set `data-testid` on every interactive element using kebab-case:

```tsx
<button data-testid="submit-login-form">Sign in</button>
<input data-testid="email-input" type="email" />
```

Format: `{action-or-noun}-{context}`. The Playwright Page Objects use these exclusively.
