module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/ban-ts-ignore': 0,
        '@typescript-eslint/no-namespace': 1,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,
        '@typescript-eslint/ban-types': [
            'error',
            {
                types: {
                    Function: false,
                },
            },
        ],
        '@typescript-eslint/ban-ts-comment': 0,
    },
}
