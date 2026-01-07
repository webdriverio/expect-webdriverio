import { vi, test, describe, expect } from 'vitest'
import { $ } from '@wdio/globals'
import { getExpectMessage, getReceived, matcherNameToString } from '../__fixtures__/utils.js'
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
} satisfies Record<string, keyof WebdriverIO.Element>

describe('be* matchers', () => {
    describe('Ensure all toBe matchers are covered', () => {

        test('all toBe matchers are covered in beMatchers', () => {
            const matcherNames = Object.keys(Matchers).filter(name => name.startsWith('toBe') && !ignoredMatchers.includes(name))
            matcherNames.sort()

            expect(Object.keys(beMatchers)).toEqual(matcherNames)
        })
    })

    Object.entries(beMatchers).forEach(([name, fnName]) => {
        const matcherFn = Matchers[name as keyof typeof Matchers] // .bind({})

        describe(name, () => {
            test('wait for success', async () => {
                const el = await $('sel')

                el[fnName] = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

                const result = await matcherFn.call({}, el) as ExpectWebdriverIO.AssertionResult

                expect(result.pass).toBe(true)
                expect(el[fnName]).toHaveBeenCalledTimes(3)
            })

            test('wait but failure', async () => {
                const el = await $('sel')

                el[fnName] = vi.fn().mockRejectedValue(new Error('some error'))

                await expect(() => matcherFn.call({}, el, 10, {}))
                    .rejects.toThrow('some error')
            })

            test('success on the first attempt', async () => {
                const el = await $('sel')

                el[fnName] = vi.fn().mockResolvedValue(true)

                const result = await matcherFn.call({}, el) as ExpectWebdriverIO.AssertionResult
                expect(result.pass).toBe(true)
                expect(el[fnName]).toHaveBeenCalledTimes(1)
            })

            test('no wait - failure', async () => {
                const el = await $('sel')

                el[fnName] = vi.fn().mockResolvedValue(false)

                const result = await matcherFn.call({}, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult
                expect(result.pass).toBe(false)
                expect(el[fnName]).toHaveBeenCalledTimes(1)
            })

            test('no wait - success', async () => {
                const el = await $('sel')

                el[fnName] = vi.fn().mockResolvedValue(true)

                const result = await matcherFn.call({}, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult
                expect(result.pass).toBe(true)
                expect(el[fnName]).toHaveBeenCalledTimes(1)
            })

            test('not - failure', async () => {
                const el = await $('sel')

                const result = await matcherFn.call({ isNot: true }, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult
                const received = getReceived(result.message())

                expect(received).not.toContain('not')
                expect(result.pass).toBe(true)
            })

            test('not - success', async () => {
                const el = await $('sel')

                el[fnName] = vi.fn().mockResolvedValue(false)

                const result = await matcherFn.call({ isNot: true }, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult
                const received = getReceived(result.message())

                expect(received).toContain('not')
                expect(result.pass).toBe(false)
            })

            test('not - failure (with wait)', async () => {
                const el = await $('sel')

                const result = await matcherFn.call({ isNot: true }, el, { wait: 1 }) as ExpectWebdriverIO.AssertionResult
                const received = getReceived(result.message())

                expect(received).not.toContain('not')
                expect(result.pass).toBe(true)
            })

            test('not - success (with wait)', async () => {
                const el = await $('sel')
                el[fnName] = vi.fn().mockResolvedValue(false)

                const result = await matcherFn.call({ isNot: true }, el, { wait: 1 }) as ExpectWebdriverIO.AssertionResult

                const received = getReceived(result.message())
                expect(received).toContain('not')
                expect(result.pass).toBe(false)
            })

            test('message', async () => {
                const el = await $('sel')
                el[fnName] = vi.fn().mockResolvedValue(false)

                const result = await matcherFn.call({}, el) as ExpectWebdriverIO.AssertionResult
                expect(getExpectMessage(result.message()))
                    .toContain(matcherNameToString(name))
            })
        })
    })
})
