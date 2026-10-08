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
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
        // The page counts the reads of `body.probe`: each try of the matcher reads it once in Chrome and twice in
        // Firefox. So the count shows how many times the matcher tried, without a time measure (the unit tests in
        // `test/options.test.ts` check the timing with fake timers)
        const countReads = async (assertion: () => Promise<unknown>) => {
            await multiRemoteBrowser.execute(() => {
                const page = window as Window & { reads?: number }
                page.reads = 0
                Object.defineProperty(document.body, 'probe', { configurable: true, get: () => { page.reads = (page.reads ?? 0) + 1; return 'value' } })
            })
            await expect(assertion()).rejects.toThrow()
            return multiRemoteBrowser.execute(() => (window as Window & { reads?: number }).reads)
        }

        const withExplicitWait = await countReads(() => expect(multiRemoteBrowser.$('body')).toHaveElementProperty('probe', 'other value', { wait: 1 }))
        const withGlobalWait = await countReads(() => expect(multiRemoteBrowser.$('body')).toHaveElementProperty('probe', 'other value'))

        // 1 try with the global `wait: 1`, as with an explicit `wait: 1`. With the wdio.conf.ts default (1000 ms, every
        // 100 ms), the matcher would try about 10 times
        expect(withGlobalWait).toEqual(withExplicitWait)
    })

    after(() => {
        setDefaultOptions({ wait: defaultWait })
    })
})
