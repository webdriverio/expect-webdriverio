import { describe, expect, test, vi } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { executeCommand } from '../../src/util/executeCommand'

vi.mock('@wdio/globals')

describe(executeCommand, () => {
    const conditionPass = vi.fn().mockImplementation(async (_element: WebdriverIO.Element) => {
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
            const conditionPassWithValueArray = vi.fn().mockImplementation(async (_element: WebdriverIO.Element) => {
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
            const conditionPassWithValueArray = vi.fn().mockImplementation(async (_element: WebdriverIO.Element) => {
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
            const conditionPass = vi.fn().mockImplementation(async (_element: WebdriverIO.Element) => {
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
            const conditionPassWithValueArray = vi.fn().mockImplementation(async (_element: WebdriverIO.Element) => {
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
