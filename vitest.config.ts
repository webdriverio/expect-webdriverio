import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        exclude: [
            'dist', '.idea', '.git', '.cache', 'lib',
            '**/node_modules/**'
        ],
        testTimeout: 15 * 1000,
        clearMocks: true, // clears all mock call histories before each test
        restoreMocks: true, // restores the original implementation of spies
        coverage: {
            enabled: true,
            exclude: [
                '**/build/**',
                '**/__fixtures__/**',
                '**/__mocks__/**',
                '**/*.test.ts',
                'lib',
                'test-types',
                '.eslintrc.cjs',
                'jasmine.d.ts',
                'jest.d.ts',
                'types',
                'eslint.config.mjs',
                'vitest.config.ts',
                'types-checks-filter-out-node_modules.js',
            ],
            thresholds: {
                lines: 88.2,
                functions: 86.9,
                statements: 88.1,
                branches: 79.6,
            }
        }
    }
})
