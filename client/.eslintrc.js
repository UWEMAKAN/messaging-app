module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'prettier',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'import/extensions': [
      'error',
      {
        ts: 'never',
      },
    ],
    'object-curly-spacing': 'error',
    'react/function-component-definition': [
      2,
      { namedComponents: 'arrow-function' },
    ],
    'import/prefer-default-export': 'off',
    'object-curly-newline': 'off',
    'no-unused-vars': 1,
    'react/jsx-wrap-multilines': 0,
  },
};
