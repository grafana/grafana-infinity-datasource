module.exports = {
  extends: ['eslint:recommended', '@grafana/eslint-config'],
  env: { browser: true, jest: true },
  rules: {
    'no-unused-vars': 'off',
  },
};
