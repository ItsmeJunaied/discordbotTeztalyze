// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['eslint.config.mjs'], // Files to ignore
  },
  eslint.configs.recommended, // Base recommended ESLint rules
  {
    files: ['**/*.ts', '**/*.tsx'], // Apply TypeScript-specific configurations
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json', // Link to your `tsconfig.json`
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': tseslint, // Register TypeScript plugin
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },
  eslintPluginPrettierRecommended, // Recommended Prettier integration
];
