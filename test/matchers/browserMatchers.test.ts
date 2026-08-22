import { vi, test, describe, expect, beforeEach } from 'vitest'
import { browser } from '@wdio/globals'
// import { toHaveUrl } from '../../src/matchers/browser/toHaveUrl.js'
import { toHaveTitle } from '../../src/matchers/browser/toHaveTitle.js'
import { matcherNameLastWords } from '../__fixtures__/utils'
import stripAnsi from 'strip-ansi'
import { multiRemoteBrowser } from '../__mocks__/@wdio/globals.js'
import { expect as wdioExpect } from '../../src/index.js'

vi.mock('@wdio/globals')

const browserMatchers = new Map([
    // [toHaveUrl, browser.getUrl],
    [toHaveTitle, browser.getTitle],
])

const validText = ' Valid Text '
const wrongText = ' Wrong Text '

describe('browser matchers', () => {
    browserMatchers.forEach((browserFn, matcherFn) => {

        let thisContext: ExpectWebdriverIO.MatcherContext & { matcherFn: typeof matcherFn }
        let thisNotContext: ExpectWebdriverIO.MatcherContext & { isNot: true,  matcherFn: typeof matcherFn }

        beforeEach(() => {
            thisContext = { matcherFn }
            thisNotContext = { isNot: true,  matcherFn }
        })

        describe(matcherFn, () => {

            beforeEach(() => {
                vi.mocked(browserFn).mockResolvedValue(validText)
            })

            test('wait for success', async () => {
                vi.mocked(browserFn).mockResolvedValueOnce(wrongText).mockResolvedValueOnce(wrongText).mockResolvedValueOnce(validText)

                const result = await thisContext.matcherFn(browser, validText, { trim: false, wait: 500 })
                expect(result.pass).toBe(true)

                expect(browserFn).toHaveBeenCalledTimes(3)
            })

            test('wait but error', async () => {
                vi.mocked(browserFn).mockRejectedValue(new Error('some error'))

                await expect(() => thisContext.matcherFn(browser, validText, { trim: false, wait: 1 }))
                    .rejects.toThrow('some error')
            })

            test('success on the first attempt', async () => {
                const result = await thisContext.matcherFn(browser, validText, { trim: false, wait: 1 })

                expect(result.pass).toBe(true)
                expect(browserFn).toHaveBeenCalledTimes(1)
            })

            test('success with oneOf', async () => {
                const result = await thisContext.matcherFn(browser, wdioExpect.oneOf(validText, wrongText), { trim: false, wait: 1 })

                expect(result.pass).toBe(true)
                expect(browserFn).toHaveBeenCalledTimes(1)
            })

            test('success when passing one single asymmetric expected value', async () => {
                const result = await thisContext.matcherFn(browser, wdioExpect.stringContaining('Valid'), { trim: false, wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('no wait - failure', async () => {
                vi.mocked(browserFn).mockResolvedValue(wrongText)

                const result = await thisContext.matcherFn(browser, validText, { wait: 0, trim: false })

                expect(result.pass).toBe(false)
                expect(browserFn).toHaveBeenCalledTimes(1)
            })

            test('no wait - success', async () => {
                const result = await thisContext.matcherFn(browser, validText, { wait: 0, trim: false })

                expect(result.pass).toBe(true)
                expect(browserFn).toHaveBeenCalledTimes(1)
            })

            test('not - failure - pass should be true', async () => {
                const result = await thisNotContext.matcherFn(browser, validText, { wait: 0, trim: false })

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(stripAnsi(result.message())).toEqual(`\
Expect browser's window not to have ${matcherNameLastWords(matcherFn.name)}

Expected [not]: " Valid Text "
Received      : " Valid Text "`
                )
            })

            test('not - success - pass should be false', async () => {
                vi.mocked(browserFn).mockResolvedValue(wrongText)

                const result = await thisNotContext.matcherFn(browser, validText)

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - failure (with wait) - pass should be true', async () => {
                const result = await thisNotContext.matcherFn(browser, validText, { wait: 1, trim: false })

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(stripAnsi(result.message())).toEqual(`\
Expect browser's window not to have ${matcherNameLastWords(matcherFn.name)}

Expected [not]: " Valid Text "
Received      : " Valid Text "`
                )
            })

            test('not - success (with wait) - pass should be false', async () => {
                vi.mocked(browserFn).mockResolvedValue(wrongText)

                const result = await thisNotContext.matcherFn(browser, validText)

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('message', async () => {
                vi.mocked(browserFn).mockResolvedValue(wrongText)

                const result = await thisContext.matcherFn(browser, validText)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect browser's window to have ${matcherNameLastWords(matcherFn.name)}

Expected: " Valid Text "
Received: "Wrong Text"`
                )
            })
        })

        describe('browser matchers - multi-remote', () => {
            const chromeBrowser = multiRemoteBrowser.getInstance('chrome')
            const firefoxBrowser = multiRemoteBrowser.getInstance('firefox')

            beforeEach(async () => {
                vi.mocked(chromeBrowser.getTitle).mockResolvedValue(validText)
                vi.mocked(firefoxBrowser.getTitle).mockResolvedValue(validText)
            })

            describe('when success', () => {
                test('success when passing one single expected value', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, validText, { trim: false, wait: 0 })

                    expect(result.pass).toBe(true)
                    expect(multiRemoteBrowser.getTitle).toHaveBeenCalledTimes(1)
                })

                test('success when passing one single asymmetric expected value', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, wdioExpect.stringContaining('Valid'), { trim: false, wait: 0 })

                    expect(result.pass).toBe(true)
                    expect(multiRemoteBrowser.getTitle).toHaveBeenCalledTimes(1)
                })

                test('success when passing oneOf expected value', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, wdioExpect.oneOf(validText, wrongText), { trim: false, wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('success when passing array of values', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, [validText, validText], { trim: false, wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('success when passing oneOf in array of values', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, [wdioExpect.oneOf(validText, wrongText), validText], { trim: false, wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('success when passing multi remote expected values', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, { chrome: validText, firefox: validText }, { trim: false, wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('success when passing multi remote expected values with oneOf & asymmetric matcher', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, { chrome: wdioExpect.oneOf(validText, wrongText), firefox: wdioExpect.stringContaining('Valid') }, { trim: false, wait: 0 })

                    expect(result.pass).toBe(true)
                })
            })

            describe('when failure', () => {
                test('failure when passing one single expected value', async () => {
                    vi.mocked(chromeBrowser.getTitle).mockResolvedValue(wrongText)
                    vi.mocked(firefoxBrowser.getTitle).mockResolvedValue(validText)

                    const result = await thisContext.matcherFn(multiRemoteBrowser, validText, { trim: false, wait: 0 })
                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have title

- Expected  - 1
+ Received  + 1

  Array [
-   " Valid Text ",
+   " Wrong Text ",
    " Valid Text ",
  ]`
                    )
                })

                test('failure when passing array of values', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, [validText, wrongText], { trim: false, wait: 0 })
                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have title

- Expected  - 1
+ Received  + 1

  Array [
    " Valid Text ",
-   " Wrong Text ",
+   " Valid Text ",
  ]`
                    )
                })

                test('failure when passing array of values with too much values', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, [validText, validText, validText], { trim: false, wait: 0 })
                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have title

- Expected  - 1
+ Received  + 0

  Array [
    " Valid Text ",
    " Valid Text ",
-   " Valid Text ",
  ]`
                    )
                })

                test('failure when passing array of values with missing values', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, [validText], { trim: false, wait: 0 })
                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have title

- Expected  - 0
+ Received  + 1

  Array [
    " Valid Text ",
+   " Valid Text ",
  ]`
                    )
                })

                test('failure when passing oneOf expected value', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, wdioExpect.oneOf(wrongText, wrongText), { trim: false, wait: 0 })

                    expect(result.pass).toBe(false)
                    // TODO is the error message is correct?
                    expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have title

- Expected  - 2
+ Received  + 2

  Array [
-   oneOf<" Wrong Text ", " Wrong Text ">,
-   oneOf<" Wrong Text ", " Wrong Text ">,
+   " Valid Text ",
+   " Valid Text ",
  ]`
                    )
                })

                test('failure when passing multi remote expected values', async () => {
                    const result = await thisContext.matcherFn(multiRemoteBrowser, { chrome: wrongText, firefox: validText }, { trim: false, wait: 0 })
                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have title

- Expected  - 1
+ Received  + 1

  Object {
-   "chrome": " Wrong Text ",
+   "chrome": " Valid Text ",
    "firefox": " Valid Text ",
  }`
                    )
                })

                test('failure when passing one inexisting multi remote expected values', async () => {
                    const expected = {
                        chrome: validText,
                        firefox: validText,
                        wrong: wrongText
                    }

                    const result = await thisContext.matcherFn(multiRemoteBrowser, expected, { trim: false, wait: 0 })
                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have title

- Expected  - 1
+ Received  + 0

  Object {
    "chrome": " Valid Text ",
    "firefox": " Valid Text ",
-   "wrong": " Wrong Text ",
  }`
                    )
                })

                test('failure when passing multi remote expected values with oneOf & asymmetric matcher', async () => {
                    const expected = {
                        chrome: wdioExpect.oneOf(wrongText, wrongText),
                        firefox: wdioExpect.stringContaining(wrongText)
                    }
                    const result = await thisContext.matcherFn(multiRemoteBrowser, expected, { trim: false, wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect multi-remote<chrome, firefox> to have title

- Expected  - 2
+ Received  + 2

  Object {
-   "chrome": oneOf<" Wrong Text ", " Wrong Text ">,
-   "firefox": StringContaining " Wrong Text ",
+   "chrome": " Valid Text ",
+   "firefox": " Valid Text ",
  }`
                    )
                })

            })
        })
    })
})

