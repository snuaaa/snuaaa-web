import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      ecmaVersion: 2021,
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    // Tests talk to the API over HTTP and set up data through test/helpers,
    // so they keep working when the code behind the routes is replaced (#158).
    files: ['test/**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'pg', message: 'Use a helper in test/helpers/db.ts.' },
            {
              name: 'sequelize',
              message: 'Use a helper in test/helpers/db.ts.',
            },
          ],
          patterns: [
            {
              group: ['**/helpers/sql'],
              message:
                'Keep SQL in test/helpers: add a helper to db.ts or factories.ts.',
            },
            {
              group: [
                '**/src/models/**',
                '**/src/controllers/**',
                '**/src/utils/**',
                '**/src/services/**',
                '**/src/repositories/**',
                '**/src/db/client',
                '**/src/db/schema',
              ],
              message:
                'Tests must not depend on the code under test. Use test/helpers.',
            },
          ],
        },
      ],
    },
  },
);
