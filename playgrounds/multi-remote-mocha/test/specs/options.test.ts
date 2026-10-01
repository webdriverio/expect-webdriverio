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
        const start = Date.now()

        await expect(expect(multiRemoteBrowser.$('non-existent-element-' + Date.now())).toBeDisplayed()).rejects.toThrow()
        const duration = Date.now() - start

        // Ensure failure was fast compared to the default timeout (10000ms): half of it, because
        // one multi-remote assertion queries every browser, which takes ~800ms on Windows runners
        expect(duration).toBeLessThan(5000)
    })

    after(() => {
        setDefaultOptions({ wait: defaultWait })
    })
})
