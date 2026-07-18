import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { lastMatcherWords } from '../__fixtures__/utils.js'
import * as Matchers from '../../src/matchers.js'
import { executeCommandBe, waitUntil } from '../../src/utils.js'
import { DEFAULT_OPTIONS } from '../../src/constants.js'
import stripAnsi from 'strip-ansi'
import { toBeChecked, toBeClickable, toBeDisplayedInViewport, toBeEnabled, toBeExisting, toBeFocused, toBePresent, toBeSelected, toExist } from '../../src/matchers.js'
import { setDefaultOptions, setOptions } from '../../src/index.js'
import { chainableElementArrayFactory, elementArrayFactory, notFoundElementFactory } from '../__mocks__/@wdio/globals.js'

// vi.mock('@wdio/globals')

const ignoredMatchers = [
    'toBeElementsArrayOfSize', 'toBeRequested', 'toBeRequestedTimes', 'toBeRequestedWithResponse', 'toBeRequestedWith', 'toBeDisplayed', 'toBeDisabled'
]

const matcherPairs = [
    [toBeChecked, 'isSelected'],
    [toBeClickable, 'isClickable'],
    [toBeDisplayedInViewport, 'isDisplayed'],
    [toBeEnabled, 'isEnabled'],
    [toBeExisting, 'isExisting'],
    [toBeFocused, 'isFocused'],
    [toBePresent, 'isExisting'],
    [toBeSelected, 'isSelected'],
    [toExist, 'isExisting']
] as const

type MatcherfnTypes = typeof matcherPairs[number][0]
type ElementKeyNames = typeof matcherPairs[number][1]
type ElementKeyFnTypes = WebdriverIO.Element[ElementKeyNames]

