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
            branches: 51,
            functions: 62,
            lines: 66,
            statements: 67
        }
    },
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/__fixtures__/'],
    testPathIgnorePatterns: ['/__fixtures__/'],
    setupFilesAfterEnv: ['./test/__fixtures__/index.js']
}
