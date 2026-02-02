import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import type { Size } from '../../../src/matchers/element/toHaveSize.js'
import { toHaveSize } from '../../../src/matchers/element/toHaveSize.js'

vi.mock('@wdio/globals')

describe(toHaveSize, async () => {
    let thisContext: { toHaveSize: typeof toHaveSize }
    let thisNotContext: { isNot: true; toHaveSize: typeof toHaveSize }

    const expectedValue: Size = { width: 32, height: 32 }
    const wrongValue: Size = { width: 15, height: 32 }

    beforeEach(async () => {
        thisContext =  { toHaveSize }
        thisNotContext = { isNot: true, ...thisContext }
    })

    describe.for([
        { element: await $('sel'), type: 'awaited ChainablePromiseElement' },
        { element: await $('sel').getElement(), type: 'awaited getElement of ChainablePromiseElement (e.g. WebdriverIO.Element)' },
        { element: $('sel'), type: 'non-awaited of ChainablePromiseElement' }
    ])('given a single element when $type', ({ element }) => {
        let el: ChainablePromiseElement | WebdriverIO.Element

        beforeEach(() => {
            el = element
            vi.mocked(el.getSize).mockResolvedValue(expectedValue as unknown as Size & number) // vitest does not support overloads function well
        })

        test('wait for success', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveSize(el, expectedValue, { beforeAssertion, afterAssertion, wait: 500 })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveSize',
                expectedValue: expectedValue,
                options: { beforeAssertion, afterAssertion, wait: 500 }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveSize',
                expectedValue: expectedValue,
                options: { beforeAssertion, afterAssertion, wait: 500 },
                result
            })
        })

        test('wait but error', async () => {
            vi.mocked(el.getSize).mockRejectedValue(new Error('some error'))

            await expect(() => thisContext.toHaveSize(el, expectedValue))
                .rejects.toThrow('some error')
        })

        test('success by default', async () => {
            const result = await thisContext.toHaveSize(el, expectedValue)

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('no wait - failure with proper error message', async () => {
            vi.mocked(el.getSize).mockResolvedValue(wrongValue as unknown as Size & number)

            const result = await thisContext.toHaveSize(el, expectedValue, { wait: 0 })

            expect(result.pass).toBe(false)
            expect(el.getSize).toHaveBeenCalledTimes(1)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have size

- Expected  - 1
+ Received  + 1

  Object {
    "height": 32,
-   "width": 32,
+   "width": 15,
  }`
            )
        })

        test('no wait - success', async () => {
            const result = await thisContext.toHaveSize(el, expectedValue, { wait: 0 })

            expect(result.pass).toBe(true)
            expect(el.getSize).toHaveBeenCalledTimes(1)
        })

        test('not - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveSize(el, expectedValue)

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have size

Expected [not]: {"height": 32, "width": 32}
Received      : {"height": 32, "width": 32}`
            )
        })

        test('should fails with custom failure message', async () => {
            vi.mocked(el.getSize).mockResolvedValue(wrongValue as unknown as Size & number)

            const result = await thisContext.toHaveSize(el, expectedValue, { wait: 1, message: 'Custom error message' })

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Custom error message
Expect $(\`sel\`) to have size

- Expected  - 1
+ Received  + 1

  Object {
    "height": 32,
-   "width": 32,
+   "width": 15,
  }`
            )
        })

        test('should fails when expected is an unsupported array type', async () => {
            const result = await thisContext.toHaveSize(el, [expectedValue])

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have size

Expected: [{"height": 32, "width": 32}]
Received: "Expected value cannot be an array"`
            )
        })

    })

    describe.for([
        { elements: await $$('sel'), title: 'awaited ChainablePromiseArray' },
        { elements: await $$('sel').getElements(), title: 'awaited getElements of ChainablePromiseArray (e.g. WebdriverIO.ElementArray)' },
        { elements: await $$('sel').filter((t) => t.isEnabled()), title: 'awaited filtered ChainablePromiseArray (e.g. WebdriverIO.Element[])' },
        { elements: $$('sel'), title: 'non-awaited of ChainablePromiseArray' }
    ])('given multiple elements when $title', ({ elements, title }) => {
        let els: ChainablePromiseArray | WebdriverIO.Element[] | WebdriverIO.ElementArray
        let awaitedEls: typeof els

        let selectorName = '$$(`sel`)'
        if (title.includes('Element[]')) {selectorName = '$(`sel`), $$(`sel`)[1]'}

        beforeEach(async () => {
            els = elements

            awaitedEls = Array.isArray(els) ? els : await els
            awaitedEls.forEach((el) => {
                vi.mocked(el.getSize).mockResolvedValue(expectedValue as unknown as Size & number)
            })
            expect(awaitedEls.length).toEqual(2)
        })

        describe('given single expected value', async () => {
            test('wait success', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveSize(els, expectedValue, { beforeAssertion, afterAssertion })

                expect(result.pass).toBe(true)
                awaitedEls.forEach((el) =>
                    expect(el.getSize).toHaveBeenCalledTimes(1)
                )
                expect(beforeAssertion).toBeCalledWith({
                    matcherName: 'toHaveSize',
                    expectedValue: expectedValue,
                    options: { beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toBeCalledWith({
                    matcherName: 'toHaveSize',
                    expectedValue: expectedValue,
                    options: { beforeAssertion, afterAssertion },
                    result
                })
            })

            test('wait but errors', async () => {
                awaitedEls.forEach((el) => {
                    vi.mocked(el.getSize).mockRejectedValue(new Error('some error'))
                })

                await expect(() => thisContext.toHaveSize(els, expectedValue))
                    .rejects.toThrow('some error')
            })

            test('no wait - failure', async () => {
                awaitedEls.forEach((el) => {
                    vi.mocked(el.getSize).mockResolvedValue(wrongValue as unknown as Size & number)
                })

                const result = await thisContext.toHaveSize(els, expectedValue, { wait: 0 })

                expect(result.pass).toBe(false)
                awaitedEls.forEach((el) =>
                    expect(el.getSize).toHaveBeenCalledTimes(1)
                )
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have size

- Expected  - 2
+ Received  + 2

  Array [
    Object {
      "height": 32,
-     "width": 32,
+     "width": 15,
    },
    Object {
      "height": 32,
-     "width": 32,
+     "width": 15,
    },
  ]`
                )
            })

            test('no wait - success', async () => {
                const result = await thisContext.toHaveSize(els, expectedValue, { wait: 0 })

                expect(result.pass).toBe(true)
                awaitedEls.forEach((el) =>
                    expect(el.getSize).toHaveBeenCalledTimes(1)
                )
            })

            test('not - success - pass should false', async () => {
                const result = await thisNotContext.toHaveSize(els, wrongValue)

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - failure - pass should be true', async () => {
                const result = await thisNotContext.toHaveSize(els, expectedValue)

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect ${selectorName} not to have size

Expected [not]: [{"height": 32, "width": 32}, {"height": 32, "width": 32}]
Received      : [{"height": 32, "width": 32}, {"height": 32, "width": 32}]`
                )
            })
        })

        describe('given multiple expected values', async () => {
            const expectedSize = expectedValue
            const expectedSizes = [expectedSize, expectedSize]

            test('wait - success', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveSize(els, expectedSizes, { beforeAssertion, afterAssertion })

                expect(result.pass).toBe(true)
                awaitedEls.forEach((el) =>
                    expect(el.getSize).toHaveBeenCalledTimes(1)
                )
                expect(beforeAssertion).toBeCalledWith({
                    matcherName: 'toHaveSize',
                    expectedValue: expectedSizes,
                    options: { beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toBeCalledWith({
                    matcherName: 'toHaveSize',
                    expectedValue: expectedSizes,
                    options: { beforeAssertion, afterAssertion },
                    result
                })
            })

            test('wait but error', async () => {
                awaitedEls.forEach((el) => {
                    vi.mocked(el.getSize).mockRejectedValue(new Error('some error'))
                })

                await expect(() => thisContext.toHaveSize(els, expectedSizes))
                    .rejects.toThrow('some error')
            })

            test('success on the first attempt', async () => {
                const result = await thisContext.toHaveSize(els, expectedSizes)

                expect(result.pass).toBe(true)
                awaitedEls.forEach((el) =>
                    expect(el.getSize).toHaveBeenCalledTimes(1)
                )
            })

            test('no wait - failure - all elements', async () => {
                awaitedEls.forEach((el) => {
                    vi.mocked(el.getSize).mockResolvedValue(wrongValue as unknown as Size & number)
                })

                const result = await thisContext.toHaveSize(els, expectedSizes, { wait: 0 })

                expect(result.pass).toBe(false)
                awaitedEls.forEach((el) =>
                    expect(el.getSize).toHaveBeenCalledTimes(1)
                )
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have size

- Expected  - 2
+ Received  + 2

  Array [
    Object {
      "height": 32,
-     "width": 32,
+     "width": 15,
    },
    Object {
      "height": 32,
-     "width": 32,
+     "width": 15,
    },
  ]`
                )
            })

            test('no wait - failure - first element', async () => {
                vi.mocked(awaitedEls[0].getSize).mockResolvedValue(wrongValue as unknown as Size & number)

                const result = await thisContext.toHaveSize(els, expectedSizes, { wait: 0 })

                expect(result.pass).toBe(false)
                awaitedEls.forEach((el) =>
                    expect(el.getSize).toHaveBeenCalledTimes(1)
                )
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have size

- Expected  - 1
+ Received  + 1

  Array [
    Object {
      "height": 32,
-     "width": 32,
+     "width": 15,
    },
    Object {
      "height": 32,
      "width": 32,
    },
  ]`
                )
            })

            test('no wait - failure - second element', async () => {
                vi.mocked(awaitedEls[1].getSize).mockResolvedValue(wrongValue as unknown as Size & number)

                const result = await thisContext.toHaveSize(els, expectedSizes, { wait: 0 })

                expect(result.pass).toBe(false)
                awaitedEls.forEach((el) =>
                    expect(el.getSize).toHaveBeenCalledTimes(1)
                )
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have size

- Expected  - 1
+ Received  + 1

  Array [
    Object {
      "height": 32,
      "width": 32,
    },
    Object {
      "height": 32,
-     "width": 32,
+     "width": 15,
    },
  ]`
                )
            })

            test('no wait - success', async () => {
                const result = await thisContext.toHaveSize(els, expectedSizes, { wait: 0 })

                expect(result.pass).toBe(true)
                awaitedEls.forEach((el) =>
                    expect(el.getSize).toHaveBeenCalledTimes(1)
                )
            })

            test('not - failure - all elements - pass should be true', async () => {
                const result = await thisNotContext.toHaveSize(els, expectedSizes)

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect ${selectorName} not to have size

Expected [not]: [{"height": 32, "width": 32}, {"height": 32, "width": 32}]
Received      : [{"height": 32, "width": 32}, {"height": 32, "width": 32}]`
                )
            })

            test('not - failure - first element has same size - pass should be true', async () => {
                vi.mocked(awaitedEls[0].getSize).mockResolvedValue(expectedSize as unknown as Size & number)
                vi.mocked(awaitedEls[1].getSize).mockResolvedValue(wrongValue as unknown as Size & number)

                const result = await thisNotContext.toHaveSize(els, expectedSizes)

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect ${selectorName} not to have size

Expected [not]: [{"height": 32, "width": 32}, {"height": 32, "width": 32}]
Received      : [{"height": 32, "width": 32}, {"height": 32, "width": 15}]`
                )
            })

            test('not - failure - one element has same size - pass should be true', async () => {
                vi.mocked(awaitedEls[0].getSize).mockResolvedValue(wrongValue as unknown as Size & number)
                vi.mocked(awaitedEls[1].getSize).mockResolvedValue(expectedSize as unknown as Size & number)

                const result = await thisNotContext.toHaveSize(els, expectedSizes)

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(result.message()).toEqual(`\
Expect ${selectorName} not to have size

Expected [not]: [{"height": 32, "width": 32}, {"height": 32, "width": 32}]
Received      : [{"height": 32, "width": 15}, {"height": 32, "width": 32}]`
                )
            })

            test('should fails when expected is an array with a mismatched length', async () => {
                const result = await thisContext.toHaveSize(elements, [expectedValue, expectedValue, expectedValue])

                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect ${selectorName} to have size

- Expected  - 12
+ Received  +  1

  Array [
-   Object {
-     "height": 32,
-     "width": 32,
-   },
-   Object {
-     "height": 32,
-     "width": 32,
-   },
-   Object {
-     "height": 32,
-     "width": 32,
-   },
+   "Received array length 2, expected 3",
  ]`
                )
            })
        })

        test('fails when no elements are provided', async () => {
            const result = await thisContext.toHaveSize([], expectedValue)

            expect(result.pass).toBe(false)
            expect(result.message()).toEqual(`\
Expect [] to have size

Expected: {"height": 32, "width": 32}
Received: undefined`)
        })
    })
})
