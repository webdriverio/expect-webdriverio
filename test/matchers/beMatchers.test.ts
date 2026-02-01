import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'
import { matcherLastWordName } from '../__fixtures__/utils.js'
import * as Matchers from '../../src/matchers.js'

vi.mock('@wdio/globals')

const ignoredMatchers = ['toBeElementsArrayOfSize', 'toBeDisabled', 'toBeDisplayed', 'toBeRequested', 'toBeRequestedTimes', 'toBeRequestedWithResponse', 'toBeRequestedWith']
const beMatchers = {
    'toBeChecked': 'isSelected',
    'toBeClickable': 'isClickable',
    'toBeDisplayedInViewport': 'isDisplayed',
    'toBeEnabled': 'isEnabled',
    'toBeExisting': 'isExisting',
    'toBeFocused': 'isFocused',
    'toBePresent': 'isExisting',
    'toBeSelected': 'isSelected',
} satisfies Partial<Record<keyof typeof Matchers, keyof WebdriverIO.Element>>

describe('be* matchers', () => {
    describe('Ensure all toBe matchers are covered', () => {

        test('all toBe matchers are covered in beMatchers', () => {
            const matcherNames = Object.keys(Matchers).filter(name => name.startsWith('toBe') && !ignoredMatchers.includes(name))
            matcherNames.sort()

            expect(Object.keys(beMatchers)).toEqual(matcherNames)
        })
    })

    Object.entries(beMatchers).forEach(([matcherName, elementFnName]) => {
        const matcherFn = Matchers[matcherName as keyof typeof Matchers]

        describe(matcherName, () => {
            test('wait for success', async () => {
                const el = await $('sel')

                el[elementFnName] = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

                const result = await matcherFn.call({}, el) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(true)
                expect(el[elementFnName]).toHaveBeenCalledTimes(3)
            })

            test('wait but failure', async () => {
                const el = await $('sel')

                el[elementFnName] = vi.fn().mockRejectedValue(new Error('some error'))

                await expect(() => matcherFn.call({}, el, 10, {}))
                    .rejects.toThrow('some error')
            })

            test('success on the first attempt', async () => {
                const el = await $('sel')

                el[elementFnName] = vi.fn().mockResolvedValue(true)

                const result = await matcherFn.call({}, el) as ExpectWebdriverIO.AssertionResult
                expect(result.pass).toBe(true)
                expect(el[elementFnName]).toHaveBeenCalledTimes(1)
            })

            test('no wait - failure', async () => {
                const el = await $('sel')

                el[elementFnName] = vi.fn().mockResolvedValue(false)

                const result = await matcherFn.call({}, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult
                expect(result.pass).toBe(false)
                expect(el[elementFnName]).toHaveBeenCalledTimes(1)
            })

            test('no wait - success', async () => {
                const el = await $('sel')

                el[elementFnName] = vi.fn().mockResolvedValue(true)

                const result = await matcherFn.call({}, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult
                expect(result.pass).toBe(true)
                expect(el[elementFnName]).toHaveBeenCalledTimes(1)
            })

            test('not - failure - pass should be true', async () => {
                const el = await $('sel')

                const result = await matcherFn.call({ isNot: true }, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to be ${matcherLastWordName(matcherName)}

Expected [not]: "not ${matcherLastWordName(matcherName)}"
Received      : "${matcherLastWordName(matcherName)}"`
                )
            })

            test('not - success - pass should be false', async () => {
                const el = await $('sel')

                el[elementFnName] = vi.fn().mockResolvedValue(false)

                const result = await matcherFn.call({ isNot: true }, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - failure (with wait) - pass should be true', async () => {
                const el = await $('sel')

                const result = await matcherFn.call({ isNot: true }, el, { wait: 1 }) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            })

            test('not - success (with wait) - pass should be false', async () => {
                const el = await $('sel')
                el[elementFnName] = vi.fn().mockResolvedValue(false)
                const result = await matcherFn.call({ isNot: true }, el, { wait: 1 }) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('message', async () => {
                const el = await $('sel')
                el[elementFnName] = vi.fn().mockResolvedValue(false)

                const result = await matcherFn.call({}, el, { wait: 1 }) as ExpectWebdriverIO.AssertionResult
                expect(result.pass).toBe(false)
                expect(result.message()).toBe(`\
Expect $(\`sel\`) to be ${matcherLastWordName(matcherName)}

Expected: "${matcherLastWordName(matcherName)}"
Received: "not ${matcherLastWordName(matcherName)}"`
                )
            })
        })
    })
})
