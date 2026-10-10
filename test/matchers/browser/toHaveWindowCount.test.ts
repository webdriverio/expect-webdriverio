import { vi, expect, describe, it, afterEach } from 'vitest'
import { browser, multiRemoteBrowser } from '@wdio/globals'
import { toHaveWindowCount } from '../../../src/matchers/browser/toHaveWindowCount.js'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect } from '../../../src/index.js'
import { multiRemote } from '../../../src/api/index.js'
import { browserFactory, browsingContextFactory } from '../../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

const windows = (count: number) => Array.from({ length: count }, (_, index) => `window-${index}`)

describe(toHaveWindowCount, () => {
    const thisContext = { toHaveWindowCount }
    const thisNotContext = { isNot: true, toHaveWindowCount }

    afterEach(() => {
        vi.useRealTimers()
    })

    it('passes when the session has the number of windows, and gives the hooks the value of the user', async () => {
        vi.mocked(browser.getWindowHandles).mockResolvedValue(windows(2))
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await thisContext.toHaveWindowCount(browser, 2, { wait: 0, beforeAssertion, afterAssertion })

        expect(result.pass).toBe(true)
        expect(browser.getWindowHandles).toHaveBeenCalledOnce()
        expect(beforeAssertion).toHaveBeenCalledWith({ matcherName: 'toHaveWindowCount', expectedValue: 2, options: { wait: 0, beforeAssertion, afterAssertion } })
        expect(afterAssertion).toHaveBeenCalledWith({ matcherName: 'toHaveWindowCount', expectedValue: 2, options: { wait: 0, beforeAssertion, afterAssertion }, result })
    })

    it('fails with another number of windows', async () => {
        vi.mocked(browser.getWindowHandles).mockResolvedValue(windows(1))

        const result = await thisContext.toHaveWindowCount(browser, 2, { wait: 0 })

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toEqual(`\
Expect browser to have window count

Expected: 2
Received: 1`)
    })

    it('not - fails with the same number of windows', async () => {
        vi.mocked(browser.getWindowHandles).mockResolvedValue(windows(1))

        const result = await thisNotContext.toHaveWindowCount(browser, 1, { wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(stripAnsi(result.message())).toEqual(`\
Expect browser not to have window count

Expected [not]: 1
Received      : 1`)
    })

    it('compares with a number range and an asymmetric matcher', async () => {
        vi.mocked(browser.getWindowHandles).mockResolvedValue(windows(3))

        expect((await thisContext.toHaveWindowCount(browser, { gte: 2 }, { wait: 0 })).pass).toBe(true)
        expect((await thisContext.toHaveWindowCount(browser, { lte: 2 }, { wait: 0 })).pass).toBe(false)
        expect((await thisContext.toHaveWindowCount(browser, wdioExpect.any(Number), { wait: 0 })).pass).toBe(true)
    })

    it('waits until a new window opens', async () => {
        vi.useFakeTimers()
        vi.mocked(browser.getWindowHandles).mockResolvedValueOnce(windows(1)).mockResolvedValue(windows(2))

        const assertion = thisContext.toHaveWindowCount(browser, 2, { wait: 1000, interval: 100 })
        await vi.runAllTimersAsync()

        expect((await assertion).pass).toBe(true)
        expect(browser.getWindowHandles).toHaveBeenCalledTimes(2)
    })

    it('throws on an expected value that is not a number, also with .not', async () => {
        await expect(thisContext.toHaveWindowCount(browser, '2' as never, { wait: 0 })).rejects.toThrow()
        await expect(thisNotContext.toHaveWindowCount(browser, '2' as never, { wait: 0 })).rejects.toThrow()
    })

    it('compares the windows of each instance of a multi-remote browser, with one value or one value per instance', async () => {
        vi.mocked(multiRemoteBrowser.getInstance('chrome').getWindowHandles).mockResolvedValue(windows(1))
        vi.mocked(multiRemoteBrowser.getInstance('firefox').getWindowHandles).mockResolvedValue(windows(2))

        expect((await thisContext.toHaveWindowCount(multiRemoteBrowser, multiRemote({ chrome: 1, firefox: 2 }), { wait: 0 })).pass).toBe(true)
        const result = await thisContext.toHaveWindowCount(multiRemoteBrowser, 1, { wait: 0 })

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have window count

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": 1,
-   "firefox": 1,
+   "firefox": 2,
  }`)
    })

    it('on a browsing context, counts the windows of its session', async () => {
        const contextBrowser = browserFactory()
        vi.mocked(contextBrowser.getWindowHandles).mockResolvedValue(windows(2))
        const page = browsingContextFactory({ browser: contextBrowser })

        const result = await thisContext.toHaveWindowCount(page, 2, { wait: 0 })

        expect(result.pass).toBe(true)
        expect(contextBrowser.getWindowHandles).toHaveBeenCalledOnce()
    })
})
