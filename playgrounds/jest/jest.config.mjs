import { inject } from "vitest";

export default {
  preset: 'ts-jest/presets/default-esm',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.[jt]s$': '$1',
  },
  testEnvironment: 'node',
  maxWorkers: 1,
  setupFilesAfterEnv: ['./jest.setup.after-env.ts'],
  testPathIgnorePatterns: ['.history', 'node_modules'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      injectGlobals: true
    }]
  }
};
