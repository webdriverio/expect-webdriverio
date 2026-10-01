import { multiRemoteBrowser } from '@wdio/globals'
import { getDefaultOptions, setDefaultOptions } from 'expect-webdriverio'

describe('Global Options', () => {
    const defaultWait = getDefaultOptions().wait

    before(() => {
        setDefaultOptions({ wait: 1 })
    })

    it('should set global wait option', () => {
        expect(getDefaultOptions().wait).toBe(1)
        expect(getDefaultOptions().wait).not.toBe(defaultWait)
        expect(defaultWait).toBe(10000)
    })

    it('should allow setting and using global wait option', async () => {
        // One multi-remote assertion queries every browser, which takes ~800ms on Windows runners,
        // so measure that cost with an explicit `wait: 1` that does not depend on the global option
        const baselineStart = Date.now()
        await expect(expect(multiRemoteBrowser.$('non-existent-element-' + Date.now())).toBeDisplayed({ wait: 1 })).rejects.toThrow()
        const baseline = Date.now() - baselineStart

        const start = Date.now()
        await expect(expect(multiRemoteBrowser.$('non-existent-element-' + Date.now())).toBeDisplayed()).rejects.toThrow()
        const duration = Date.now() - start

        // Ensure failure was as fast as the baseline: ignoring the global option would wait at
        // least the wdio.conf.ts default (1000ms)
        expect(duration).toBeLessThan(baseline + 500)
    })

    after(() => {
        setDefaultOptions({ wait: defaultWait })
    })
})
