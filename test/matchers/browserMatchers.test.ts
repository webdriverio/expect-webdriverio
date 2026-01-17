import { vi, test, describe, expect, beforeEach } from 'vitest'
import { browser } from '@wdio/globals'
import { toHaveUrl } from '../../src/matchers/browser/toHaveUrl.js'
import { toHaveTitle } from '../../src/matchers/browser/toHaveTitle.js'
import { matcherNameLastWords } from '../__fixtures__/utils'

vi.mock('@wdio/globals')

const browserMatchers = new Map([
    [toHaveUrl, browser.getUrl],
    [toHaveTitle, browser.getTitle],
])

const validText = ' Valid Text '
const wrongText = ' Wrong Text '

describe('browser matchers', () => {
    browserMatchers.forEach((browserFn, matcherFn) => {

        let thisContext: { matcherFn: typeof matcherFn }
        let thisNotContext: { isNot: true,  matcherFn: typeof matcherFn }

        beforeEach(() => {
            thisContext = { matcherFn }
            thisNotContext = { isNot: true,  matcherFn }
        })

        describe(matcherFn, () => {
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
                vi.mocked(browserFn).mockResolvedValue(validText)

                const result = await thisContext.matcherFn(browser, validText, { trim: false, wait: 1 })
                expect(result.pass).toBe(true)
                expect(browserFn).toHaveBeenCalledTimes(1)
            })

            test('no wait - failure', async () => {
                vi.mocked(browserFn).mockResolvedValue(wrongText)

                const result = await thisContext.matcherFn(browser, validText, { wait: 0, trim: false })

                expect(result.pass).toBe(false)
                expect(browserFn).toHaveBeenCalledTimes(1)
            })

            test('no wait - success', async () => {
                vi.mocked(browserFn).mockResolvedValue(validText)

                const result = await thisContext.matcherFn(browser, validText, { wait: 0, trim: false })

                expect(result.pass).toBe(true)
                expect(browserFn).toHaveBeenCalledTimes(1)
            })

            test('not - failure - pass should be true', async () => {
                vi.mocked(browserFn).mockResolvedValue(validText)
                const result = await thisNotContext.matcherFn(browser, validText, { wait: 0, trim: false })

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect window not to have ${matcherNameLastWords(matcherFn.name)}

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
                vi.mocked(browserFn).mockResolvedValue(validText)

                const result = await thisNotContext.matcherFn(browser, validText, { wait: 1, trim: false })

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect window not to have ${matcherNameLastWords(matcherFn.name)}

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
                expect(result.message()).toEqual(`\
Expect window to have ${matcherNameLastWords(matcherFn.name)}

Expected: " Valid Text "
Received: " Wrong Text "`
                )
            })
        })
    })
})

