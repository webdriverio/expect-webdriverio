import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $$, browser } from '@wdio/globals'

import { toBeElementsArrayOfSize } from '../../../src/matchers/elements/toBeElementsArrayOfSize.js'
import { chainableElementArrayFactory, elementArrayFactory, elementFactory } from '../../__mocks__/@wdio/globals.js'
import { refetchElements } from '../../../src/util/refetchElements.js'
import stripAnsi from 'strip-ansi'

vi.mock('@wdio/globals')

describe(toBeElementsArrayOfSize, async () => {
    let thisContext: { toBeElementsArrayOfSize: typeof toBeElementsArrayOfSize }
    let thisNotContext: { toBeElementsArrayOfSize: typeof toBeElementsArrayOfSize, isNot: boolean }

    beforeEach(() => {
        thisContext = { toBeElementsArrayOfSize }
        thisNotContext = { toBeElementsArrayOfSize, isNot: true }
    })

    describe.each([
        { elements: await $$('elements'), title: 'awaited ChainablePromiseArray', selectorName: '$$(`elements`)' },
        { elements: await $$('elements').getElements(), title: 'awaited getElements of ChainablePromiseArray (e.g. WebdriverIO.ElementArray)' },

        // TODO to bring back later in PR supporting $$.
        // { elements: await $$('elements').filter((t) => t.isEnabled()), title: 'awaited filtered ChainablePromiseArray (e.g. WebdriverIO.Element[])', selectorName: '$(`elements`), $$(`elements`)[1]' },
        // { elements: [elementFactory('element'), elementFactory('element')], selectorName: '$(`element`), $(`element`)', title: 'Array of element (e.g. WebdriverIO.Element[])' },
        { elements: $$('elements'), title: 'non-awaited of ChainablePromiseArray' },

        // // TODO to support, since the below return Promise<WebdriverIO.ElementArray|Element[]>, we do not support it type wise yet, but we could
        // { elements: $$('elements').getElements() as unknown as ChainablePromiseArray, title: 'non-awaited of ChainablePromiseArray' },
        // { elements: $$('elements').filter((t) => t.isEnabled()) as unknown as ChainablePromiseArray, selectorName:'$(`elements`), $$(`elements`)[1]', title: 'awaited filtered ChainablePromiseArray (e.g. WebdriverIO.Element[])' },
    ])('given multiple elements when $title', ({ elements, selectorName = '$$(`elements`)' }) => {
        let els: ChainablePromiseArray | WebdriverIO.Element[] | WebdriverIO.ElementArray

        beforeEach(() => {
            els = elements
        })

        describe('success', () => {
            test('array of size 2', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toBeElementsArrayOfSize(els, 2, { beforeAssertion, afterAssertion, wait: 0 })

                // TODO bring back later in PR supporting $$
                // expect(waitUntil).toHaveBeenCalledWith(
                //     expect.any(Function),
                //     undefined,
                //     expect.objectContaining({ wait: 0 })
                // )
                expect(result.pass).toBe(true)
                expect(beforeAssertion).toHaveBeenCalledWith({
                    matcherName: 'toBeElementsArrayOfSize',
                    expectedValue: 2,
                    options: { beforeAssertion, afterAssertion, wait: 0 }
                })
                expect(afterAssertion).toHaveBeenCalledWith({
                    matcherName: 'toBeElementsArrayOfSize',
                    expectedValue: 2,
                    options: { beforeAssertion, afterAssertion, wait: 0 },
                    result
                })
            })

            test.for([
                0, 1, 3
            ])('not - success - pass should be false', async (expectedNotToBeSizeOf) => {
                const result = await thisNotContext.toBeElementsArrayOfSize(els, expectedNotToBeSizeOf)

                expect(result.pass).toBe(false) // success, boolean is inverted later in .not cases
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to be elements array of size

Expected [not]: ${expectedNotToBeSizeOf}
Received      : 2`)

            })
        })

        describe('failure', () => {
            test('fails with proper error message', async () => {
                const result = await thisContext.toBeElementsArrayOfSize(els, 5)

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to be elements array of size

Expected: 5
Received: 2`
                )
            })

            test('fails - in between - with proper error message', async () => {
                const result = await thisContext.toBeElementsArrayOfSize(els, { gte: 3, lte: 5 })

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} to be elements array of size

Expected: ">= 3 && <= 5"
Received: 2`
                )
            })

            test('not - failure - pass should be true', async () => {
                const result = await thisNotContext.toBeElementsArrayOfSize(els, 2)

                expect(result.pass).toBe(true) // failure, boolean is inverted later in .not cases
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to be elements array of size

Expected [not]: 2
Received      : 2`
                )
            })

            test('not - failure - lte - pass should be true', async () => {
                const result = await thisNotContext.toBeElementsArrayOfSize(els, { lte: 3 })

                expect(result.pass).toBe(true) // failure, boolean is inverted later in .not cases
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to be elements array of size

Expected [not]: "<= 3"
Received      : 2`
                )
            })

            test('not - failure - gte - pass should be true', async () => {
                const result = await thisNotContext.toBeElementsArrayOfSize(els, { gte: 1 })

                expect(result.pass).toBe(true) // failure, boolean is inverted later in .not cases
                expect(stripAnsi(result.message())).toEqual(`\
Expect ${selectorName} not to be elements array of size

Expected [not]: ">= 1"
Received      : 2`
                )
            })

        })

        describe('error catching', () => {
            test('throws error with incorrect size param', async () => {
                await expect(thisContext.toBeElementsArrayOfSize(els, '5' as any)).rejects.toThrow('Invalid NumberMatcher. Received: "5"')
            })

            test('works if size contains options', async () => {
                const result = await thisContext.toBeElementsArrayOfSize(els, { lte: 5 })
                expect(result.pass).toBe(true)
            })
        })

        describe('number options', () => {
            test.each([
                ['number - equal', 2, true],
                ['number - equal - fail 1', 1, false],
                ['number - equal - fail 2', 3, false],
            ])('should handle %s correctly', async (_title, expectedNumberValue, expectedPass) => {
                const result = await thisContext.toBeElementsArrayOfSize(els, expectedNumberValue,  { wait: 0 })

                expect(result.pass).toBe(expectedPass)
            })

            test.each([
                ['gte - equal', { gte: 2 } satisfies ExpectWebdriverIO.NumberOptions, true],
                ['gte - fail', { gte: 1 } satisfies ExpectWebdriverIO.NumberOptions, true],
                ['gte', { gte: 3 } satisfies ExpectWebdriverIO.NumberOptions, false],
                ['lte - equal', { lte: 2 } satisfies ExpectWebdriverIO.NumberOptions, true],
                ['lte - fail', { lte: 3 } satisfies ExpectWebdriverIO.NumberOptions, true],
                ['lte', { lte: 1 } satisfies ExpectWebdriverIO.NumberOptions, false],
                ['gte and lte', { gte: 1, lte: 10 } satisfies ExpectWebdriverIO.NumberOptions, true],
                ['not gte but is lte', { gte: 10, lte: 10 } satisfies ExpectWebdriverIO.NumberOptions, false],
                ['not lte but is gte', { gte: 1, lte: 1 } satisfies ExpectWebdriverIO.NumberOptions, false],
            ])('should handle %s correctly', async (_title, expectedNumberValue: ExpectWebdriverIO.NumberOptions, expectedPass) => {
                const result = await thisContext.toBeElementsArrayOfSize(els, expectedNumberValue)

                expect(result.pass).toBe(expectedPass)
            })
        })
    })

    describe('Refresh ElementArray', async () => {
        let elementArrayOf2: ChainablePromiseArray
        let elementArrayOf5: ChainablePromiseArray

        beforeEach(async () => {
            const actuatlRefetchElements = await vi.importActual<typeof import('../../../src/util/refetchElements.js')>('../../../src/util/refetchElements.js')
            vi.spyOn(actuatlRefetchElements, 'refetchElements')

            elementArrayOf2 = await chainableElementArrayFactory('elements', 2)
            elementArrayOf5 = await chainableElementArrayFactory('elements', 5)
        })

        test('does not refresh the element array with the wait 0', async () => {
            vi.mocked(browser.$$).mockReturnValueOnce(elementArrayOf2).mockReturnValue(elementArrayOf5)
            const elements = await $$('elements')

            const result = await thisContext.toBeElementsArrayOfSize(elements, 2, { beforeAssertion: undefined, afterAssertion: undefined, wait: 0 })

            expect(result.pass).toBe(true)
            expect(browser.$$).toHaveBeenCalledTimes(1)
            // TODO bring back later in PR supporting $$
            // expect(waitUntil).toHaveBeenCalledWith(
            //     expect.any(Function),
            //     undefined,
            //     expect.objectContaining({ wait: 1 })
            // )
        })

        test('refresh once the elements array using parent $$ and update actual element with newly fetched elements', async () => {
            vi.mocked(browser.$$).mockResolvedValueOnce(elementArrayOf2).mockResolvedValueOnce(elementArrayOf5)
            const elements = await $$('elements')

            const result = await thisContext.toBeElementsArrayOfSize(elements, 5, { wait: 95, interval: 50 })

            expect(result.pass).toBe(true)
            expect(elements).toBe(elementArrayOf2) // Original actual elements array but altered
            expect(elements.length).toBe(5) // Altered actual elements array
            expect(browser.$$).toHaveBeenCalledTimes(2)
            expect(refetchElements).toHaveBeenNthCalledWith(1, elementArrayOf2, 95, true)
            expect(refetchElements).toHaveBeenCalledTimes(1)
        })

        test('refresh multiple time actual elements but does not update it since it failed', async () => {
            vi.mocked(browser.$$).mockReturnValueOnce(elementArrayOf2).mockReturnValue(elementArrayOf5)
            const elements = await $$('elements')

            const result = await thisContext.toBeElementsArrayOfSize(elements, 10, { wait: 200, interval: 20 })

            expect(result.pass).toBe(false)
            expect(elements.length).toBe(2)
            expect(elements).toBe(elementArrayOf2)
            expect(browser.$$).toHaveBeenCalledTimes(11)
            expect(refetchElements).toHaveBeenNthCalledWith(1, elementArrayOf2, 200, true)
            expect(refetchElements).toHaveBeenNthCalledWith(2, elementArrayOf5, 200, true)
        })

        // TODO: By awaiting the promise we could update the actual elements array, so should we support that?
        test('refresh once but does not update actual elements since they are not of type ElementArray or Element[]', async () => {
            vi.mocked(browser.$$).mockResolvedValueOnce(elementArrayOf2).mockResolvedValueOnce(elementArrayOf5)
            const nonAwaitedElements = $$('elements')

            const result = await thisContext.toBeElementsArrayOfSize(nonAwaitedElements, 5, { wait: 500 })

            expect(result.pass).toBe(true)
            expect(nonAwaitedElements).toBeInstanceOf(Promise)
            expect((await nonAwaitedElements).length).toBe(2)
            expect(await nonAwaitedElements).toBe(elementArrayOf2)
            expect(browser.$$).toHaveBeenCalledTimes(2)
            expect(refetchElements).toHaveBeenNthCalledWith(1, elementArrayOf2, 500, true)
            expect(refetchElements).toHaveBeenCalledTimes(1)
        })

        test.for([
            elementArrayFactory('elements', 2),
            await chainableElementArrayFactory('elements', 2),
            [elementFactory('elements', 0), elementFactory('elements', 1)]
        ])('Does not refetch and does not alter the actual elements array when it size matches on first try', async () => {
            const receivedArray = elementArrayFactory('elements', 2)
            const result = await thisContext.toBeElementsArrayOfSize(receivedArray, 2)

            expect(result.pass).toBe(true)
            expect(receivedArray.length).toBe(2)
            expect(receivedArray).toBe(receivedArray)
            expect(browser.$$).not.toHaveBeenCalled()
            expect(refetchElements).not.toHaveBeenCalled()
        })

        test('refresh once the element array with the NumberOptions wait value', async () => {
            vi.mocked(browser.$$).mockReturnValueOnce(elementArrayOf2).mockReturnValue(elementArrayOf5)
            const elements = await $$('elements')

            const result = await thisContext.toBeElementsArrayOfSize(elements, { gte: 5, wait: 450 })

            expect(result.pass).toBe(true)
            expect(elements.length).toBe(5)
            expect(refetchElements).toHaveBeenNthCalledWith(1, elementArrayOf2, 450, true)
            expect(browser.$$).toHaveBeenCalledTimes(2)
            // TODO bring back later in PR supporting $$
            // expect(waitUntil).toHaveBeenCalledWith(
            //     expect.any(Function),
            //     undefined,
            //     expect.objectContaining({ wait: 450 })
            // )
        })

        test('refresh once the element array with the DEFAULT_OPTIONS wait value', async () => {
            vi.mocked(browser.$$).mockReturnValueOnce(elementArrayOf2).mockReturnValue(elementArrayOf5)
            const elements = await $$('elements')

            const result = await thisContext.toBeElementsArrayOfSize(elements, { gte: 5 }, { beforeAssertion: undefined, afterAssertion: undefined })

            expect(result.pass).toBe(true)
            expect(refetchElements).toHaveBeenNthCalledWith(1, elementArrayOf2, undefined, true)
            expect(browser.$$).toHaveBeenCalledTimes(2)
            // TODO bring back later in PR supporting $$
            // expect(waitUntil).toHaveBeenCalledWith(
            //     expect.any(Function),
            //     undefined,
            //     expect.objectContaining({ wait: 1 })
            // )
        })
    })

    describe('Works with differenet ElementArray or Element[] sizes', () => {
        test.for([
            0, 1, 2, 3, 4, 5, 10
        ])('ChainablePromiseArray of size %i', async (size) => {
            const els = chainableElementArrayFactory('elements', size)

            const result = await thisContext.toBeElementsArrayOfSize(els, size)

            expect(result.pass).toBe(true)
        })

        test.for([
            0, 1, 2, 3, 4, 5, 10
        ])('ElementArray of size %i', async (size) => {
            const els = elementArrayFactory('elements', size)

            const result = await thisContext.toBeElementsArrayOfSize(els, size)

            expect(result.pass).toBe(true)
        })

        test.for([
            0, 1, 2, 3, 4, 5, 10
        ])('Element[] of size %i', async (size) => {
            const els = Array(size).fill(null).map((_, index) => elementFactory('element', index))

            const result = await thisContext.toBeElementsArrayOfSize(els, size)

            expect(result.pass).toBe(true)
        })
    })

    test('fails for empty expected value', async () => {
        const els = await $$('elements')

        await expect(thisContext.toBeElementsArrayOfSize(els, {})).rejects.toThrow('Invalid NumberMatcher. Received: {}')
        await expect(thisContext.toBeElementsArrayOfSize(els, {},  { wait: 0 })).rejects.toThrow('Invalid NumberMatcher. Received: {}')
    })
})
