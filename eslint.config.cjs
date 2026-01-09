module.exports = [
  {
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks')
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off'
    }
  }
];