import { vi, test, describe, expect } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { isElement, isElementArrayLike, isElementOrArrayLike, isStrictlyAwaitedElementArray, wrapExpectedWithArray } from '../../src/util/elementsUtil.js'
import { chainableElementArrayFactory, elementArrayFactory, elementFactory, notFoundElementFactory } from '../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

describe('elementsUtil', () => {
    describe('wrapExpectedWithArray', () => {
        test('is not array ', async () => {
            const el = (await $('sel')) as unknown as WebdriverIO.Element
            const actual = wrapExpectedWithArray(el, 'Test Actual', 'Test Expected')
            expect(actual).toEqual('Test Expected')
        })

        test('is array ', async () => {
            const els = (await $$('sel')) as unknown as WebdriverIO.ElementArray
            const actual = wrapExpectedWithArray(els, ['Test Actual', 'Test Actual'], 'Test Expected')
            expect(actual).toEqual(['Test Expected'])
        })
    })

    describe(isStrictlyAwaitedElementArray, async () => {
        test.for([
            await $$('elements').getElements(),
            await $$('elements'),
            elementArrayFactory('elements'),
            await chainableElementArrayFactory('elements', 3),
        ])('should return true for ElementArray: %s', async (elements) => {
            const isElementArrayResult = isStrictlyAwaitedElementArray(elements)

            expect(elements).toBeDefined()
            expect(typeof elements).toBe('object')
            expect(isElementArrayResult).toBe(true)
        })

        test.for([
            await $('elements'),
            await $('elements').getElement(),
            $$('elements'),
            $$('elements').getElements(),
            elementFactory('element'),
            [elementFactory('element1'), elementFactory('element2')],
            undefined,
            null,
            42,
            'string',
            {},
            Promise.resolve(true),
            []
        ])('should return false for non-ElementArray: %s', async (elements) => {
            const isElementArrayResult = isStrictlyAwaitedElementArray(elements)

            expect(isElementArrayResult).toBe(false)
        })
    })

    describe(isElement, async () => {
        test.for([
            await $('element').getElement(),
            await $('element'),
            elementFactory('element'),
            notFoundElementFactory('notFoundElement')
        ])('should return true for Element: %s', async (element) => {
            const isElementResult = isElement(element)

            expect(isElementResult).toBe(true)
        })

        test.for([
            $$('elements'),
            $$('elements').getElements(),
            [elementFactory('element1'), elementFactory('element2')],
            undefined,
            null,
            42,
            'string',
            {},
            Promise.resolve(true)
        ])('should return false for non-Element: %s', async (element) => {
            const isElementResult = isElement(element)

            expect(isElementResult).toBe(false)
        })
    })

    describe(isElementArrayLike, async () => {
        test.for([
            await $$('elements').getElements(),
            await $$('elements'),
            elementArrayFactory('elements'),
            await chainableElementArrayFactory('elements', 3),
            [elementFactory('element1'), elementFactory('element2')],
            []
        ])('should return true for ElementArray or Element[] %s', async (elements) => {
            const isElementArrayResult = isElementArrayLike(elements)

            expect(isElementArrayResult).toBe(true)
        })

        test.for([
            await $('elements'),
            await $('elements').getElement(),
            $$('elements'),
            $$('elements').getElements(),
            undefined,
            null,
            42,
            'string',
            {},
            Promise.resolve(true),
            [$('elements')],
            [$$('elements')],
            [await $$('elements')]
        ])('should return false for non-ElementArray or non-Element[]: %s', async (elements) => {
            const isElementArrayResult = isElementArrayLike(elements)

            expect(isElementArrayResult).toBe(false)
        })
    })

    describe(isElementOrArrayLike, async () => {
        test.for([
            await $('element').getElement(),
            await $('element'),
            elementFactory('element'),
            await $$('elements').getElements(),
            await $$('elements'),
            elementArrayFactory('elements'),
            await chainableElementArrayFactory('elements', 3),
            [elementFactory('element1'), elementFactory('element2')],
            []
        ])('should return true for Element or ElementArray or Element[]: %s', async (element) => {
            const result = isElementOrArrayLike(element)

            expect(result).toBe(true)
        })

        test.for([
            $$('elements'),
            $$('elements').getElements(),
            $('element'),
            $('element').getElement(),
            undefined,
            null,
            42,
            'string',
            {},
            Promise.resolve(true),
            [$('elements')],
            [$$('elements')],
            [await $$('elements')]
        ])('should return false for non-Element and non-ElementArray and non-Element[]: %s', async (element) => {
            const result = isElementOrArrayLike(element)

            expect(result).toBe(false)
        })
    })
})
