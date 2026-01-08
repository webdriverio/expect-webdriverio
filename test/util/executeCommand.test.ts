import { describe, expect, test, vi } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { executeCommand } from '../../src/util/executeCommand'

vi.mock('@wdio/globals')

describe(executeCommand, () => {
    const conditionPass = vi.fn().mockImplementation(async (_element: WebdriverIO.Element) => {
        return ({ result: true, value: 'pass' })
    })

    describe('given single element', () => {
        const selector = 'single-selector'

        test('ChainableElement', async () => {
            const chainable = $(selector)

            expect(chainable).toBeInstanceOf(Promise)

            const result = await executeCommand(chainable, conditionPass)

            expect(result.success).toBe(true)
            expect(result.valueOrArray).toBe('pass')

            const unwrapped = await chainable
            expect(result.elementOrArray).toBe(unwrapped)
        })

        test('Element', async () => {
            const element = await $(selector)

            const result = await executeCommand(element, conditionPass)

            expect(result.success).toBe(true)
            expect(result.valueOrArray).toBe('pass')
            expect(result.elementOrArray).toBe(element)
        })
    })

    describe('given multiple elements', () => {
        const selector = 'multi-selector'

        test('ChainableArray', async () => {
            const chainableArray = $$(selector)

            expect(chainableArray).toBeInstanceOf(Promise)

            const result = await executeCommand(chainableArray, conditionPass)

            expect(result.success).toBe(true)
            expect(result.valueOrArray).toEqual(['pass', 'pass'])

            const unwrapped = await chainableArray
            expect(result.elementOrArray).toBe(unwrapped)
        })

        test('ElementArray', async () => {
            const elementArray = await $$(selector)

            const result = await executeCommand(elementArray, conditionPass)

            expect(result.success).toBe(true)
            expect(result.valueOrArray).toEqual(['pass', 'pass'])
            expect(result.elementOrArray).toBe(elementArray)
        })

        test('Element[]', async () => {
            const elementArray = await $$(selector)
            const elements = Array.from(elementArray)

            expect(Array.isArray(elements)).toBe(true)

            const result = await executeCommand(elements, conditionPass)

            expect(result.success).toBe(true)
            expect(result.valueOrArray).toEqual(['pass', 'pass'])
            expect(result.elementOrArray).toBe(elements)
        })
    })

    describe('given not elements', () => {
        test('undefined', async () => {
            const result = await executeCommand(undefined as any, conditionPass)

            expect(result.success).toBe(false)
            expect(result.valueOrArray).toBeUndefined()
            expect(result.elementOrArray).toBeUndefined()
        })

        test('empty array', async () => {
            const result = await executeCommand([], conditionPass)

            expect(result.success).toBe(false)
            expect(result.valueOrArray).toBeUndefined()
            expect(result.elementOrArray).toEqual([])
        })

        test('object', async () => {
            const anyOjbect = { foo: 'bar' }

            const result = await executeCommand(anyOjbect as any, conditionPass)

            expect(result.success).toBe(false)
            expect(result.valueOrArray).toBeUndefined()
            expect(result.elementOrArray).toBe(anyOjbect)
        })

        test('number', async () => {
            const anyNumber = 42

            const result = await executeCommand(anyNumber as any, conditionPass)

            expect(result.success).toBe(false)
            expect(result.valueOrArray).toBeUndefined()
            expect(result.elementOrArray).toBe(anyNumber)
        })
    })
})
