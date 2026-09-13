import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['**/dist/**', '**/dist', '**/.next/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Introduced in eslint-plugin-react-hooks 7. Existing data-loading
      // effects trip it; kept as a warning until they are refactored.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Next.js App Router files legitimately export `metadata`/
    // `generateMetadata`/`generateStaticParams` alongside their default
    // component export — this rule exists for Vite's Fast Refresh, which
    // never runs on src/app/ (only Next's own dev server builds it).
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
