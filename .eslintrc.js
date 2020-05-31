module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['redux-saga', 'react-hooks', 'prettier'],
  extends: ['react-app', 'airbnb-typescript', 'plugin:redux-saga/recommended', 'prettier'],
  rules: {
    'object-curly-spacing': ['warn', 'always'],
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'none',
      },
    ],
    'no-debugger': 0, // 1
    'no-console': 0, // ['error', { allow: ['warn', 'error'] }],
    'no-shadow': 0,
    'no-param-reassign': 0,
    'no-constant-condition': ['error', { checkLoops: false }],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'import/no-default-export': 1,
    'import/prefer-default-export': 0,
    'react/prop-types': 0,
    'react/jsx-curly-newline': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['*.test.ts'],
      rules: {
        'redux-saga/no-unhandled-errors': 0,
        'import/first': 0,
      },
    },
  ],
};
