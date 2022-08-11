/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        /**
         * not to ESM ported packages
         */
        exclude: [
            'dist', '.idea', '.git', '.cache',
            '**/node_modules/**'
        ],
        testTimeout: 15 * 1000,
        coverage: {
            enabled: false,
            exclude: ['**/build/**', '**/__fixtures__/**', '**/*.test.ts'],
            lines: 96,
            functions: 90,
            branches: 94,
            statements: 96
        }
    }
})
