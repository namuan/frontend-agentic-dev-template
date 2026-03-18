module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  plugins: ['react', 'react-hooks', 'import', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-explicit-any': 'error',
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/features/auth',
            from: './src/features',
            except: ['./auth'],
            message:
              '[ARCH] features/auth must not import from other feature domains. Move shared code to src/lib/ first. See ARCHITECTURE.md.',
          },
          {
            target: './src/features/dashboard',
            from: './src/features',
            except: ['./dashboard'],
            message:
              '[ARCH] features/dashboard must not import from other feature domains. Move shared code to src/lib/ first. See ARCHITECTURE.md.',
          },
          {
            target: './src/features/settings',
            from: './src/features',
            except: ['./settings'],
            message:
              '[ARCH] features/settings must not import from other feature domains. Move shared code to src/lib/ first. See ARCHITECTURE.md.',
          },
          {
            target: './src/lib/components',
            from: './src/lib/api',
            message:
              '[ARCH] lib/components must not import from lib/api. Data fetching belongs in feature domains. See ARCHITECTURE.md.',
          },
        ],
      },
    ],
  },
};
