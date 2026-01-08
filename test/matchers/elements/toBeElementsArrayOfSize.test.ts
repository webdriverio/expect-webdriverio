import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $$ } from '@wdio/globals'

import { toBeElementsArrayOfSize } from '../../../src/matchers/elements/toBeElementsArrayOfSize.js'
import type { AssertionResult } from 'expect-webdriverio'

const createMockElementArray = (length: number): WebdriverIO.ElementArray => {
    const array = Array.from({ length }, () => ({}))
    const mockArray = {
        selector: 'parent',
        get length() { return array.length },
        set length(newLength: number) { array.length = newLength },
        parent: {
            $: vi.fn(),
            $$: vi.fn().mockReturnValue(array),
        },
        foundWith: '$$',
        props: [],
        [Symbol.iterator]: array[Symbol.iterator].bind(array),
        filter: vi.fn().mockReturnThis(),
        map: vi.fn().mockReturnThis(),
        find: vi.fn().mockReturnThis(),
        forEach: vi.fn(),
        some: vi.fn(),
        every: vi.fn(),
        slice: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockReturnThis(),
    }
    return Object.assign(array, mockArray) as unknown as WebdriverIO.ElementArray
}

vi.mock('@wdio/globals', () => ({
    $$: vi.fn().mockImplementation(() => createMockElementArray(2))
}))

