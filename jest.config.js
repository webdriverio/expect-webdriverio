module.exports = {
    roots: [
        '<rootDir>/test'
    ],
    testMatch: [
        '**/?(*.)+(spec|test).+(ts|tsx|js)'
    ],
    preset: 'ts-jest',
    coverageDirectory: './coverage/',
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 99,
            lines: 99,
            statements: 99
        }
    },
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/__fixtures__/', 'src/jasmineUtils.ts'],
    testPathIgnorePatterns: ['/__fixtures__/'],
    setupFilesAfterEnv: ['./test/__fixtures__/index.js']
}
