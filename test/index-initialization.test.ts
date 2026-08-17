import { describe, test, expect, vi, beforeEach } from 'vitest'

describe('initialization guards', () => {
    beforeEach(() => {
        vi.resetModules()
    })

    test('registers soft assertions and __wdio_version on first load', async () => {
        const { expect: wdioExpect } = await import('../src/index.js')
        const { default: pkg } = await import('../package.json', { with: { type: 'json' } })

        expect(wdioExpect.soft).toBeDefined()
        expect(wdioExpect.getSoftFailures).toBeDefined()
        expect(wdioExpect.assertSoftFailures).toBeDefined()
        expect(wdioExpect.clearSoftFailures).toBeDefined()
        expect((wdioExpect as any).__wdio_version).toBe(pkg.version)
    })

    test('does not warn and skips re-registering soft when already initialized with the same version', async () => {
        // First load sets soft + __wdio_version on the shared expect singleton
        await import('../src/index.js')

        const warnSpy = vi.spyOn(console, 'warn')

        // Second load: module re-evaluated, but expect singleton still has soft defined
        vi.resetModules()
        await import('../src/index.js')

        expect(warnSpy).not.toHaveBeenCalled()
        // Soft is still defined and not thrown due to non-configurable re-define attempt
        const { expect: wdioExpect } = await import('../src/index.js')
        expect(wdioExpect.soft).toBeDefined()
    })

    test('warns with version conflict message when a different __wdio_version is already set', async () => {
        // Simulate a different version already loaded by setting __wdio_version manually
        const { expect: expectLib } = await import('expect')
        ;(expectLib as any).__wdio_version = '999.0.0'

        const warnSpy = vi.spyOn(console, 'warn')
        vi.resetModules()
        await import('../src/index.js')

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('but v999.0.0 is already loaded')
        )
    })
})
