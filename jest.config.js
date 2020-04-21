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
            branches: 48,
            functions: 56,
            lines: 65,
            statements: 65
        }
    },
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/__fixtures__/'],
    testPathIgnorePatterns: ['/__fixtures__/'],
    setupFilesAfterEnv: ['./test/__fixtures__/index.js']
}
