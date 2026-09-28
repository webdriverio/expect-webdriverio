import { describe, test, expect, vi } from 'vitest'

/**
 * Standalone use (no testrunner): `@wdio/globals` and `@wdio/logger` are not peer dependencies,
 * so importing the package must not load them.
 */
describe('standalone', () => {
    test('should load and assert without @wdio/globals and @wdio/logger', async () => {
        vi.resetModules()
        vi.doMock('@wdio/globals', () => { throw new Error('@wdio/globals must not be imported') })
        vi.doMock('@wdio/logger', () => { throw new Error('@wdio/logger must not be imported') })

        const { expect: wdioExpect, SnapshotService } = await import('../src/index.js')

        expect(() => wdioExpect({ a: 1 }).toEqual({ a: 1 })).not.toThrow()
        expect(() => wdioExpect(1).toBe(2)).toThrow()
        expect(SnapshotService.initiate()).toBeDefined()
    })
})
