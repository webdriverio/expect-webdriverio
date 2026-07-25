import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        exclude: [
            'dist', '.idea', '.git', '.cache', 'lib',
            '**/node_modules/**'
        ],
        typecheck: {
            enabled: false, // Not enable by default since in test-types, we need to use vitest by command line to target different tsc config for each augmentations.
        },
        setupFiles: [
            './test/vitest.setup.ts'
        ],
        testTimeout: 15 * 1000,
        clearMocks: true, // clears all mock call histories before each test
        restoreMocks: true, // restores the original implementation of spies
        coverage: {
            enabled: true,
            exclude: [
                '**/build/**',
                '__mocks__/**',
                'docs',
                'playgrounds',
                'lib',
                'test',
                'test-types',
                '.eslintrc.cjs',
                'eslint.config.mjs',
                'vitest.config.ts',
                'types-checks-filter-out-node_modules.js',
            ],
            thresholds: {
                lines: 92.3,
                functions: 91.7,
                statements: 92.2,
                branches: 86.8,
            }
        }
    }
})
