import { vi, test, describe, expect, afterEach, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'
import { matcherNameLastWords } from '../__fixtures__/utils.js'
import * as Matchers from '../../src/matchers.js'
import { setOptions } from '../../src/index.js'
import { DEFAULT_OPTIONS } from '../../src/constants.js'
import { executeCommandBe } from '../../src/utils.js'

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

vi.mock('../../src/utils.js', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('../../src/utils.js')>()
    return {
        ...actual,
        executeCommandBe: vi.fn(actual.executeCommandBe)
    }
})

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
Expect $(\`sel\`) not to be ${matcherNameLastWords(matcherName)}

Expected: "not ${matcherNameLastWords(matcherName)}"
Received: "${matcherNameLastWords(matcherName)}"`
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
Expect $(\`sel\`) to be ${matcherNameLastWords(matcherName)}

Expected: "${matcherNameLastWords(matcherName)}"
Received: "not ${matcherNameLastWords(matcherName)}"`
                )
            })

            describe('global options', () => {
                const defaultOptions = { ...DEFAULT_OPTIONS }

                beforeEach(() => {
                    // Set global options to custom values before each test
                    setOptions({ wait: 99, interval: 101 })
                })

                afterEach(() => {
                    // Reset options after each test to avoid side effects
                    setOptions(defaultOptions)
                    expect(DEFAULT_OPTIONS.wait).not.toBe(99)
                })

                test('should use globally set default options', async () => {
                    const el = await $('sel')
                    el.isDisplayed = vi.fn().mockResolvedValue(true)

                    await matcherFn.call({}, el)

                    expect(DEFAULT_OPTIONS.wait).toBe(99)
                    expect(executeCommandBe).toHaveBeenCalledWith(
                        el,
                        expect.anything(),
                        expect.objectContaining({ wait: 99, interval: 101 })
                    )
                })
            })
        })
    })
})
