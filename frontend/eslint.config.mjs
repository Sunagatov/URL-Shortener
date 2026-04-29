import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const architectureRules = {
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['@/features/*', '@/app/*'],
          message: 'shared/ must not depend on feature or app modules.',
        },
      ],
    },
  ],
};

const featureInternalRules = {
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['@/app/layout/*'],
          message: 'Feature internals must not depend on app layout modules.',
        },
        {
          group: ['@/features/*/routes/*'],
          message: 'Feature internals must not depend on route modules.',
        },
      ],
    },
  ],
};

export default tseslint.config(
  {
    ignores: ['build/**', 'dist/**', 'coverage/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: architectureRules,
  },
  {
    files: [
      'src/features/**/api/**/*.{ts,tsx}',
      'src/features/**/hooks/**/*.{ts,tsx}',
      'src/features/**/model/**/*.{ts,tsx}',
      'src/features/**/providers/**/*.{ts,tsx}',
    ],
    rules: featureInternalRules,
  }
);
