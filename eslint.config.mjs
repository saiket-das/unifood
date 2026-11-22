import js from '@eslint/js';
import next from '@next/eslint-plugin-next';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const webApps = ['student', 'restaurant', 'admin'];

export default defineConfig(
  globalIgnores([
    'dev branch/**',
    '**/.next/**',
    '**/coverage/**',
    '**/dist/**',
    '**/generated/**',
    '**/next-env.d.ts',
    '**/out/**',
  ]),
  {
    files: ['eslint.config.mjs', 'scripts/**/*.mjs'],
    extends: [js.configs.recommended],
  },
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}', 'prisma/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
  webApps.map((app) => ({
    files: [`apps/${app}/**/*.{js,jsx,mjs,ts,tsx}`],
    extends: [
      next.configs['core-web-vitals'],
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    settings: { next: { rootDir: `apps/${app}/` } },
  })),
);
