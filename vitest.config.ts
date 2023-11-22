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
            enabled: true,
            exclude: ['**/build/**', '**/__fixtures__/**', '**/*.test.ts'],
            lines: 92,
            functions: 87,
            branches: 89,
            statements: 92
        }
    }
})
