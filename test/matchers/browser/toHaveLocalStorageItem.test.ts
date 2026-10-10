import { vi, expect, describe, it, beforeEach } from 'vitest'
import { browser, multiRemoteBrowser } from '@wdio/globals'
import { toHaveLocalStorageItem } from '../../../src/matchers/browser/toHaveLocalStorageItem.js'
import stripAnsi from 'strip-ansi'
import  { expect as wdioExpect } from '../../../src/index.js'
import { browserFactory, browsingContextFactory } from '../../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

const beforeAssertion = vi.fn()
const afterAssertion = vi.fn()

describe(toHaveLocalStorageItem, () => {
    let thisContext: { toHaveLocalStorageItem: typeof toHaveLocalStorageItem }
    let thisNotContext: { isNot: true,  toHaveLocalStorageItem: typeof toHaveLocalStorageItem }

    beforeEach(async () => {
        thisContext = { toHaveLocalStorageItem }
        thisNotContext = { isNot: true, toHaveLocalStorageItem }

        vi.mocked(browser.execute).mockResolvedValue('someLocalStorageValue')
    })

    describe('Single Browser', () => {
        it('passes when localStorage item exists with correct value', async () => {
            const result = await thisContext.toHaveLocalStorageItem(
                browser,
                'someLocalStorageKey',
                'someLocalStorageValue',
                { ignoreCase: true, beforeAssertion, afterAssertion }
            )

            expect(result.pass).toBe(true)

            // Check that browser.execute was called with correct arguments
            expect(browser.execute).toHaveBeenCalledWith(
                expect.any(Function),
                'someLocalStorageKey'
            )

            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveLocalStorageItem',
                expectedValue: ['someLocalStorageKey', 'someLocalStorageValue'],
                options: { ignoreCase: true, beforeAssertion, afterAssertion }
            })

            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveLocalStorageItem',
                expectedValue: ['someLocalStorageKey', 'someLocalStorageValue'],
                options: { ignoreCase: true, beforeAssertion, afterAssertion },
                result
            })
        })

        it('fails when localStorage item has different value', async () => {
            vi.mocked(browser.execute).mockResolvedValue('actualValue')

            const result = await thisContext.toHaveLocalStorageItem(browser, 'someKey', 'expectedValue')

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect browser to have localStorage item someKey

Expected: "expectedValue"
Received: "actualValue"`)
        })

        it('not - succeeds (pass is false) when localStorage item has different value', async () => {
            vi.mocked(browser.execute).mockResolvedValue('actualValue')

            const result = await thisNotContext.toHaveLocalStorageItem(browser, 'someKey', 'expectedValue')

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })

        it('not - fails (pass is true) when localStorage item has same value', async () => {
            const result = await thisNotContext.toHaveLocalStorageItem(browser, 'someKey', 'someLocalStorageValue')

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toContain(`\
Expect browser not to have localStorage item someKey

Expected [not]: "someLocalStorageValue"
Received      : "someLocalStorageValue"`
            )

        })

        it('fails when localStorage item does not exist', async () => {
        // Mock browser.execute to return null (item doesn't exist)
            vi.mocked(browser.execute).mockResolvedValue(null)

            const result = await thisContext.toHaveLocalStorageItem(browser, 'nonExistentKey', 'someValue')

            expect(result.pass).toBe(false)
            expect(browser.execute).toHaveBeenCalledWith(
                expect.any(Function),
                'nonExistentKey'
            )
            expect(stripAnsi(result.message())).toEqual(`\
Expect browser to have localStorage item nonExistentKey

Expected: "someValue"
Received: no item`
            )
        })

        it('passes when only checking key existence', async () => {
            // Mock browser.execute to return any non-null value
            vi.mocked(browser.execute).mockResolvedValue('anyValue')

            // no expectedValue parameter
            const result = await thisContext.toHaveLocalStorageItem(browser, 'existingKey')

            expect(result.pass).toBe(true)
        })

        it('fails when only checking key existence', async () => {
        // Mock browser.execute to return any non-null value
            vi.mocked(browser.execute).mockResolvedValue(null)

            // no expectedValue parameter
            const result = await thisContext.toHaveLocalStorageItem(browser, 'existingKey')

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect browser to have localStorage item existingKey

Expected: Anything
Received: no item`
            )
        })

        it('gives the hooks the key and no value, as the user wrote it', async () => {
            vi.mocked(browser.execute).mockResolvedValue('anyValue')
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            await thisContext.toHaveLocalStorageItem(browser, 'existingKey', undefined as never, { beforeAssertion, afterAssertion })

            expect(beforeAssertion).toHaveBeenCalledWith(expect.objectContaining({ expectedValue: ['existingKey', undefined] }))
            expect(afterAssertion).toHaveBeenCalledWith(expect.objectContaining({ expectedValue: ['existingKey', undefined] }))
        })

        it('gives the hooks an empty string value, as the user wrote it', async () => {
            vi.mocked(browser.execute).mockResolvedValue('')
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            await thisContext.toHaveLocalStorageItem(browser, 'emptyKey', '', { beforeAssertion, afterAssertion })

            expect(beforeAssertion).toHaveBeenCalledWith(expect.objectContaining({ expectedValue: ['emptyKey', ''] }))
            expect(afterAssertion).toHaveBeenCalledWith(expect.objectContaining({ expectedValue: ['emptyKey', ''] }))
        })

        it('never matches a missing item, as a missing cookie', async () => {
            vi.mocked(browser.execute).mockResolvedValue(null)

            // Also not a matcher that accepts no value
            expect((await thisContext.toHaveLocalStorageItem(browser, 'missingKey', wdioExpect.not.stringContaining('x'), { wait: 0 })).pass).toBe(false)
            expect((await thisContext.toHaveLocalStorageItem(browser, 'missingKey', wdioExpect.anything(), { wait: 0 })).pass).toBe(false)
        })

        it('passes when only checking key existence with anything() and options', async () => {
        // Mock browser.execute to return any non-null value
            vi.mocked(browser.execute).mockResolvedValue('anyValue')

            // no expectedValue parameter
            const result = await thisContext.toHaveLocalStorageItem(browser, 'existingKey', wdioExpect.anything(), { ignoreCase: true })

            expect(result.pass).toBe(true)
        })

        it('ignores case when ignoreCase is true', async () => {
            vi.mocked(browser.execute).mockResolvedValue('UPPERCASE')

            const result = await thisContext.toHaveLocalStorageItem(browser, 'key', 'uppercase', { ignoreCase: true })

            expect(result.pass).toBe(true)
        })

        it('trims whitespace when trim is true', async () => {
            vi.mocked(browser.execute).mockResolvedValue('  value  ')

            const result = await thisContext.toHaveLocalStorageItem(browser, 'key', 'value', { trim: true })

            expect(result.pass).toBe(true)
        })

        it('checks containing when containing is true', async () => {
            vi.mocked(browser.execute).mockResolvedValue('this is a long value')

            const result = await thisContext.toHaveLocalStorageItem(browser, 'key', 'long', { containing: true })

            expect(result.pass).toBe(true)
        })

        it('passes when localStorage value matches regex', async () => {
            vi.mocked(browser.execute).mockResolvedValue('user_123')

            const result = await thisContext.toHaveLocalStorageItem(browser, 'userId', /^user_\d+$/)

            expect(result.pass).toBe(true)
        })

        it('fails when localStorage value does not match regex', async () => {
            vi.mocked(browser.execute).mockResolvedValue('user_abc')

            const result = await thisContext.toHaveLocalStorageItem(browser, 'userId', /^user_\d+$/)

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toContain(`\
Expect browser to have localStorage item userId

Expected: /^user_\\d+$/
Received: "user_abc"`
            )
        })
    })
    describe('Multi-Remote Browser', () => {
        const chromeBrowser = multiRemoteBrowser.getInstance('chrome')
        const firefoxBrowser = multiRemoteBrowser.getInstance('firefox')

        beforeEach(() => {
            vi.mocked(chromeBrowser!.execute).mockResolvedValue('multiValue')
            vi.mocked(firefoxBrowser!.execute).mockResolvedValue('multiValue')
        })

        it('passes when localStorage value matches expected value in multi-remote', async () => {
            const result = await thisContext.toHaveLocalStorageItem(multiRemoteBrowser, 'multiKey', 'multiValue')

            expect(result.pass).toBe(true)
        })

        it('fails when localStorage value does not match expected value in multi-remote', async () => {
            const result = await thisContext.toHaveLocalStorageItem(multiRemoteBrowser, 'multiKey', 'differentValue')

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have localStorage item multiKey

- Expected  - 2
+ Received  + 2

  Multi-remote values {
-   "chrome": "differentValue",
-   "firefox": "differentValue",
+   "chrome": "multiValue",
+   "firefox": "multiValue",
  }`
            )
        })
    })
})

describe('toHaveLocalStorageItem on a browsing context (tab, window, frame)', () => {
    it('reads the local storage in the context, and names the frame in the message', async () => {
        const contextBrowser = Object.assign(browserFactory(), { requestedCapabilities: { browserName: 'chrome' } }) as unknown as WebdriverIO.Browser
        const frame = browsingContextFactory({ browser: contextBrowser, isFrame: true, url: 'https://example.com/frame.html' })
        vi.mocked(frame.execute).mockResolvedValue('frameValue')

        const matchers = { toHaveLocalStorageItem }
        const pass = await matchers.toHaveLocalStorageItem(frame, 'key', 'frameValue', { wait: 0 })
        const fail = await matchers.toHaveLocalStorageItem(frame, 'key', 'otherValue', { wait: 0 })

        expect(pass.pass).toBe(true)
        expect(fail.pass).toBe(false)
        expect(stripAnsi(fail.message()).split('\n')[0]).toContain("chrome's frame (https://example.com/frame.html)")
        expect(contextBrowser.execute).not.toHaveBeenCalled()
    })
})
