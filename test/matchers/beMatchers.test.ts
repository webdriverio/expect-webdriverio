import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { lastMatcherWords } from '../__fixtures__/utils.js'
import * as Matchers from '../../src/matchers.js'
import { executeCommandBe, waitUntil } from '../../src/utils.js'

vi.mock('@wdio/globals')

const ignoredMatchers = ['toBeElementsArrayOfSize', 'matcherFn', 'matcherFn', 'toBeRequested', 'toBeRequestedTimes', 'toBeRequestedWithResponse', 'toBeRequestedWith', 'toBeDisplayed', 'toBeDisabled']
const beMatchers = {
    'toBeChecked': 'isSelected',
    'toBeClickable': 'isClickable',
    'toBeDisplayedInViewport': 'isDisplayed',
    'toBeEnabled': 'isEnabled',
    'toBeExisting': 'isExisting',
    'toBeFocused': 'isFocused',
    'toBePresent': 'isExisting',
    'toBeSelected': 'isSelected',
    'toExist': 'isExisting',
} satisfies Partial<Record<keyof typeof Matchers, keyof WebdriverIO.Element>>

describe('be* matchers', () => {
    describe('Ensure all toBe matchers are covered', () => {

        test('all toBe matchers are covered in beMatchers', () => {
            const matcherNames = Object.keys(Matchers).filter(name => name.startsWith('toBe') && !ignoredMatchers.includes(name))
            matcherNames.push('toExist')
            matcherNames.sort()

            expect(Object.keys(beMatchers)).toEqual(matcherNames)
        })
    })

    Object.entries(beMatchers).forEach(([matcherName, elementFnName]) => {
        const matcherFn = Matchers[matcherName as keyof typeof Matchers] as (...args: any[]) => Promise<ExpectWebdriverIO.AssertionResult>

        describe(matcherName, () => {

            describe('given single element', () => {
                test('wait for success', async () => {
                    const el = await $('sel')

                    el[elementFnName] = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)

                    const result = await matcherFn.call({}, el) as ExpectWebdriverIO.AssertionResult

                    expect(result.pass).toBe(true)
                    expect(el[elementFnName]).toHaveBeenCalledTimes(2)
                })

                test('wait but error', async () => {
                    const el = await $('sel')

                    el[elementFnName] = vi.fn().mockRejectedValue(new Error('some error'))

                    await expect(() => matcherFn.call({}, el, { wait: 0 }))
                        .rejects.toThrow('some error')
                })

                test('success on the first attempt', async () => {
                    const el = await $('sel')

                    el[elementFnName] = vi.fn().mockResolvedValue(true)

                    const result = await matcherFn.call({}, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult
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

                test('not - failure', async () => {
                    const el = await $('sel')

                    const result = await matcherFn.call({ isNot: true }, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult

                    expect(result.pass).toBe(false)
                    if (matcherName === 'toExist') {return}
                    expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to be ${lastMatcherWords(matcherName)}

Expected: "not ${lastMatcherWords(matcherName)}"
Received: "${lastMatcherWords(matcherName)}"`
                    )
                })

                test('not - success', async () => {
                    const el = await $('sel')

                    el[elementFnName] = vi.fn().mockResolvedValue(false)

                    const result = await matcherFn.call({ isNot: true }, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult

                    expect(result.pass).toBe(true)
                })

                test('not - failure (with wait)', async () => {
                    const el = await $('sel')

                    const result = await matcherFn.call({ isNot: true }, el, { wait: 1 }) as ExpectWebdriverIO.AssertionResult

                    expect(result.pass).toBe(false)
                })

                test('not - success (with wait)', async () => {
                    const el = await $('sel')
                    el[elementFnName] = vi.fn().mockResolvedValue(false)

                    const result = await matcherFn.call({ isNot: true }, el, { wait: 1 }) as ExpectWebdriverIO.AssertionResult

                    expect(result.pass).toBe(true)
                })

                test('message', async () => {
                    const el = await $('sel')
                    el[elementFnName] = vi.fn().mockResolvedValue(false)

                    const result = await matcherFn.call({}, el, { wait: 0 }) as ExpectWebdriverIO.AssertionResult

                    expect(result.pass).toBe(false)
                    if (matcherName === 'toExist') {return}
                    expect(result.message()).toEqual(`\
Expect $(\`sel\`) to be ${lastMatcherWords(matcherName)}

Expected: "${lastMatcherWords(matcherName)}"
Received: "not ${lastMatcherWords(matcherName)}"`)
                })
            })

            describe('given multiple elements', () => {
                let elements: ChainablePromiseArray

                beforeEach(async () => {
                    elements = await $$('sel')
                    for (const element of elements) {
                        element[elementFnName] = vi.fn().mockResolvedValue(true)
                    }
                    expect(elements).toHaveLength(2)
                })

                test('wait for success', async () => {
                    const beforeAssertion = vi.fn()
                    const afterAssertion = vi.fn()

                    const result = await matcherFn.call({}, elements, { beforeAssertion, afterAssertion }) as ExpectWebdriverIO.AssertionResult

                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalled()
                    }

                    expect(executeCommandBe).toHaveBeenCalledExactlyOnceWith(elements, expect.any(Function),
                        {
                            'afterAssertion': afterAssertion,
                            'beforeAssertion': beforeAssertion,
                        },
                    )
                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  {})

                    expect(result.pass).toEqual(true)
                    expect(beforeAssertion).toBeCalledWith({
                        matcherName,
                        options: { beforeAssertion, afterAssertion }
                    })
                    expect(afterAssertion).toBeCalledWith({
                        matcherName,
                        options: { beforeAssertion, afterAssertion },
                        result
                    })
                })

                test('success with matcherFn and command options', async () => {
                    const result = await matcherFn.call({}, elements, { wait: 0 })

                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalledOnce()
                    }
                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  { wait: 0 })
                    expect(result.pass).toBe(true)
                })

                test('wait but failure', async () => {
                    elements[0][elementFnName] = vi.fn().mockRejectedValue(new Error('some error'))

                    await expect(() => matcherFn.call({}, elements, { wait: 0 }))
                        .rejects.toThrow('some error')
                })

                test('success on the first attempt', async () => {
                    const result = await matcherFn.call({}, elements, { wait: 0 })

                    expect(result.pass).toBe(true)
                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalledTimes(1)
                    }
                })

                test('no wait - failure', async () => {
                    elements[0][elementFnName] = vi.fn().mockResolvedValue(false)

                    const result = await matcherFn.call({}, elements, { wait: 0 })

                    expect(result.pass).toBe(false)
                    expect(elements[0][elementFnName]).toHaveBeenCalledTimes(1)
                    expect(elements[1][elementFnName]).toHaveBeenCalledTimes(1)
                })

                test('no wait - success', async () => {
                    const result = await matcherFn.call({}, elements, { wait: 0 })

                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined,  {
                        wait: 0,
                    })
                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalled()
                    }
                    expect(result.pass).toBe(true)
                })

                test('not - failure', async () => {
                    const result = await matcherFn.call({ isNot: true }, elements, { wait: 0 })

                    expect(result.pass).toBe(false)
                    if ( matcherName === 'toExist') {return}
                    expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) not to be ${lastMatcherWords(matcherName)}

Expected: "not ${lastMatcherWords(matcherName)}"
Received: "${lastMatcherWords(matcherName)}"`
                    )
                })

                test('not - success', async () => {
                    for (const element of elements) {
                        element[elementFnName] = vi.fn().mockResolvedValue(false)
                    }

                    const result = await matcherFn.call({ isNot: true }, elements, { wait: 0 })

                    expect(result.pass).toBe(true)
                })

                test('not - failure (with wait)', async () => {
                    const result = await matcherFn.call({ isNot: true }, elements, { wait: 0 })

                    expect(result.pass).toBe(false)
                    if ( matcherName === 'toExist') {return}
                    expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) not to be ${lastMatcherWords(matcherName)}

Expected: "not ${lastMatcherWords(matcherName)}"
Received: "${lastMatcherWords(matcherName)}"`)
                })

                test('not - success (with wait)', async () => {
                    for (const element of elements) {
                        element[elementFnName] = vi.fn().mockResolvedValue(false)
                    }

                    const result = await matcherFn.call({ isNot: true }, elements, { wait: 0 })

                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), true,  {
                        wait: 0,
                    })
                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalled()
                    }
                    expect(result.pass).toBe(true)
                })

                test('message when both elements fail', async () => {
                    const elements = await $$('sel')

                    for (const element of elements) {
                        element[elementFnName] = vi.fn().mockResolvedValue(false)
                    }

                    const result = await matcherFn.call({}, elements, { wait: 0 })
                    if (matcherName === 'toExist') {return}
                    expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to be ${lastMatcherWords(matcherName)}

Expected: "${lastMatcherWords(matcherName)}"
Received: "not ${lastMatcherWords(matcherName)}"`)
                })

                test('message when a single element fails', async () => {
                    elements[0][elementFnName] = vi.fn().mockResolvedValue(false)

                    const result = await matcherFn.call({}, elements, { wait: 0 })

                    if (matcherName === 'toExist') {
                        expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to exist

Expected: "exist"
Received: "not exist"`)
                        return
                    }

                    expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to be ${lastMatcherWords(matcherName)}

