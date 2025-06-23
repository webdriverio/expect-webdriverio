import wdioEslint from '@wdio/eslint'

export default wdioEslint.config([
    {
        ignores: [
            'lib',
            '**/*/dist'
        ]
    },
    /**
     * custom test configuration
     */
    {
        files: [
            'test/**/*',
            '__mocks__/**/*'
        ],
        languageOptions: {
            globals: {
                beforeAll: true,
                afterAll: true,
                afterEach: true,
                beforeEach: true
            }
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
])
