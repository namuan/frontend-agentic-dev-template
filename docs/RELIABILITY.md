# Reliability

## The cardinal rule

**Parse external data at the boundary. Trust nothing beyond it.**

External data includes: API responses, URL search params, localStorage, sessionStorage,
postMessage events, and any data from a third-party library that crosses a module boundary.

## Boundary validation with Zod

Every API call returns a parsed, typed result. Never pass raw `response.json()` into
application code.

```ts
// src/lib/api/users.ts
import { z } from 'zod';

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return userSchema.parse(await res.json()); // throws ZodError on shape mismatch
}
```

If the schema parse fails, it throws — which React Query will catch and surface as
an error state. Never `.safeParse()` and silently swallow failures in production paths.

## Error types

Define a small set of typed errors in `src/lib/api/errors.ts`:

```ts
export class ApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`API error ${status}`);
  }
}

export class ParseError extends Error {
  constructor(public cause: unknown) {
    super('Failed to parse API response');
  }
}
```

## React Query error handling

- `useQuery` errors surface to the nearest `ErrorBoundary` by default when
  `throwOnError: true` is set (set this globally in the QueryClient config).
- `useMutation` errors must be handled explicitly in the `onError` callback —
  they do not bubble to error boundaries.
- Always display user-facing error messages; never expose raw error text to the UI.

## Global QueryClient config

```ts
// src/app/providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 2;
      },
      staleTime: 30_000,
    },
  },
});
```

## localStorage / sessionStorage

Always wrap storage reads in try/catch and validate with Zod:

```ts
export function readFromStorage<T>(key: string, schema: z.ZodType<T>): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return schema.parse(JSON.parse(raw));
  } catch {
    localStorage.removeItem(key); // evict corrupt data
    return null;
  }
}
```

## What NOT to do

- ❌ `const data = await res.json() as MyType` — casting is not validation
- ❌ `data?.user?.name ?? 'Unknown'` as a substitute for schema validation
- ❌ Catching errors and returning `null` without logging
- ❌ Using `console.error` in production code — use the structured logger in
  `src/lib/utils/logger.ts`
