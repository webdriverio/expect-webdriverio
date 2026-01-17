import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { lastMatcherWords } from '../__fixtures__/utils.js'
import * as Matchers from '../../src/matchers.js'
import { executeCommandBe, waitUntil } from '../../src/utils.js'
import { toBeChecked, toBeClickable, toBeDisplayedInViewport, toBeEnabled, toBeExisting, toBeFocused, toBePresent, toBeSelected, toExist } from '../../src/matchers.js'

vi.mock('@wdio/globals')

const ignoredMatchers = ['toBeElementsArrayOfSize', 'toBeRequested', 'toBeRequestedTimes', 'toBeRequestedWithResponse', 'toBeRequestedWith', 'toBeDisplayed', 'toBeDisabled']

const beMatchers = new Map([
    [toBeChecked, 'isSelected' satisfies keyof WebdriverIO.Element],
    [toBeClickable, 'isClickable' satisfies keyof WebdriverIO.Element],
    [toBeDisplayedInViewport, 'isDisplayed' satisfies keyof WebdriverIO.Element],
    [toBeEnabled, 'isEnabled' satisfies keyof WebdriverIO.Element],
    [toBeExisting, 'isExisting' satisfies keyof WebdriverIO.Element],
    [toBeFocused, 'isFocused' satisfies keyof WebdriverIO.Element],
    [toBePresent, 'isExisting' satisfies keyof WebdriverIO.Element],
    [toBeSelected, 'isSelected' satisfies keyof WebdriverIO.Element],
    [toExist, 'isExisting' satisfies keyof WebdriverIO.Element],
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
        const elementFnName = elFnName as keyof WebdriverIO.Element
        const selectorName = '$$(`sel`)'

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
                    expect(beforeAssertion).toBeCalledWith({
                        matcherName: matcherFn.name,
                        options: { beforeAssertion, afterAssertion, wait: 125, interval: 50 }
                    })
                    expect(afterAssertion).toBeCalledWith({
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
                    expect(result.message()).toEqual(`\
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
                    expect(result.message()).toEqual(`\
Expect $(\`sel\`) to be ${lastMatcherWords(matcherFn.name)}

Expected: "${lastMatcherWords(matcherFn.name)}"
Received: "not ${lastMatcherWords(matcherFn.name)}"`)
                })
            })

            describe('given multiple elements', () => {
                let elements: ChainablePromiseArray

                beforeEach(async () => {
                    elements = await $$('sel')
                    for (const element of elements) {
                        vi.mocked(element[elementFnName]).mockResolvedValue(true)
                    }
                    expect(elements).toHaveLength(2)
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
                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, { wait: 500, interval: 100 })
                    expect(result.pass).toEqual(true)
                    expect(beforeAssertion).toBeCalledWith({
                        matcherName: matcherFn.name,
                        options: { beforeAssertion, afterAssertion, wait: 500 }
                    })
                    expect(afterAssertion).toBeCalledWith({
                        matcherName: matcherFn.name,
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
                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, { wait: 1, interval: 99 })
                    expect(result.pass).toBe(true)
                })

                test('success with matcherFn and default command options', async () => {
                    const result = await thisContext.matcherFn(elements)

                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalledOnce()
                    }
                    expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, { wait: 1, interval: 100 })
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
                        wait: 1,
                        interval: 100,
                    })
                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalled()
                    }
                    expect(result.pass).toBe(true)
                })

                test('not - failure - pass should be true', async () => {
                    const result = await thisNotContext.matcherFn(elements)

                    expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                    const verb = matcherFn.name === 'toExist' ? 'to' : 'to be'
                    expect(result.message()).toEqual(`\
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
                        vi.mocked(element[elementFnName]).mockResolvedValue(false,  { wait: 0 })
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
                        wait: 1,
                        interval: 100,
                    })
                    for (const element of elements) {
                        expect(element[elementFnName]).toHaveBeenCalled()
                    }
                    expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
                })

                test('message when both elements fail', async () => {
                    const elements = await $$('sel')

                    for (const element of elements) {
                        vi.mocked(element[elementFnName]).mockResolvedValue(false)
                    }

                    const result = await thisContext.matcherFn(elements)
                    const verb = matcherFn.name === 'toExist' ? 'to' : 'to be'
                    expect(result.message()).toEqual(`\
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
                    const verb = matcherFn.name === 'toExist' ? 'to' : 'to be'
                    expect(result.message()).toEqual(`\
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
                        const verb = matcherFn.name === 'toExist' ? 'to' : 'to be'
                        expect(result.message()).toEqual(`\
Expect ${selectorName} ${verb} ${lastMatcherWords(matcherFn.name)}

- Expected  - 1
+ Received  + 1

  Array [
    "${lastMatcherWords(matcherFn.name)}",
-   "${lastMatcherWords(matcherFn.name)}",
+   "not ${lastMatcherWords(matcherFn.name)}",
  ]`)
                    })

                    describe('given filtered elememts (Element[])', () => {
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
                            const verb = matcherFn.name === 'toExist' ? 'to' : 'to be'
                            expect(result.message()).toEqual(`\
Expect $(\`sel\`), $$(\`sel\`)[1] ${verb} ${lastMatcherWords(matcherFn.name)}

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
        })
    })
})
