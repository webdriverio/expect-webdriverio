import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest'
import { $ } from '@wdio/globals'
import { lastMatcherWords } from '../__fixtures__/utils.js'
import * as Matchers from '../../src/matchers.js'
import { executeCommandBe, waitUntil } from '../../src/utils.js'
import { setOptions } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../src/constants.js'
import stripAnsi from 'strip-ansi'
import { toBeChecked, toBeClickable, toBeDisplayedInViewport, toBeEnabled, toBeExisting, toBeFocused, toBePresent, toBeSelected, toExist } from '../../src/matchers.js'

vi.mock('@wdio/globals')

const ignoredMatchers = ['toBeElementsArrayOfSize', 'toBeRequested', 'toBeRequestedTimes', 'toBeRequestedWithResponse', 'toBeRequestedWith', 'toBeDisplayed', 'toBeDisabled']

type ElementKeyFnTypes =  WebdriverIO.Element['isSelected'] | WebdriverIO.Element['isClickable'] | WebdriverIO.Element['isDisplayed'] | WebdriverIO.Element['isEnabled'] | WebdriverIO.Element['isExisting'] | WebdriverIO.Element['isFocused'] | WebdriverIO.Element['isExisting']
type MatcherfnTypes = typeof toBeChecked | typeof toBeClickable | typeof toBeDisplayedInViewport | typeof toBeEnabled | typeof toBeExisting | typeof toBeFocused | typeof toBePresent | typeof toBeSelected | typeof toExist

const beMatchers = new Map<MatcherfnTypes, keyof WebdriverIO.Element>([
    [toBeChecked, 'isSelected'],
    [toBeClickable, 'isClickable'],
    [toBeDisplayedInViewport, 'isDisplayed'],
    [toBeEnabled, 'isEnabled'],
    [toBeExisting, 'isExisting'],
    [toBeFocused, 'isFocused'],
    [toBePresent, 'isExisting'],
    [toBeSelected, 'isSelected'],
    [toExist, 'isExisting']
])

describe('be* matchers', () => {
    describe('Ensure all toBe matchers are covered', () => {

        test('all toBe matchers are covered in beMatchers', () => {
            const matcherFnNames = Object.keys(Matchers).filter(name => name.startsWith('toBe') && !ignoredMatchers.includes(name))
            matcherFnNames.push('toExist')
            matcherFnNames.sort()

            const beMatcherNames = Array.from(beMatchers.keys()).map(matcher => matcher.name).sort()
            expect(beMatcherNames).toEqual(matcherFnNames)
        })
    })

    Array.from(beMatchers.entries()).forEach(([matcherFn, elFnName]) => {
        const elementFnName = elFnName

        describe(matcherFn, () => {
            let thisContext: { matcherFn: typeof matcherFn }
            let thisNotContext: { isNot: true,  matcherFn: typeof matcherFn }

            let el: ChainablePromiseElement
            let elementFn: ElementKeyFnTypes

            beforeEach(async () => {
                thisContext = { matcherFn }
                thisNotContext = { isNot: true,  matcherFn }
                el = await $('sel')
                elementFn = (await el.getElement())[elementFnName] as ElementKeyFnTypes
                vi.mocked(elementFn).mockResolvedValue(true)
            })

            describe('given single element', () => {
                test('wait for success', async () => {
                    const beforeAssertion = vi.fn()
                    const afterAssertion = vi.fn()
                    vi.mocked(elementFn).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

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
                        matcherName: elementFn.name === 'isExisting' ? 'toExist': matcherFn.name,
                        options: { beforeAssertion, afterAssertion, wait: 125, interval: 50 }
                    })
                    expect(afterAssertion).toHaveBeenCalledWith({
                        matcherName: elementFn.name === 'isExisting' ? 'toExist': matcherFn.name,
                        options: { beforeAssertion, afterAssertion, wait: 125, interval: 50 },
                        result
                    })
                })

                test('wait but error', async () => {
                    vi.mocked(elementFn).mockRejectedValue(new Error('some error'))

                    await expect(() => thisContext.matcherFn(el))
                        .rejects.toThrow('some error')
                })

                test('success on the first attempt', async () => {
                    const result = await thisContext.matcherFn(el)

                    expect(result.pass).toBe(true)
                    expect(elementFn).toHaveBeenCalledTimes(1)
                })

                test('no wait - failure', async () => {
                    vi.mocked(elementFn).mockResolvedValue(false)

                    const result = await thisContext.matcherFn(el, { wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(elementFn).toHaveBeenCalledTimes(1)
                })

                test('no wait - success', async () => {
                    const result = await thisContext.matcherFn(el, { wait: 0 })

                    expect(result.pass).toBe(true)
                    expect(elementFn).toHaveBeenCalledTimes(1)
                })

                test('not - failure - pass should be true', async () => {
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
                    vi.mocked(elementFn).mockResolvedValue(false)

                    const result = await thisNotContext.matcherFn(el, { wait: 0 })

                    expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                })

                test('not - failure (with wait) - pass should be true', async () => {
                    const result = await thisNotContext.matcherFn(el)

                    expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                })

                test('not - success (with wait) - pass should be false', async () => {
                    vi.mocked(elementFn).mockResolvedValue(false)

                    const result = await thisNotContext.matcherFn(el)

                    expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                })

                test('message', async () => {
                    vi.mocked(elementFn).mockResolvedValue(false)

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

                    await thisContext.matcherFn(el)

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
