import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react': react,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Базовые правила
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',

      // 1. Неиспользуемые переменные
      'no-unused-vars': ['error', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true
      }],

      // 2. Кавычки (только одинарные)
      'quotes': ['error', 'single', { avoidEscape: true }],

      // 3. Лишние пробелы
      'no-multi-spaces': 'error',
      'no-trailing-spaces': 'error',
      'indent': ['error', 2],
      'object-curly-spacing': ['error', 'always'],

      // Дополнительно: точка с запятой (если нужны — 'always', если нет — 'never')
      'semi': ['error', 'never'],

      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
])
