export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'off',

      // 🚀 Disable unused variable checks in ESLint
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
    settings: {
      // ✅ Tell ESLint that TS should ignore unused vars too
      'typescript-eslint': {
        tsconfigRootDir: __dirname,
        parserOptions: {
          project: './tsconfig.json',
        },
      },
    },
  },
);
