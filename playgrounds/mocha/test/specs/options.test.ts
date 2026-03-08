import { $ } from '@wdio/globals'
import { setOptions, getConfig } from 'expect-webdriverio'

describe('Global Options', () => {
    const defaultWait = getConfig().wait

    before(() => {
        setOptions({ wait: 1 })
    })

    it('should set global wait option', () => {
        expect(getConfig().wait).toBe(1)
        expect(getConfig().wait).not.toBe(defaultWait)
        expect(defaultWait).toBe(10000)
    })

    it('should allow setting and using global wait option', async () => {
        const start = Date.now()

        // Should fail immediately (wait: 1ms)
        await expect(expect($('non-existent-element-' + Date.now())).toBeDisplayed()).rejects.toThrow()
        const duration = Date.now() - start

        // Ensure failure was fast (< 500ms) compared to default timeout
        expect(duration).toBeLessThan(500)
    })

    after(() => {
        setOptions({ wait: defaultWait })
    })
})
