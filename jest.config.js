module.exports = {
    roots: [
        "<rootDir>/test"
    ],
    testMatch: [
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    preset: 'ts-jest',
    coverageDirectory: "./coverage/",
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 1,
            functions: 1,
            lines: 1,
            statements: 1
        }
    },
    testEnvironment: "node",
    coveragePathIgnorePatterns: ["/__fixtures__/"],
    testPathIgnorePatterns: ["/__fixtures__/"],
}
