import { $ } from '@wdio/globals'
import { setOptions, getConfig } from 'expect-webdriverio'

describe('Global Options', () => {

    before(() => {
        // Verify we can set the option to 1ms
        setOptions({ wait: 1 })
        expect(getConfig().wait).toBe(1)
    })

    it('should allow setting and using global wait option', async () => {
        const start = Date.now()

        // This should fail almost immediately because the element doesn't exist
        // and the wait time is set to 1ms
        await expect(expect($('non-existent-element-' + Date.now())).toBeDisplayed()).rejects.toThrow()
        const duration = Date.now() - start

        // It should take significantly less time than the default or the 250ms set in wdio.conf
        // 1ms wait + overhead. 500ms should be a safe upper bound for "immediate" failure
        // vs a standard 3000ms timeout
        expect(duration).toBeLessThan(500)
    })

    after(() => {
        // Restore the option to 250ms as inferred from wdio.conf.ts to not pollute other tests
        setOptions({ wait: 250 })
    })
})