Expected: "${lastMatcherWords(matcherName)}"
Received: "not ${lastMatcherWords(matcherName)}"`)
                })

                describe('fails with ElementArray', () => {
                    let elementsArray: WebdriverIO.ElementArray

                    beforeEach(async () => {
                        elementsArray = await $$('sel').getElements()
                        for (const element of elementsArray) {
                            element[elementFnName] = vi.fn().mockResolvedValue(true)
                        }
                        expect(elementsArray).toHaveLength(2)
                    })

                    test('success with ElementArray', async () => {
                        const result = await matcherFn.call({}, elementsArray, { wait: 0 })

                        for (const element of elementsArray) {
                            expect(element[elementFnName]).toHaveBeenCalled()
                        }

                        expect(result.pass).toBe(true)
                    })

                    test('fails with ElementArray', async () => {
                        elementsArray[1][elementFnName] = vi.fn().mockResolvedValue(false)

                        const result = await matcherFn.call({}, elementsArray, { wait: 0 })

                        for (const element of elementsArray) {
                            expect(element[elementFnName]).toHaveBeenCalled()
                        }

                        expect(result.pass).toBe(false)
                        if ( matcherName === 'toExist') {
                            expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to exist

Expected: "exist"
Received: "not exist"`)
                            return
                        }

                        expect(result.message()).toEqual(`\
Expect $$(\`sel, <props>\`) to be ${lastMatcherWords(matcherName)}

Expected: "${lastMatcherWords(matcherName)}"
Received: "not ${lastMatcherWords(matcherName)}"`)
                    })

                    describe('given filtered elememts (Element[])', () => {
                        let filteredElements: WebdriverIO.Element[]
                        test('success with Element[]', async () => {
                            filteredElements = await elementsArray.filter((element) => element.isExisting())

                            const result = await matcherFn.call({}, filteredElements, { wait: 0 })

                            for (const element of filteredElements) {
                                expect(element[elementFnName]).toHaveBeenCalled()
                            }
                            expect(result.pass).toBe(true)
                        })

                        test('fails with Element[]', async () => {
                            filteredElements = await elementsArray.filter((element) => element.isExisting())

                            filteredElements[1][elementFnName] = vi.fn().mockResolvedValue(false)

                            const result = await matcherFn.call({}, filteredElements, { wait: 0 })

                            for (const element of filteredElements) {
                                expect(element[elementFnName]).toHaveBeenCalled()
                            }

                            expect(result.pass).toBe(false)
                            if ( matcherName === 'toExist') {return}
                            expect(result.message()).toEqual(`\
Expect $(\`sel\`), $$(\`sel\`)[1] to be ${lastMatcherWords(matcherName)}

Expected: "${lastMatcherWords(matcherName)}"
Received: "not ${lastMatcherWords(matcherName)}"`)
                        })
                    })
                })
            })
        })
    })
})
