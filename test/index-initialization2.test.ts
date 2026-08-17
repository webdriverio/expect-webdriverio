import { describe, test, expect, vi, beforeEach } from 'vitest'

describe('initialization guards 2', () => {
    beforeEach(() => {
        vi.resetModules()
    })

    test('warns with older version message when soft is defined but no __wdio_version', async () => {
        const { expect: expectLib } = await import('expect')
        const wdioExpect = expectLib as any

        expect(wdioExpect.soft).toBeUndefined()

        await import('../src/index.js')
        wdioExpect.__wdio_version = undefined

        const warnSpy = vi.spyOn(console, 'warn')
        vi.resetModules()
        await import('../src/index.js')

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('older version of expect-webdriverio is already loaded')
        )
    })

})