const beMatchers = new Map<MatcherfnTypes, ElementKeyNames>(matcherPairs)

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

    Array.from(beMatchers.entries()).forEach(([matcherFn, elementFnName]) => {

        describe(matcherFn.name, () => {
            let thisContext: { matcherFn: typeof matcherFn }
            let thisNotContext: { isNot: true,  matcherFn: typeof matcherFn }

            const verb = matcherFn.name === 'toExist' ? 'to' : 'to be'

            let el: ChainablePromiseElement
            let elementFn: ElementKeyFnTypes

            beforeEach(async () => {
                thisContext = { matcherFn }
                thisNotContext = { isNot: true,  matcherFn }

                el = await $('sel')
                elementFn = el[elementFnName]
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
                        matcherName: elementFn.name === 'isExisting' ? 'toExist': matcherFn.name, // TODO fix in major version the wrong selector name for matcher aliases
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
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not ${verb} ${lastMatcherWords(matcherFn.name)}

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
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) ${verb} ${lastMatcherWords(matcherFn.name)}

Expected: "${lastMatcherWords(matcherFn.name)}"
Received: "not ${lastMatcherWords(matcherFn.name)}"`)
                })
            })

            describe('given multiple elements', () => {
                let elements: ChainablePromiseArray
                const selectorName = '$$(`sel`)'

                beforeEach(async () => {
                    elements = await $$('sel')
                    elements.forEach(element => {
                        vi.mocked(element[elementFnName]).mockResolvedValue(true)
                    })
                })

                test('wait for success', async () => {
                    const beforeAssertion = vi.fn()
                    const afterAssertion = vi.fn()

                    const result = await thisContext.matcherFn(elements, { beforeAssertion, afterAssertion, wait: 500 })

                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalled()
                    }

                    expect(executeCommandBe).toHaveBeenCalledExactlyOnceWith(elements, expect.any(Function),
                        {
                            afterAssertion,
                            beforeAssertion,
                            wait: 500
                        },
                    )
                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, { wait: 500, interval: undefined })
                    expect(result.pass).toEqual(true)
                    expect(beforeAssertion).toHaveBeenCalledWith({
                        matcherName: elementFn.name === 'isExisting' ? 'toExist': matcherFn.name, // TODO fix in major version the wrong selector name for matcher aliases
                        options: { beforeAssertion, afterAssertion, wait: 500 }
                    })
                    expect(afterAssertion).toHaveBeenCalledWith({
                        matcherName: elementFn.name === 'isExisting' ? 'toExist': matcherFn.name, // TODO fix in major version the wrong selector name for matcher aliases
                        options: { beforeAssertion, afterAssertion, wait: 500 },
                        result
                    })
                })

                test('success with matcherFn and custom command options', async () => {
                    const result = await thisContext.matcherFn(elements, { wait: 4, interval: 99 })

                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalledOnce()
                    }
                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, { wait: 4, interval: 99 })
                    expect(result.pass).toBe(true)
                })

                test('success with matcherFn and custom command options - only interval', async () => {
                    const result = await thisContext.matcherFn(elements, { interval: 99 })

                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalledOnce()
                    }
                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, { wait: undefined, interval: 99 })
                    expect(result.pass).toBe(true)
                })

                test('success with matcherFn and default command options', async () => {
                    const result = await thisContext.matcherFn(elements)

                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalledOnce()
                    }
                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, { wait: 20, interval: 1 })
                    expect(result.pass).toBe(true)
                })

                test('wait but failure', async () => {
                    vi.mocked(elements[0][elementFnName]).mockRejectedValue(new Error('some error'))

                    await expect(() => thisContext.matcherFn(elements))
                        .rejects.toThrow('some error')
                })

                test('success on the first attempt', async () => {
                    const result = await thisContext.matcherFn(elements)

                    expect(result.pass).toBe(true)
                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalledTimes(1)
                    }
                })

                test('no wait - failure', async () => {
                    vi.mocked(elements[0][elementFnName]).mockResolvedValue(false)

                    const result = await thisContext.matcherFn(elements, { wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(elements[0][elementFnName]).toHaveBeenCalledTimes(1)
                    expect(elements[1][elementFnName]).toHaveBeenCalledTimes(1)
                })

                test('no wait - success', async () => {
                    const result = await thisContext.matcherFn(elements)

                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, {
                        wait: 20,
                        interval: 1,
                    })
                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalled()
                    }
                    expect(result.pass).toBe(true)
                })

                test('not - failure - pass should be true', async () => {
                    const result = await thisNotContext.matcherFn(elements)

                    expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                    expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not ${verb} ${lastMatcherWords(matcherFn.name)}

- Expected  - 2
+ Received  + 2

  Array [
-   "not ${lastMatcherWords(matcherFn.name)}",
-   "not ${lastMatcherWords(matcherFn.name)}",
+   "${lastMatcherWords(matcherFn.name)}",
+   "${lastMatcherWords(matcherFn.name)}",
  ]`
                    )
                })

                test('not - success - pass should be false', async () => {
                    for (const element of elements) {
                        vi.mocked(element[elementFnName]).mockResolvedValue(false)
                    }

                    const result = await thisNotContext.matcherFn(elements)

                    expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                })

                test('not - failure (with wait) - pass should be true', async () => {
                    const result = await thisNotContext.matcherFn(elements)

                    expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                })

                test('not - success (with wait) - pass should be false', async () => {
                    for (const element of elements) {
                        vi.mocked(element[elementFnName]).mockResolvedValue(false)
                    }

                    const result = await thisNotContext.matcherFn(elements)

                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), true, {
                        wait: 20,
                        interval: 1,
                    })
                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalled()
                    }
                    expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                })

                test('message when both elements fail', async () => {
                    for (const element of elements) {
                        vi.mocked(element[elementFnName]).mockResolvedValue(false)
                    }

                    const result = await thisContext.matcherFn(elements)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} ${verb} ${lastMatcherWords(matcherFn.name)}

- Expected  - 2
+ Received  + 2

  Array [
-   "${lastMatcherWords(matcherFn.name)}",
-   "${lastMatcherWords(matcherFn.name)}",
+   "not ${lastMatcherWords(matcherFn.name)}",
+   "not ${lastMatcherWords(matcherFn.name)}",
  ]`)
                })

                test('message when a single element fails', async () => {
                    vi.mocked(elements[0][elementFnName]).mockResolvedValue(false)

                    const result = await thisContext.matcherFn(elements)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} ${verb} ${lastMatcherWords(matcherFn.name)}

- Expected  - 1
+ Received  + 1

  Array [
-   "${lastMatcherWords(matcherFn.name)}",
+   "not ${lastMatcherWords(matcherFn.name)}",
    "${lastMatcherWords(matcherFn.name)}",
  ]`)
                })

                describe('fails with ElementArray', () => {
                    let elementsArray: WebdriverIO.ElementArray

                    beforeEach(async () => {
                        elementsArray = await $$('sel').getElements()
                        for (const element of elementsArray) {
                            vi.mocked(element[elementFnName]).mockResolvedValue(true)
                        }
                        expect(elementsArray).toHaveLength(2)
                    })

                    test('success with ElementArray', async () => {
                        const result = await thisContext.matcherFn(elementsArray)

                        for (const element of elementsArray) {
                            expect(element[elementFnName]).toHaveBeenCalled()
                        }

                        expect(result.pass).toBe(true)
                    })

                    test('fails with ElementArray', async () => {
                        vi.mocked(elementsArray[1][elementFnName]).mockResolvedValue(false)

                        const result = await thisContext.matcherFn(elementsArray, { wait: 0 })

                        for (const element of elementsArray) {
                            expect(element[elementFnName]).toHaveBeenCalled()
                        }

                        expect(result.pass).toBe(false)

                        expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} ${verb} ${lastMatcherWords(matcherFn.name)}

- Expected  - 1
+ Received  + 1

  Array [
    "${lastMatcherWords(matcherFn.name)}",
-   "${lastMatcherWords(matcherFn.name)}",
+   "not ${lastMatcherWords(matcherFn.name)}",
  ]`)
                    })

                    describe('given filtered elements (Element[])', () => {
                        let filteredElements: WebdriverIO.Element[]
                        test('success with Element[]', async () => {
                            filteredElements = await elementsArray.filter((element) => element.isExisting())

                            const result = await thisContext.matcherFn(filteredElements)

                            for (const element of filteredElements) {
                                expect(element[elementFnName]).toHaveBeenCalled()
                            }
                            expect(result.pass).toBe(true)
                        })

                        test('fails with Element[]', async () => {
                            filteredElements = await elementsArray.filter((element) => element.isExisting())

                            vi.mocked(filteredElements[1][elementFnName]).mockResolvedValue(false)

                            const result = await thisContext.matcherFn(filteredElements)

                            for (const element of filteredElements) {
                                expect(element[elementFnName]).toHaveBeenCalled()
                            }

                            expect(result.pass).toBe(false)
                            expect(stripAnsi(result.message())).toEqual(`\
Expect [$$(\`sel\`)[0],$$(\`sel\`)[1]] ${verb} ${lastMatcherWords(matcherFn.name)}

- Expected  - 1
+ Received  + 1

  Array [
    "${lastMatcherWords(matcherFn.name)}",
-   "${lastMatcherWords(matcherFn.name)}",
+   "not ${lastMatcherWords(matcherFn.name)}",
  ]`)
                        })
                    })
                })
            })

            describe('Edge cases', () => {

                test.each([
                    { elements: [] as unknown as WebdriverIO.Element[], name: 'Element[]', selectorName: '[]' },
                    { elements: Promise.resolve([] as WebdriverIO.Element[]), name: 'Promise of Element[]', selectorName: '[]' },
                    { elements: elementArrayFactory('EmptyElementArray', 0), name: 'ElementArray', selectorName: '$$(`EmptyElementArray`)' },
                ])('should fail with proper error message when actual is an empty of $name', async ({ elements, selectorName }) => {
                    const result = await thisContext.matcherFn(elements)

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} ${verb} ${lastMatcherWords(matcherFn.name)}

Expected: "at least one result"
Received: []`)
                })

                test.skipIf(['toExist', 'toBeExisting', 'toBePresent'].includes(matcherFn.name)).each([
                    { elements: [] as unknown as WebdriverIO.Element[], name: 'Element[]', selectorName: '[]' },
                    { elements: Promise.resolve([] as WebdriverIO.Element[]), name: 'Promise of Element[]', selectorName: '[]' },
                    { elements: elementArrayFactory('EmptyElementArray', 0), name: 'ElementArray', selectorName: '$$(`EmptyElementArray`)' },
                ])('not - should fails (pass=true) with proper error message when actual is an empty of $name', async ({ elements, selectorName }) => {
                    const result = await thisNotContext.matcherFn(elements)

                    expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                    expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not ${verb} ${lastMatcherWords(matcherFn.name)}

Expected: "at least one result"
Received: []`)
                })

                test.runIf(['toExist', 'toBeExisting', 'toBePresent'].includes(matcherFn.name)).each([
                    { elements: [] as unknown as WebdriverIO.Element[], name: 'Element[]', selectorName: '[]' },
                    { elements: Promise.resolve([] as WebdriverIO.Element[]), name: 'Promise of Element[]', selectorName: '[]' },
                    { elements: elementArrayFactory('EmptyElementArray', 0), name: 'ElementArray', selectorName: '$$(`EmptyElementArray`)' },
                ])('not - should succeed (pass=false) when matcher uses isExisting and when actual is an empty of $name', async ({ elements }) => {
                    const result = await thisNotContext.matcherFn(elements)

                    expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                })

                // TODO view later to handle this case more gracefully
                test.skipIf(['toExist', 'toBeExisting', 'toBePresent'].includes(matcherFn.name))('given element is not found then it throws error when an element does not exists', async () => {
                    const element: WebdriverIO.Element = notFoundElementFactory('sel')

                    await expect(thisContext.matcherFn(element)).rejects.toThrow()
                })

                test.runIf(['toExist', 'toBeExisting', 'toBePresent'].includes(matcherFn.name))('given element is not found then it should not throw error with matcher using isExisting when an element does not exists', async () => {
                    const element: WebdriverIO.Element = notFoundElementFactory('sel')

                    const result = await thisContext.matcherFn(element)

                    expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                })

                test('given element from out of bound ChainableArray, then it throws error when an element does not exists', async () => {
                    const element: ChainablePromiseElement = $$('elements')[3]

                    await expect(thisContext.matcherFn(element)).rejects.toThrow('Index out of bounds! $$(elements) returned only 2 elements.')
                })

                test('given only one element in array when failures', async () => {
                    const elements = chainableElementArrayFactory('elements', 1)
                    vi.mocked(elements[0][elementFnName]).mockResolvedValue(false)

                    const results = await thisContext.matcherFn(elements)

                    expect(results.pass).toBe(false)
                    expect(stripAnsi(results.message())).toEqual(`\
Expect $$(\`elements\`) ${verb} ${lastMatcherWords(matcherFn.name)}

- Expected  - 1
+ Received  + 1

  Array [
-   "${lastMatcherWords(matcherFn.name)}",
+   "not ${lastMatcherWords(matcherFn.name)}",
  ]`
                    )
                })

                test('given the first element function fails to retrieve', async () => {
                    const elements = $$('elements')

                    vi.mocked(elements[0][elementFnName]).mockRejectedValue(new Error('Unable to retrieve text for first element'))
                    vi.mocked(elements[1][elementFnName]).mockResolvedValue(true)

                    await expect(thisContext.matcherFn(elements)).rejects.toThrow('Unable to retrieve text for first element')
                })

                test('given the second element getText fails to retrieve', async () => {
                    const elements = $$('elements')

                    vi.mocked(elements[0][elementFnName]).mockResolvedValue(true)
                    vi.mocked(elements[1][elementFnName]).mockRejectedValue(new Error('Unable to retrieve text for second element'))

                    await expect(thisContext.matcherFn(elements)).rejects.toThrow('Unable to retrieve text for second element')
                })

                test('given all elements getText fails to retrieve', async () => {
                    const elements = $$('elements')

                    vi.mocked(elements[0][elementFnName]).mockRejectedValue(new Error('Unable to retrieve text for first element'))
                    vi.mocked(elements[1][elementFnName]).mockRejectedValue(new Error('Unable to retrieve text for second element'))

                    await expect(thisContext.matcherFn(elements)).rejects.toThrow('Unable to retrieve text for first element')
                })
            })

            describe.each(
                [{ fn: setOptions, name: 'setOptions' }, { fn: setDefaultOptions, name: 'setDefaultOptions' }]
            )('Global default options with $name', ({ fn: setDefaultOptionsFn }) => {
                const defaultOptions =  { ...DEFAULT_OPTIONS }

                beforeEach(() => {
                    // Set global options to custom values before each test
                    setDefaultOptionsFn({ wait: 99, interval: 101 })
                })

                afterEach(() => {
                    // Reset options after each test to avoid side effects
                    setDefaultOptionsFn(defaultOptions)
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
