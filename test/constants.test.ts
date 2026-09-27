import { describe, test, expect, vi, afterEach } from 'vitest'

describe('constants.ts shared state across module instances', () => {
    afterEach(() => {
        vi.resetModules()
    })

    test('DEFAULT_OPTIONS and defaultOptionsList stay the same object across separate module evaluations', async () => {
        const first = await import('../src/constants.js')

        // Forces a fresh, separate evaluation of constants.ts's top-level code,
        // simulating the dual module instantiation this file guards against
        // (e.g. Node's require() of an ES module creating a synthetic instance
        // separate from one loaded via import()).
        vi.resetModules()
        const second = await import('../src/constants.js')

        expect(second.DEFAULT_OPTIONS).toBe(first.DEFAULT_OPTIONS)
        expect(second.defaultOptionsList).toBe(first.defaultOptionsList)
    })

    test('a default option mutated through one module evaluation is visible from a separately re-evaluated instance', async () => {
        const first = await import('../src/constants.js')

        vi.resetModules()
        const second = await import('../src/constants.js')

        const originalWait = first.DEFAULT_OPTIONS.wait
        expect(second.DEFAULT_OPTIONS.wait).toBe(originalWait)

        try {
            first.DEFAULT_OPTIONS.wait = 4242

            expect(second.DEFAULT_OPTIONS.wait).toBe(4242)
        } finally {
            first.DEFAULT_OPTIONS.wait = originalWait
        }
    })
})
