import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'
import { browser, multiRemoteBrowser } from '@wdio/globals'
import { toHaveSessionStorageItem } from '../../../src/matchers/browser/toHaveSessionStorageItem.js'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect } from '../../../src/index.js'
import { browserFactory, browsingContextFactory } from '../../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

describe(toHaveSessionStorageItem, () => {
    const thisContext = { toHaveSessionStorageItem }
    const thisNotContext = { isNot: true, toHaveSessionStorageItem }

    beforeEach(() => {
        vi.mocked(browser.execute).mockResolvedValue('dark')
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('reads the item of sessionStorage, not of localStorage', async () => {
        // The script runs in a fake page: the item has a value only in sessionStorage
        vi.mocked(browser.execute).mockImplementation((async (script: (...args: unknown[]) => unknown, ...args: unknown[]) => script(...args)) as never)
        vi.stubGlobal('sessionStorage', { getItem: (key: string) => key === 'theme' ? 'dark' : null })
        vi.stubGlobal('localStorage', { getItem: () => 'light' })

        const result = await thisContext.toHaveSessionStorageItem(browser, 'theme', 'dark', { wait: 0 })

        expect(result.pass).toBe(true)
        expect(browser.execute).toHaveBeenCalledWith(expect.any(Function), 'theme')
    })

    it('passes with the value and gives the hooks the key and the value', async () => {
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await thisContext.toHaveSessionStorageItem(browser, 'theme', 'DARK', { ignoreCase: true, beforeAssertion, afterAssertion })

        expect(result.pass).toBe(true)
        expect(beforeAssertion).toHaveBeenCalledWith({ matcherName: 'toHaveSessionStorageItem', expectedValue: ['theme', 'DARK'], options: { ignoreCase: true, beforeAssertion, afterAssertion } })
        expect(afterAssertion).toHaveBeenCalledWith({ matcherName: 'toHaveSessionStorageItem', expectedValue: ['theme', 'DARK'], options: { ignoreCase: true, beforeAssertion, afterAssertion }, result })
    })

    it('fails with another value', async () => {
        const result = await thisContext.toHaveSessionStorageItem(browser, 'theme', 'light', { wait: 0 })

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toEqual(`\
Expect browser to have sessionStorage item theme

Expected: "light"
Received: "dark"`)
    })

    it('not - fails with the same value', async () => {
        const result = await thisNotContext.toHaveSessionStorageItem(browser, 'theme', 'dark', { wait: 0 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(stripAnsi(result.message())).toEqual(`\
Expect browser not to have sessionStorage item theme

Expected [not]: "dark"
Received      : "dark"`)
    })

    it('with no value, checks that the item exists', async () => {
        expect((await thisContext.toHaveSessionStorageItem(browser, 'theme')).pass).toBe(true)

        vi.mocked(browser.execute).mockResolvedValue(null)
        const result = await thisContext.toHaveSessionStorageItem(browser, 'theme', undefined, { wait: 0 })

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toEqual(`\
Expect browser to have sessionStorage item theme

Expected: Anything
Received: no item`)
    })

    it('never matches a missing item, also not a matcher that accepts no value', async () => {
        vi.mocked(browser.execute).mockResolvedValue(null)

        expect((await thisContext.toHaveSessionStorageItem(browser, 'theme', wdioExpect.not.stringContaining('x'), { wait: 0 })).pass).toBe(false)
        expect((await thisNotContext.toHaveSessionStorageItem(browser, 'theme', wdioExpect.anything(), { wait: 0 })).pass).toBe(false)
    })

    it('compares the value of each instance of a multi-remote browser', async () => {
        vi.mocked(multiRemoteBrowser.getInstance('chrome').execute).mockResolvedValue('dark')
        vi.mocked(multiRemoteBrowser.getInstance('firefox').execute).mockResolvedValue('light')

        const result = await thisContext.toHaveSessionStorageItem(multiRemoteBrowser, 'theme', 'dark', { wait: 0 })

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have sessionStorage item theme

- Expected  - 1
+ Received  + 1

  Multi-remote values {
    "chrome": "dark",
-   "firefox": "dark",
+   "firefox": "light",
  }`)
    })

    it('reads the item in a browsing context, and names the frame in the message', async () => {
        const contextBrowser = Object.assign(browserFactory(), { requestedCapabilities: { browserName: 'chrome' } }) as unknown as WebdriverIO.Browser
        const frame = browsingContextFactory({ browser: contextBrowser, isFrame: true, url: 'https://example.com/frame.html' })
        vi.mocked(frame.execute).mockResolvedValue('frameValue')

        const fail = await thisContext.toHaveSessionStorageItem(frame, 'theme', 'otherValue', { wait: 0 })

        expect(fail.pass).toBe(false)
        expect(stripAnsi(fail.message()).split('\n')[0]).toContain("chrome's frame (https://example.com/frame.html)")
        expect(contextBrowser.execute).not.toHaveBeenCalled()
    })
})
