import { vi, test, describe, expect } from 'vitest'
import { browser } from '@wdio/globals'

import { matcherNameLastWords } from '../__fixtures__/utils.js'
import * as Matchers from '../../src/matchers.js'

vi.mock('@wdio/globals')

const browserMatchers = {
    'toHaveUrl': 'getUrl',
    'toHaveTitle': 'getTitle'
} satisfies Partial<Record<keyof typeof Matchers, keyof WebdriverIO.Browser>>

const validText = ' Valid Text '
const wrongText = ' Wrong Text '

describe('browser matchers', () => {
    Object.entries(browserMatchers).forEach(([matcherName, browserFnName]) => {
        const matcherFn = Matchers[matcherName as keyof typeof Matchers]

        describe(matcherName, () => {
            test('wait for success', async () => {
                browser[browserFnName] = vi.fn().mockResolvedValueOnce(wrongText).mockResolvedValueOnce(wrongText).mockResolvedValueOnce(validText)

                const result = await matcherFn.call({}, browser, validText, { trim: false }) as ExpectWebdriverIO.AssertionResult
                expect(result.pass).toBe(true)

                expect(browser[browserFnName]).toHaveBeenCalledTimes(3)
            })

            test('wait but error', async () => {
                browser[browserFnName] = vi.fn().mockRejectedValue(new Error('some error'))

                await expect(() => matcherFn.call({}, browser, validText, { trim: false }))
                    .rejects.toThrow('some error')
            })

            test('success on the first attempt', async () => {
                browser[browserFnName] = vi.fn().mockResolvedValue(validText)

                const result = await matcherFn.call({}, browser, validText, { trim: false }) as ExpectWebdriverIO.AssertionResult
                expect(result.pass).toBe(true)
                expect(browser[browserFnName]).toHaveBeenCalledTimes(1)
            })

            test('no wait - failure', async () => {
                browser[browserFnName] = vi.fn().mockResolvedValue(wrongText)

                const result = await matcherFn.call({}, browser, validText, { wait: 0, trim: false }) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(false)
                expect(browser[browserFnName]).toHaveBeenCalledTimes(1)
            })

            test('no wait - success', async () => {
                browser[browserFnName] = vi.fn().mockResolvedValue(validText)

                const result = await matcherFn.call({}, browser, validText, { wait: 0, trim: false }) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(true)
                expect(browser[browserFnName]).toHaveBeenCalledTimes(1)
            })

            test('not - failure - pass should be true', async () => {
                browser[browserFnName] = vi.fn().mockResolvedValue(validText)
                const result = await matcherFn.call({ isNot: true }, browser, validText, { wait: 0, trim: false }) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect window not to have ${matcherNameLastWords(matcherName)}

Expected [not]: " Valid Text "
Received      : " Valid Text "`
                )
            })

            test('not - success - pass should be false', async () => {
                browser[browserFnName] = vi.fn().mockResolvedValue(wrongText)

                const result = await matcherFn.call({ isNot: true }, browser, validText, { wait: 0 }) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - failure (with wait) - pass should be true', async () => {
                browser[browserFnName] = vi.fn().mockResolvedValue(validText)

                const result = await matcherFn.call({ isNot: true }, browser, validText, { wait: 1, trim: false }) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect window not to have ${matcherNameLastWords(matcherName)}

Expected [not]: " Valid Text "
Received      : " Valid Text "`
                )
            })

            test('not - success (with wait) - pass should be false', async () => {
                browser[browserFnName] = vi.fn().mockResolvedValue(wrongText)

                const result = await matcherFn.call({ isNot: true }, browser, validText, { wait: 1 }) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('message', async () => {
                const result = await matcherFn.call({}, browser) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect window to have ${matcherNameLastWords(matcherName)}

Expected: undefined
Received: " Wrong Text "`)
            })
        })
    })
})

