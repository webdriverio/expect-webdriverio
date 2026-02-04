
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default {
  files: ['**/*.ts', '**/*.js'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: './tsconfig.json',
      sourceType: 'module',
      ecmaVersion: 2021,
    },
    globals: {
      NodeJS: true,
      require: true,
      module: true,
      __dirname: true,
      process: true,
    },
  },
  plugins: {
    '@typescript-eslint': tsEslintPlugin,
  },
  rules: {
    ...tsEslintPlugin.configs['recommended'].rules,
    '@typescript-eslint/no-floating-promises': 'error',
  },
};
