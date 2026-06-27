import { describe, expect, test, vi, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { executeCommand, defaultMultipleElementsIterationStrategy } from '../../src/util/executeCommand'

vi.mock('@wdio/globals')

describe(executeCommand, () => {
    const conditionPass = vi.fn(async (_element: WebdriverIO.Element) => {
        return ({ result: true, value: 'myValue' })
    })

    describe('given single element', () => {
        const selector = 'single-selector'

        test('ChainableElement', async () => {
            const chainable = $(selector)

            expect(chainable).toBeInstanceOf(Promise)

            const result = await executeCommand(chainable, conditionPass)

            const unwrapped = await chainable
            expect(result).toEqual({
                success: true,
                valueOrArray: 'myValue',
                elementOrArray: unwrapped,
                results: [true]
            })
        })

        test('Element', async () => {
            const element = await $(selector)

            const result = await executeCommand(element, conditionPass)

            expect(result).toEqual({
                success: true,
                valueOrArray: 'myValue',
                elementOrArray: element,
                results: [true]
            })
        })

        test('Element with value result being an array', async () => {
            const conditionPassWithValueArray = vi.fn(async (_element: WebdriverIO.Element) => {
                return ({ result: true, value: ['myValue'] })
            })

            const element = await $(selector)

            const result = await executeCommand(element, conditionPassWithValueArray)

            expect(result).toEqual({
                success: true,
                valueOrArray: ['myValue'],
                elementOrArray: element,
                results: [true]
            })
        })

        test('Element with value result being an array of array', async () => {
            const conditionPassWithValueArray = vi.fn(async (_element: WebdriverIO.Element) => {
                return ({ result: true, value: [['myValue']] })
            })

            const element = await $(selector)

            const result = await executeCommand(element, conditionPassWithValueArray)

            expect(result).toEqual({
                success: true,
                valueOrArray: [['myValue']],
                elementOrArray: element,
                results: [true]
            })
        })

        test('when condition is not met', async () => {
            const conditionPass = vi.fn(async (_element: WebdriverIO.Element) => {
                return ({ result: false })
            })
            const chainable = $(selector)

            expect(chainable).toBeInstanceOf(Promise)

            const result = await executeCommand(chainable, conditionPass)

            const unwrapped = await chainable
            expect(result).toEqual({
                success: false,
                valueOrArray: undefined,
                elementOrArray: unwrapped,
                results: [false]
            })
        })
    })

    describe('given multiple elements', () => {
        const selector = 'multi-selector'

        test('ChainableArray', async () => {
            const chainableArray = $$(selector)

            expect(chainableArray).toBeInstanceOf(Promise)

            const result = await executeCommand(chainableArray, conditionPass)

            const unwrapped = await chainableArray
            expect(result).toEqual({
                success: true,
                valueOrArray: ['myValue', 'myValue'],
                elementOrArray: unwrapped,
                results: [true, true]
            })
        })

        test('ElementArray', async () => {
            const elementArray = await $$(selector)

            const result = await executeCommand(elementArray, conditionPass)

            expect(result).toEqual({
                success: true,
                valueOrArray: ['myValue', 'myValue'],
                elementOrArray: elementArray,
                results: [true, true]
            })
        })

        test('Element[]', async () => {
            const elementArray = await $$(selector)
            const elements = Array.from(elementArray)

            expect(Array.isArray(elements)).toBe(true)

            const result = await executeCommand(elements, conditionPass)

            expect(result).toEqual({
                success: true,
                valueOrArray: ['myValue', 'myValue'],
                elementOrArray: elements,
                results: [true, true]
            })
        })

        test('Arrray of value', async () => {
            const conditionPassWithValueArray = vi.fn(async (_element: WebdriverIO.Element) => {
                return ({ result: true, value: ['myValue'] })
            })

            const elementArray = await $$(selector)
            const elements = Array.from(elementArray)

            expect(Array.isArray(elements)).toBe(true)

            const result = await executeCommand(elements, conditionPassWithValueArray)

            expect(result).toEqual({
                success: true,
                valueOrArray: [['myValue'], ['myValue']],
                elementOrArray: elements,
                results: [true, true]
            })
        })
    })

    describe('given not elements', () => {
        test('undefined', async () => {
            const result = await executeCommand(undefined as any, conditionPass)

            expect(result).toEqual({
                success: false,
                valueOrArray: undefined,
                elementOrArray: undefined,
                results: []
            })
        })

        test('empty array', async () => {
            const result = await executeCommand([], conditionPass)

            expect(result).toEqual({
                success: false,
                valueOrArray: undefined,
                elementOrArray: [],
                results: []
            })
        })

        test('object', async () => {
            const anyOjbect = { foo: 'bar' }

            const result = await executeCommand(anyOjbect as any, conditionPass)

            expect(result).toEqual({
                success: false,
                valueOrArray: undefined,
                elementOrArray: { foo: 'bar' },
                results: []
            })
        })

        test('number', async () => {
            const anyNumber = 42

            const result = await executeCommand(anyNumber as any, conditionPass)

            expect(result).toEqual({
                success: false,
                valueOrArray: undefined,
                elementOrArray: 42,
                results: []
            })
        })
    })

    describe('error handling', () => {
        test('should throw if no strategies are provided', async () => {
            const element = await $('some-selector')

            await expect(executeCommand(element)).rejects.toThrowError('No condition or customMultipleElementCompareStrategy provided to executeCommand')
        })
    })
})

describe(defaultMultipleElementsIterationStrategy, () => {

    describe('given single element', () => {
        let singleElement: WebdriverIO.Element
        let condition: (el: WebdriverIO.Element, expected: any) => Promise<{ result: boolean; value: any }>

        beforeEach(async () => {
            singleElement = await $('single-mock-element').getElement()
            condition = vi.fn(async (_el, expected) => ({ result: true, value: expected }))
        })

        test('should handle single element and single expected value', async () => {
            const result = await defaultMultipleElementsIterationStrategy(singleElement, 'val', condition)

            expect(result).toEqual([{ result: true, value: 'val' }])
        })

        test('should fail if single element and expected value is array (default)', async () => {
            const result = await defaultMultipleElementsIterationStrategy(singleElement, ['val'], condition)

            expect(result).toEqual([{ result: false, value: 'Expected value cannot be an array' }])
        })

        test('should handle single element and expected value array if supportArrayForSingleElement is true', async () => {
            const result = await defaultMultipleElementsIterationStrategy(singleElement, ['val'], condition, { supportArrayForSingleElement: true })

            expect(result).toEqual([{ result: true, value: ['val'] }])
            expect(condition).toHaveBeenCalledTimes(1)
        })
    })

    describe('given multiple elements', () => {
        let elements: WebdriverIO.ElementArray
        let condition: (el: WebdriverIO.Element, expected: any) => Promise<{ result: boolean; value: any }>

        beforeEach(async () => {
            elements = await $$('elements').getElements()
            expect(elements.length).toBe(2)
            condition = vi.fn()
                .mockResolvedValueOnce({ result: true, value: 'val1' })
                .mockResolvedValueOnce({ result: true, value: 'val2' })
        })

        test('should iterate over array of elements and array of expected values', async () => {
            const result = await defaultMultipleElementsIterationStrategy(elements, ['val1', 'val2'], condition)

            expect(result).toEqual([{ result: true, value: 'val1' }, { result: true, value: 'val2' }])
            expect(condition).toHaveBeenCalledTimes(2)
        })

        test('should fail if array lengths mismatch', async () => {
            const result = await defaultMultipleElementsIterationStrategy([elements[0]] as any, ['val1', 'val2'], condition)

            expect(result).toEqual([{ result: false, value: 'Received array length 1, expected 2' }])
        })

        test('should iterate over array of elements and single expected value', async () => {
            condition = vi.fn()
                .mockResolvedValue({ result: true, value: 'val' })

            const result = await defaultMultipleElementsIterationStrategy(elements, 'val', condition)

            expect(result).toEqual([{ result: true, value: 'val' }, { result: true, value: 'val' }])
            expect(condition).toHaveBeenCalledTimes(2)
        })
    })
})