describe('toBeElementsArrayOfSize', () => {
    describe('given an elements of type WebdriverIO.ElementArray', () => {
        let els: WebdriverIO.ElementArray

        beforeEach(() => {
            els = $$('parent') as unknown as WebdriverIO.ElementArray
        })

        describe('success', () => {
            test('array of size 2', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()
                const result = await toBeElementsArrayOfSize.call({}, els, 2, { beforeAssertion, afterAssertion, wait: 0 })
                expect(result.pass).toBe(true)
                expect(beforeAssertion).toBeCalledWith({
                    matcherName: 'toBeElementsArrayOfSize',
                    expectedValue: 2,
                    options: { beforeAssertion, afterAssertion, wait: 0 }
                })
                expect(afterAssertion).toBeCalledWith({
                    matcherName: 'toBeElementsArrayOfSize',
                    expectedValue: 2,
                    options: { beforeAssertion, afterAssertion, wait: 0 },
                    result
                })
            })
            test('array of size 5', async () => {
                els = createMockElementArray(5)
                const result = await toBeElementsArrayOfSize.call({}, els, 5, { wait : 0 })
                expect(result.pass).toBe(true)
            })
        })

        describe('failure', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await toBeElementsArrayOfSize.call({}, els, 5, { wait: 1 })
            })

            test('fails with proper error message', () => {
                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $$(\`parent\`) to be elements array of size

Expected: 5
Received: 2`
                )
            })

        })

        describe('error catching', () => {
            test('throws error with incorrect size param', async () => {
                await expect(toBeElementsArrayOfSize.call({}, els, '5' as any)).rejects.toThrow('Invalid NumberOptions. Received: "5"')
            })

            test('works if size contains options', async () => {
                const result = await toBeElementsArrayOfSize.call({}, els, { lte: 5 }, { wait: 0 })
                expect(result.pass).toBe(true)
            })
        })

        describe('number options', () => {
            test.each([
                ['number - equal', 2, true],
                ['number - equal - fail 1', 1, false],
                ['number - equal - fail 2', 3, false],
            ])('should handle %s correctly', async (_title, expectedNumberValue, expectedPass) => {
                const result = await toBeElementsArrayOfSize.call({}, els, expectedNumberValue,  { wait: 0 })

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
                const result = await toBeElementsArrayOfSize.call({}, els, expectedNumberValue, { wait: 0 })

                expect(result.pass).toBe(expectedPass)
            })
        })

        describe('array update', () => {
            test('updates the received array when assertion passes', async () => {
                const receivedArray = createMockElementArray(2);
                (receivedArray.parent as any)._length = 5;
                (receivedArray.parent as any).$$ = vi.fn().mockReturnValue(createMockElementArray(5))

                const result = await toBeElementsArrayOfSize.call({}, receivedArray, 5)

                expect(result.pass).toBe(true)
                expect(receivedArray.length).toBe(5)
            })

            test('does not update the received array when assertion fails', async () => {
                const receivedArray = createMockElementArray(2)

                const result = await toBeElementsArrayOfSize.call({}, receivedArray, 10, { wait: 1 })

                expect(result.pass).toBe(false)
                expect(receivedArray.length).toBe(2)
            })

            test('does not modify non-array received values', async () => {
                const nonArrayEls = {
                    selector: 'parent',
                    length: 2,
                    parent: {
                        $: vi.fn(),
                        $$: vi.fn().mockReturnValue(createMockElementArray(5)),
                    },
                    foundWith: '$$',
                    props: [],
                } as unknown as WebdriverIO.ElementArray

                const result = await toBeElementsArrayOfSize.call({}, nonArrayEls, 5)

                expect(result.pass).toBe(true)
                expect(nonArrayEls.length).toBe(2)
            })

            test('does not alter the array when checking', async () => {
                const receivedArray = createMockElementArray(2)
                const result = await toBeElementsArrayOfSize.call({}, receivedArray, 2)

                expect(result.pass).toBe(true)
                expect(receivedArray.length).toBe(2)
            })
        })
    })

    describe('given an elements of type WebdriverIO.Element[]', () => {
        describe('when elements is empty array', () => {
            const elements: WebdriverIO.Element[] = []
            describe('success', () => {
                test('array of size 0', async () => {
                    const beforeAssertion = vi.fn()
                    const afterAssertion = vi.fn()
                    const result = await toBeElementsArrayOfSize.call({}, elements, 0, { beforeAssertion, afterAssertion, wait: 0 })
                    expect(result.pass).toBe(true)
                    expect(beforeAssertion).toBeCalledWith({
                        matcherName: 'toBeElementsArrayOfSize',
                        expectedValue: 0,
                        options: { beforeAssertion, afterAssertion, wait: 0 }
                    })
                    expect(afterAssertion).toBeCalledWith({
                        matcherName: 'toBeElementsArrayOfSize',
                        expectedValue: 0,
                        options: { beforeAssertion, afterAssertion, wait: 0 },
                        result
                    })
                })
            })

            describe('failure', () => {
                let result: AssertionResult

                beforeEach(async () => {
                    result = await toBeElementsArrayOfSize.call({}, elements, 5, { wait: 0 })
                })

                // TODO dprevost review missing subject in error message
                test('fails with proper failure message', () => {
                    expect(result.pass).toBe(false)
                    expect(result.message()).toEqual(`\
Expect  to be elements array of size

Expected: 5
Received: 0`
                    )
                })
            })
        })

        describe('when elements is not empty array', () => {
            const elements: WebdriverIO.Element[] = [{
                elementId: 'element-1'
            } satisfies Partial<WebdriverIO.Element> as WebdriverIO.Element,]
            describe('success', () => {
                test('array of size 1', async () => {
                    const beforeAssertion = vi.fn()
                    const afterAssertion = vi.fn()
                    const result = await toBeElementsArrayOfSize.call({}, elements, 1, { beforeAssertion, afterAssertion, wait: 0 })
                    expect(result.pass).toBe(true)
                    expect(beforeAssertion).toBeCalledWith({
                        matcherName: 'toBeElementsArrayOfSize',
                        expectedValue: 1,
                        options: { beforeAssertion, afterAssertion, wait: 0 }
                    })
                    expect(afterAssertion).toBeCalledWith({
                        matcherName: 'toBeElementsArrayOfSize',
                        expectedValue: 1,
                        options: { beforeAssertion, afterAssertion, wait: 0 },
                        result
                    })
                })
            })

            describe('failure', () => {
                let result: AssertionResult

                beforeEach(async () => {
                    result = await toBeElementsArrayOfSize.call({}, elements, 5, { wait: 0 })
                })

                // TODO dprevost review missing subject in error message
                test('fails with proper failure message', () => {
                    expect(result.pass).toBe(false)
                    expect(result.message()).toContain(`\
Expect  to be elements array of size

Expected: 5
Received: 1`
                    )
                })

            })
        })
    })
})
