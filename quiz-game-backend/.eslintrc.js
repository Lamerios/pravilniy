module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended'],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error',
  },
};
