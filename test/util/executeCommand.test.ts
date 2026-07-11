import { beforeEach, describe, expect, test, vi } from 'vitest'
import { $ } from '@wdio/globals'
import { executeCommand } from '../../src/util/executeCommand'

vi.mock('@wdio/globals')

describe(executeCommand, () => {
    const conditionPass = vi.fn(async (_element: WebdriverIO.Element) => {
        return ({ result: true, value: 'myValue' })
    })

    const conditionFail = vi.fn(async (_element: WebdriverIO.Element) => {
        return ({ result: false })
    })

    describe('given single element', () => {
        const selector = 'single-selector'
        let element : WebdriverIO.Element

        beforeEach(async () => {
            element = await $(selector).getElement()
        })

        test('Element', async () => {
            const result = await executeCommand(element, conditionPass)

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
            const result = await executeCommand(element, conditionFail)

            expect(result).toEqual({
                el: element,
                success: false,
                values: undefined,
            })
        })
    })

    describe('given not elements', () => {
        test('undefined', async () => {

            const result = await executeCommand(undefined as any, conditionFail)

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
