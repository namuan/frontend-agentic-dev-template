# Frontend standards

## File naming & structure

| Thing | Convention | Example |
|---|---|---|
| Component | PascalCase `.tsx` | `UserCard.tsx` |
| Hook | camelCase, `use` prefix | `useUserProfile.ts` |
| Utility | camelCase `.ts` | `formatDate.ts` |
| Test | same name + `.test` | `UserCard.test.tsx` |
| Zod schema | camelCase, `Schema` suffix | `userSchema.ts` |

Each feature domain follows this internal layout:

```
features/auth/
  components/      # React components local to this domain
  hooks/           # Hooks local to this domain
  api.ts           # React Query hooks + fetch calls for this domain
  types.ts         # Zod schemas + inferred TS types for this domain
  index.ts         # Public exports only — everything else is internal
```

## Component patterns

### Prefer function components with explicit return types

```tsx
interface Props {
  userId: string;
  onSelect: (id: string) => void;
}

export function UserCard({ userId, onSelect }: Props): React.ReactElement {
  // ...
}
```

### Keep JSX lean — logic in hooks

```tsx
// ❌ logic in JSX
function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => { fetch('/users').then(...) }, []);
  const filtered = users.filter(u => u.active);
  return <ul>{filtered.map(...)}</ul>;
}

// ✅ logic in hook
function UserList() {
  const { users, isLoading } = useActiveUsers();
  if (isLoading) return <Spinner />;
  return <ul>{users.map(u => <UserCard key={u.id} user={u} />)}</ul>;
}
```

### Error boundaries

Wrap each feature route in an `ErrorBoundary`. Do not let errors from one domain
crash the whole app. Use the shared `<ErrorBoundary>` in `src/lib/components/`.

### Loading & error states

Every component that fetches data must handle three states explicitly:
`loading`, `error`, and `success`. Never render partial data without guarding.

## Hooks

- Hooks must not contain JSX.
- Hooks that fetch data use React Query (`useQuery`, `useMutation`).
- Hooks with complex state use `useReducer`, not chains of `useState`.
- Every custom hook must have a unit test covering its states.

## Typing

- No `any`. Use `unknown` and narrow with Zod or type guards.
- API response types are always **derived** from Zod schemas, never hand-written:
  ```ts
  export const userSchema = z.object({ id: z.string(), name: z.string() });
  export type User = z.infer<typeof userSchema>;
  ```
- Prop types are always explicit interfaces, not inline objects on the function.

## Styling

- CSS Modules (`.module.css`) for component-scoped styles.
- No inline `style={{}}` except for dynamic values that cannot be expressed in CSS.
- No global class name collisions — always use the module import.
- Design tokens (colours, spacing, typography) live in `src/lib/styles/tokens.css`
  as CSS custom properties. Use tokens, not raw values.

## Imports

- Absolute imports from `src/` using the `@/` alias (configured in `vite.config.ts`
  or `tsconfig.json`).
- No relative imports that go up more than one level (`../../` is a smell).
- Barrel files (`index.ts`) only at domain boundaries — not inside a domain.

## Testing standards

### Jest (unit & integration)

- Test behaviour, not implementation.
- Mock at the network boundary using `msw` (Mock Service Worker), not by mocking
  modules directly.
- Every hook must have tests for: initial state, loading state, success state,
  error state.
- Snapshots are forbidden — they are brittle and uninformative.

### Playwright (E2E)

- One spec file per user journey (e.g. `tests/e2e/auth/login.spec.ts`).
- Use the Page Object Model. Each page/feature has a class in `tests/fixtures/pages/`.
- Selectors use `data-testid` attributes. Never select by CSS class or text content
  (fragile). Set `data-testid` on interactive elements when you create them.
- Every new user-facing feature needs at least one happy-path E2E test.
- Tests must be idempotent — no shared state between tests.

## Performance guardrails

- Lazy-load route-level components with `React.lazy` + `Suspense`.
- Do not import heavy libraries at the top level of frequently-rendered components.
- Memoize expensive derived values with `useMemo`. Memoize callback props passed to
  list items with `useCallback`.
- Bundle size regressions >10 KB (gzip) require a note in the PR description.
