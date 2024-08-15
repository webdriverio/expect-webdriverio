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
                '**/*.test.ts',
                'lib',
                'test-types',
                '.eslintrc.cjs',
                'jasmine.d.ts',
                'jest.d.ts',
                'types'
            ],
            thresholds: {
                lines: 88,
                functions: 86,
                branches: 90,
                statements: 88
            }
        }
    }
})
