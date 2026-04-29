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

const accountFeatureBoundaryRules = {
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['@/features/auth/*', '@/features/urls/*'],
          message: 'account/ must not import other features directly. Use shared/ or app/ boundaries instead.',
        },
      ],
    },
  ],
};

const authFeatureBoundaryRules = {
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['@/features/account/*', '@/features/urls/*'],
          message: 'auth/ must not import other features directly. Use shared/ or app/ boundaries instead.',
        },
      ],
    },
  ],
};

const urlsFeatureBoundaryRules = {
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['@/features/account/*', '@/features/auth/*'],
          message: 'urls/ must not import other features directly. Use shared/ or app/ boundaries instead.',
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
  },
  {
    files: ['src/features/account/**/*.{ts,tsx}'],
    ignores: ['src/features/account/**/*.test.{ts,tsx}'],
    rules: accountFeatureBoundaryRules,
  },
  {
    files: ['src/features/auth/**/*.{ts,tsx}'],
    ignores: ['src/features/auth/**/*.test.{ts,tsx}'],
    rules: authFeatureBoundaryRules,
  },
  {
    files: ['src/features/urls/**/*.{ts,tsx}'],
    ignores: ['src/features/urls/**/*.test.{ts,tsx}'],
    rules: urlsFeatureBoundaryRules,
  }
);
