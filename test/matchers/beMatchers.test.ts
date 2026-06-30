import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest'
import { $ } from '@wdio/globals'
import { lastMatcherWords } from '../__fixtures__/utils.js'
import * as Matchers from '../../src/matchers.js'
import { executeCommandBe, waitUntil } from '../../src/utils.js'
import { toBeChecked, toBeClickable, toBeDisplayedInViewport, toBeEnabled, toBeExisting, toBeFocused, toBePresent, toBeSelected, toExist } from '../../src/matchers.js'
import { setOptions } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../src/constants.js'
import stripAnsi from 'strip-ansi'

vi.mock('@wdio/globals')

const ignoredMatchers = ['toBeElementsArrayOfSize', 'toBeRequested', 'toBeRequestedTimes', 'toBeRequestedWithResponse', 'toBeRequestedWith', 'toBeDisplayed', 'toBeDisabled']

vi.mock('../../src/utils.js', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('../../src/utils.js')>()
    return {
        ...actual,
        executeCommandBe: vi.fn(actual.executeCommandBe)
    }
})

type BooleanElementMethod = 'isSelected' | 'isClickable' | 'isDisplayed' | 'isEnabled' | 'isExisting' | 'isFocused'

const beMatchers = new Map<Function, BooleanElementMethod>([
    [toBeChecked, 'isSelected'],
    [toBeClickable, 'isClickable'],
    [toBeDisplayedInViewport, 'isDisplayed'],
    [toBeEnabled, 'isEnabled'],
    [toBeExisting, 'isExisting'],
    [toBeFocused, 'isFocused'],
    [toBePresent, 'isExisting'],
    [toBeSelected, 'isSelected'],
    [toExist, 'isExisting'],
])

describe('be* matchers', () => {
    describe('Ensure all toBe matchers are covered', () => {

        test('all toBe matchers are covered in beMatchers', () => {
            const matcherFnNames = Object.keys(Matchers).filter(name => name.startsWith('toBe') && !ignoredMatchers.includes(name))
            matcherFnNames.push('toExist')
            matcherFnNames.sort()

            const beMatcherNames = Array.from(beMatchers.keys()).map(matcher => matcher.name)
            expect(beMatcherNames).toEqual(matcherFnNames)
        })
    })

    beMatchers.forEach((elFnName, matcherFn) => {
        const elementFnName = elFnName

        describe(matcherFn.name, () => {
            let thisContext: { matcherFn: typeof matcherFn }
            let thisNotContext: { isNot: true,  matcherFn: typeof matcherFn }

            let el: ChainablePromiseElement

            beforeEach(async () => {
                thisContext = { matcherFn }
                thisNotContext = { isNot: true,  matcherFn }
                el = await $('sel')
            })

            describe('given single element', () => {
                test('wait for success', async () => {
                    const beforeAssertion = vi.fn()
                    const afterAssertion = vi.fn()
                    vi.mocked(el[elementFnName]).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

                    const result = await thisContext.matcherFn(el, { beforeAssertion, afterAssertion, wait: 125, interval: 50 })

                    expect(result.pass).toBe(true)
                    expect(el[elementFnName]).toHaveBeenCalledTimes(2)

                    expect(executeCommandBe).toHaveBeenCalledExactlyOnceWith(el, expect.any(Function),
                        {
                            afterAssertion,
                            beforeAssertion,
                            wait: 125,
                            interval: 50
                        },
                    )
                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, { wait: 125, interval: 50 })
                    expect(beforeAssertion).toHaveBeenCalledWith({
                        matcherName: matcherFn.name,
                        options: { beforeAssertion, afterAssertion, wait: 125, interval: 50 }
                    })
                    expect(afterAssertion).toHaveBeenCalledWith({
                        matcherName: matcherFn.name,
                        options: { beforeAssertion, afterAssertion, wait: 125, interval: 50 },
                        result
                    })
                })

                test('wait but error', async () => {
                    const el = await $('sel')

                    vi.mocked(el[elementFnName]).mockRejectedValue(new Error('some error'))

                    await expect(() => thisContext.matcherFn(el))
                        .rejects.toThrow('some error')
                })

                test('success on the first attempt', async () => {
                    const el = await $('sel')

                    vi.mocked(el[elementFnName]).mockResolvedValue(true)

                    const result = await thisContext.matcherFn(el)
                    expect(result.pass).toBe(true)
                    expect(el[elementFnName]).toHaveBeenCalledTimes(1)
                })

                test('no wait - failure', async () => {
                    const el = await $('sel')

                    vi.mocked(el[elementFnName]).mockResolvedValue(false)

                    const result = await thisContext.matcherFn(el, { wait: 0 })
                    expect(result.pass).toBe(false)
                    expect(el[elementFnName]).toHaveBeenCalledTimes(1)
                })

                test('no wait - success', async () => {
                    const el = await $('sel')

                    vi.mocked(el[elementFnName]).mockResolvedValue(true)

                    const result = await thisContext.matcherFn(el, { wait: 0 })
                    expect(result.pass).toBe(true)
                    expect(el[elementFnName]).toHaveBeenCalledTimes(1)
                })

                test('not - failure - pass should be true', async () => {
                    const el = await $('sel')

                    const result = await thisNotContext.matcherFn(el)

                    expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                    if (matcherFn.name === 'toExist') {return}
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to be ${lastMatcherWords(matcherFn.name)}

Expected: "not ${lastMatcherWords(matcherFn.name)}"
Received: "${lastMatcherWords(matcherFn.name)}"`
                    )
                })

                test('not - success - pass should be false', async () => {
                    const el = await $('sel')
                    vi.mocked(el[elementFnName]).mockResolvedValue(false)

                    const result = await thisNotContext.matcherFn(el, { wait: 0 })

                    expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                })

                test('not - failure (with wait) - pass should be true', async () => {
                    const el = await $('sel')

                    const result = await thisNotContext.matcherFn(el)

                    expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                })

                test('not - success (with wait) - pass should be false', async () => {
                    const el = await $('sel')
                    vi.mocked(el[elementFnName]).mockResolvedValue(false)

                    const result = await thisNotContext.matcherFn(el)

                    expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                })

                test('message', async () => {
                    const el = await $('sel')
                    vi.mocked(el[elementFnName]).mockResolvedValue(false)

                    const result = await thisContext.matcherFn(el, { wait: 0 })

                    expect(result.pass).toBe(false)
                    if (matcherFn.name === 'toExist') {return}
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to be ${lastMatcherWords(matcherFn.name)}

Expected: "${lastMatcherWords(matcherFn.name)}"
Received: "not ${lastMatcherWords(matcherFn.name)}"`)
                })
            })

            // TODO dprevost find a way to cancel mocked from globals.ts to test setOptions()
            describe.skip('global options', () => {
                const defaultOptions =  { ...DEFAULT_OPTIONS }

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
