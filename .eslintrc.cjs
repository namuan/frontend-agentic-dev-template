// .eslintrc.cjs
// Architecture rules are enforced here. Violation messages are written to be
// actionable when they appear in Codex agent context.

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['@typescript-eslint', 'import', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: { react: { version: 'detect' } },

  rules: {
    // ── Type safety ──────────────────────────────────────────────────────────
    '@typescript-eslint/no-explicit-any': [
      'error',
      {
        fixWith: 'unknown',
        // MESSAGE FOR AGENT: Replace `any` with `unknown` and add a type guard,
        // or derive the type from a Zod schema. See docs/RELIABILITY.md.
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 'error',

    // ── No console in production code ────────────────────────────────────────
    'no-console': [
      'error',
      {
        allow: [],
        // MESSAGE FOR AGENT: Use the structured logger at src/lib/utils/logger.ts
        // instead of console.log/error. See docs/RELIABILITY.md.
      },
    ],

    // ── Import rules ─────────────────────────────────────────────────────────
    'import/no-cycle': ['error', { maxDepth: 3 }],

    // Cross-domain feature imports are forbidden.
    // MESSAGE FOR AGENT: features/ domains must not import from each other.
    // Move shared logic to src/lib/ and import from there.
    // See ARCHITECTURE.md#dependency-rules.
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/features/auth',
            from: './src/features',
            except: ['./auth'],
            message:
              '[ARCH] features/auth must not import from other feature domains. ' +
              'Move shared code to src/lib/ first. See ARCHITECTURE.md.',
          },
          {
            target: './src/features/dashboard',
            from: './src/features',
            except: ['./dashboard'],
            message:
              '[ARCH] features/dashboard must not import from other feature domains. ' +
              'Move shared code to src/lib/ first. See ARCHITECTURE.md.',
          },
          {
            target: './src/features/settings',
            from: './src/features',
            except: ['./settings'],
            message:
              '[ARCH] features/settings must not import from other feature domains. ' +
              'Move shared code to src/lib/ first. See ARCHITECTURE.md.',
          },
          // lib/components must not reach into lib/api
          {
            target: './src/lib/components',
            from: './src/lib/api',
            message:
              '[ARCH] lib/components must not import from lib/api. ' +
              'Data fetching belongs in feature hooks. See ARCHITECTURE.md.',
          },
        ],
      },
    ],

    // ── React ────────────────────────────────────────────────────────────────
    'react/react-in-jsx-scope': 'off', // React 17+ JSX transform
    'react/prop-types': 'off', // We use TypeScript
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ── General quality ──────────────────────────────────────────────────────
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },

  overrides: [
    // Test files: relax some rules
    {
      files: ['**/*.test.ts', '**/*.test.tsx', 'tests/**/*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
  ],
};
