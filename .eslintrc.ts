module.exports = {
  extends: ['eslint:recommended', 'plugin:cypress/recommended', '@grafana/eslint-config'],
  env: { browser: true, jest: true },
  plugins: ['import'],
  rules: {
    'no-unused-vars': 'off',
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], ['parent', 'internal', 'sibling', 'index'], ['type']],
        'newlines-between': 'never',
        alphabetize: { order: 'asc' },
      },
    ],
  },
};
