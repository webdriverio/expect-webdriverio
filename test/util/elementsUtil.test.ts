import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { awaitElementOrArray, isArray, isElement, isElementArrayLike, isElementOrArrayLike, isStrictlyElementArray, wrapExpectedWithArray } from '../../src/util/elementsUtil.js'
import { elementFactory, elementArrayFactory, chainableElementArrayFactory, notFoundElementFactory } from '../__mocks__/@wdio/globals.js'

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

    describe(isArray, async () => {
        test.each([
            { array: [elementFactory('element')], title: 'array of WebdriverIO.Element' },
            { array: await elementArrayFactory('elements', 0), title: 'array of WebdriverIO.ElementArray' }
        ])('should return true for $title', (input) => {
            const result = isArray(input.array)

            expect(result).toBe(true)
        })
    })

    // TODO dprevot to review
    describe.skip(awaitElementOrArray, () => {

        describe('given single element', () => {

            let element: WebdriverIO.Element
            let chainableElement: ChainablePromiseElement

            beforeEach(() => {
                element = elementFactory('element1')
                chainableElement = $('element1')
            })

            test('should return undefined when received is undefined', async () => {
                const awaitedElements = await awaitElementOrArray(undefined)

                expect(awaitedElements).toEqual({
                    other: undefined
                })
            })

            test('should return undefined when received is Promise of undefined (typing not supported)', async () => {
                const awaitedElements = await awaitElementOrArray(Promise.resolve(undefined) as any)

                expect(awaitedElements).toEqual({
                    other: undefined
                })
            })

            test('should return single element when received is a non-awaited ChainableElement', async () => {
                const awaitedElements = await awaitElementOrArray(chainableElement)

                expect(awaitedElements).toEqual({
                    element: expect.objectContaining({ selector: element.selector })
                })
                expect(awaitedElements.elements).toBeUndefined()
            })

            test('should return single element when received is an awaited ChainableElement', async () => {
                const awaitedElements = await awaitElementOrArray(await chainableElement)

                expect(awaitedElements).toEqual({
                    element: expect.objectContaining({ selector: element.selector })
                })
                expect(awaitedElements.elements).toBeUndefined()
            })

            test('should return single element when received is getElement of non awaited ChainableElement (typing not supported)', async () => {
                const awaitedElements = await awaitElementOrArray(chainableElement.getElement() as any)

                expect(awaitedElements).toEqual({
                    element: expect.objectContaining({ selector: element.selector })
                })
                expect(awaitedElements.elements).toBeUndefined()
            })

            test('should return single element when received is getElement of an awaited ChainableElement', async () => {
                const awaitedElements = await awaitElementOrArray(await chainableElement.getElement())

                expect(awaitedElements).toEqual({
                    element: expect.objectContaining({ selector: element.selector })
                })
                expect(awaitedElements.elements).toBeUndefined()
            })

            test('should return single element when received is WebdriverIO.Element', async () => {
                const awaitedElements = await awaitElementOrArray(element)

                expect(awaitedElements).toEqual({
                    element: expect.objectContaining({ selector: element.selector })
                })
                expect(awaitedElements.elements).toBeUndefined()
            })

            test('should return multiple elements when received is WebdriverIO.Element[]', async () => {
                const elementArray = [elementFactory('element1'), elementFactory('element2')]

                const awaitedElements = await awaitElementOrArray(elementArray)

                expect(awaitedElements.elements).toHaveLength(2)
                expect(awaitedElements).toEqual({
                    elements: expect.arrayContaining([
                        expect.objectContaining({ selector: elementArray[0].selector }), expect.objectContaining({ selector: elementArray[1].selector })
                    ])
                })
                expect(awaitedElements.elements).toHaveLength(2)
                expect(awaitedElements.elements?.[0].selector).toEqual(elementArray[0].selector)
                expect(awaitedElements.elements?.[1].selector).toEqual(elementArray[1].selector)
                expect(awaitedElements.element).toBeUndefined()
            })
        })

        describe('given multiple elements', () => {

            let element1: WebdriverIO.Element
            let element2: WebdriverIO.Element
            let elementArray: WebdriverIO.Element[]
            let chainableElementArray: ChainablePromiseArray

            beforeEach(() => {
                element1 = elementFactory('element1')
                element2 = elementFactory('element2')
                elementArray = [element1, element2]
                chainableElementArray = $$('element1')
            })

            test('should return multiple elements when received is a non-awaited ChainableElementArray', async () => {
                const { elements, element } = await awaitElementOrArray(chainableElementArray)

                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(element).toBeUndefined()
            })

            test('should return multiple elements when received is an awaited ChainableElementArray', async () => {
                const { elements, element } = await awaitElementOrArray(await chainableElementArray)

                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(element).toBeUndefined()
            })

            test('should return multiple elements when received is getElements of non awaited ChainableElement (typing not supported)', async () => {
                const { elements, element } = await awaitElementOrArray(chainableElementArray.getElements() as any)

                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(element).toBeUndefined()
            })

            test('should return multiple elements when received is getElements of an awaited ChainableElementArray', async () => {
                const { elements, element } = await awaitElementOrArray(await chainableElementArray.getElements())
                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(element).toBeUndefined()
            })

            test('should return multiple elements when received is WebdriverIO.Element[]', async () => {
                const { elements, element } = await awaitElementOrArray(elementArray)
                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element2.selector })
                ]))
                expect(element).toBeUndefined()
            })
        })

        test('should return the same object when not any type related to Elements', async () => {
            const anyOjbect = { foo: 'bar' }

            const { other } = await awaitElementOrArray(anyOjbect as any)

            expect(other).toBe(anyOjbect)
        })

    })

    describe(isStrictlyElementArray, async () => {
        test.for([
            await $$('elements').getElements(),
            await $$('elements'),
            elementArrayFactory('elements'),
            await chainableElementArrayFactory('elements', 3),
        ])('should return true for ElementArray: %s', async (elements) => {
            const isElementArrayResult = isStrictlyElementArray(elements)

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
            const isElementArrayResult = isStrictlyElementArray(elements)

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
            [elementFactory('element1'), elementFactory('element2')]
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
            [await $$('elements')],
            []
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
            [await $$('elements')],
            []
        ])('should return false for non-Element and non-ElementArray and non-Element[]: %s', async (element) => {
            const result = isElementOrArrayLike(element)

            expect(result).toBe(false)
        })
    })
})
