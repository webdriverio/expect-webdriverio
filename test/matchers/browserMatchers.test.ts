import { vi, test, describe, expect } from 'vitest'
import { browser } from '@wdio/globals'

import { getExpectMessage, getReceived, matcherNameToString, getExpected } from '../__fixtures__/utils.js'
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

            test('wait but failure', async () => {
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

            test('not - failure', async () => {
                const result = await matcherFn.call({ isNot: true }, browser, validText, { wait: 0, trim: false }) as ExpectWebdriverIO.AssertionResult

                expect(getExpectMessage(result.message())).toContain('not')
                expect(getExpected(result.message())).toContain('not')

                expect(result.pass).toBe(true)
            })

            test('not - success', async () => {
                browser[browserFnName] = vi.fn().mockResolvedValue(wrongText)

                const result = await matcherFn.call({ isNot: true }, browser, validText, { wait: 0 }) as ExpectWebdriverIO.AssertionResult

                expect(getExpectMessage(result.message())).toContain('not')
                expect(getExpected(result.message())).toContain('Valid')
                expect(getReceived(result.message())).toContain('Wrong')

                expect(result.pass).toBe(false)
            })

            test('not - failure (with wait)', async () => {
                browser[browserFnName] = vi.fn().mockResolvedValue(validText)

                const result = await matcherFn.call({ isNot: true }, browser, validText, { wait: 1, trim: false }) as ExpectWebdriverIO.AssertionResult

                expect(getExpectMessage(result.message())).toContain('not')
                expect(getExpected(result.message())).toContain('not')

                expect(result.pass).toBe(true)
            })

            test('not - success (with wait)', async () => {
                browser[browserFnName] = vi.fn().mockResolvedValue(wrongText)

                const result = await matcherFn.call({ isNot: true }, browser, validText, { wait: 1 }) as ExpectWebdriverIO.AssertionResult

                expect(getExpectMessage(result.message())).toContain('not')
                expect(getExpected(result.message())).toContain('Valid')
                expect(getReceived(result.message())).toContain('Wrong')

                expect(result.pass).toBe(false)
            })

            test('message', async () => {
                const result = await matcherFn.call({}, browser) as ExpectWebdriverIO.AssertionResult
                expect(getExpectMessage(result.message())).toContain(matcherNameToString(matcherName))
            })
        })
    })
})

