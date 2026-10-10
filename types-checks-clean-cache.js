import { rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

/**
 * Deletes the build info file of the Vitest type tests, before each type test project.
 * Vitest always runs `tsc --incremental` with one file in its own folder (`vitest/dist/tsconfig.tmp.tsbuildinfo`), for
 * every project. An old file can hide type errors: with TypeScript 7.0.2, `tsc --incremental` misses a change in the
 * `declare global` block of our declaration files, so the tests pass when `tsc` finds errors
 * (https://github.com/microsoft/TypeScript/issues/64715). Remove this script when that issue is fixed.
 */
const vitest = dirname(createRequire(import.meta.url).resolve('vitest/package.json'))
rmSync(join(vitest, 'dist', 'tsconfig.tmp.tsbuildinfo'), { force: true })
