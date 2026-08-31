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

        // Ensure failure was fast (< 500ms) compared to default timeout
        expect(duration).toBeLessThan(500)
    })

    after(() => {
        setDefaultOptions({ wait: defaultWait })
    })
})
