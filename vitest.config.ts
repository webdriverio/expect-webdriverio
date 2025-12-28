/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        /**
         * not to ESM ported packages
         */
        exclude: [
            'dist', '.idea', '.git', '.cache', 'lib',
            '**/node_modules/**'
        ],
        testTimeout: 15 * 1000,
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
                lines: 88.4,
                functions: 86.9,
                statements: 88.3,
                branches: 79.4,
            }
        }
    }
})
