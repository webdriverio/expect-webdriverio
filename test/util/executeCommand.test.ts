import { beforeEach, describe, expect, test, vi } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { executeCommand } from '../../src/util/executeCommand'
import { WdioElements } from '../../src/types'

vi.mock('@wdio/globals')

describe(executeCommand, () => {

    describe('given single element', () => {
        const selector = 'single-selector'
        let element : WebdriverIO.Element

        const conditionSingleElementPass = vi.fn(async (_element: WebdriverIO.Element) => {
            return ({ result: true, value: 'myValue' })
        })

        const conditionSingleElementFail = vi.fn(async (_element: WebdriverIO.Element) => {
            return ({ result: false })
        })

        beforeEach(async () => {
            element = await $(selector).getElement()
        })

        test('Element', async () => {
            const result = await executeCommand(element, conditionSingleElementPass)

            expect(result).toEqual({
                el: element,
                success: true,
                values: 'myValue'
            })
        })

        test('Element with value result being an array', async () => {
            const conditionPassWithValueArray = vi.fn(async (_element: WebdriverIO.Element) => {
                return ({ result: true, value: ['myValue'] })
            })

            const result = await executeCommand(element, conditionPassWithValueArray)

            expect(result).toEqual({
                el: element,
                success: true,
                values: ['myValue']
            })
        })

        test('Element with value result being an array of array', async () => {
            const conditionPassWithValueArray = vi.fn(async (_element: WebdriverIO.Element) => {
                return ({ result: true, value: [['myValue']] })
            })

            const result = await executeCommand(element, conditionPassWithValueArray)

            expect(result).toEqual({
                el: element,
                success: true,
                values: [['myValue']]
            })
        })

        test('when condition is not met', async () => {
            const result = await executeCommand(element, conditionSingleElementFail)

            expect(result).toEqual({
                el: element,
                success: false,
                values: undefined,
            })
        })

        test('pass options to condition', async () => {
            const options = { wait: 1000, interval: 100 }

            await executeCommand(element, conditionSingleElementPass, options)

            expect(conditionSingleElementPass).toHaveBeenCalledWith(element, options)
        })
    })

    describe('given multiple elements', () => {
        const selector = 'multi-selector'

        const conditionMultipleElementPass = vi.fn(async (_element: WdioElements) => {
            return ({ result: true, value: ['myValue1', 'myValue2'] })
        })

        test('ElementArray', async () => {
            const elementArray = await $$(selector).getElements()

            const result = await executeCommand(elementArray, conditionMultipleElementPass)

            expect(result).toEqual({
                el: elementArray,
                success: true,
                values: ['myValue1', 'myValue2'],
            })
        })

        test('Element[]', async () => {
            const elementArray = await $$(selector)
            const elements = Array.from(elementArray)

            expect(Array.isArray(elements)).toBe(true)

            const result = await executeCommand(elements, conditionMultipleElementPass)

            expect(result).toEqual({
                el: elements,
                success: true,
                values: ['myValue1', 'myValue2'],
            })
        })

        test('pass options to condition', async () => {
            const options = { wait: 1000, interval: 100 }
            const elements = await $$(selector).getElements()

            await executeCommand(elements, conditionMultipleElementPass, options)

            expect(conditionMultipleElementPass).toHaveBeenCalledWith(elements, options)
        })
    })

    describe('given not elements', () => {
        const conditionFail = vi.fn(async (_element: unknown) => {
            return ({ result: false })
        })

        test('undefined', async () => {

            const result = await executeCommand(undefined as any, conditionFail)

            expect(conditionFail).toHaveBeenCalledWith(undefined, {})
            expect(result).toEqual({
                el: undefined,
                success: false,
                values: undefined,
            })
        })

        test('empty array', async () => {
            const result = await executeCommand([], conditionFail)

            expect(result).toEqual({
                el: [],
                success: false,
                values: undefined,
            })
        })

        test('object', async () => {
            const anyOjbect = { foo: 'bar' }

            const result = await executeCommand(anyOjbect as any, conditionFail)

            expect(result).toEqual({
                el: { foo: 'bar' },
                success: false,
                values: undefined,
            })
        })

        test('number', async () => {
            const anyNumber = 42

            const result = await executeCommand(anyNumber as any, conditionFail)

            expect(result).toEqual({
                el: 42,
                success: false,
                values: undefined,
            })
        })
    })

})
