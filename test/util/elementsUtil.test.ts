import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { awaitElementOrArray, isArray, isArrayOfElement, isElement, isElementArray, isElementArrayLike, isElementOrArrayLike, isMultiRemoteElement, isMultiRemoteElementArray, isMultiRemoteElementLike, isMultiRemoteElements, isMultiRemoteElementsLike, isStrictlyElementArray, wrapExpectedWithArray } from '../../src/util/elementsUtil.js'
import { elementFactory, elementArrayFactory, chainableElementArrayFactory, notFoundElementFactory, elementWithoutSelectorFactory, browserFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock, multiRemoteBrowserFactory } from '../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

describe('elementsUtil', () => {
    describe(wrapExpectedWithArray, () => {

        describe('given single expect value', () => {
            const expected = 'Test Expected'
            test('when having single element and single actual value then expected value is not wrapped into an array', async () => {
                const actual = 'Test Actual'
                const element = await $('sel').getElement()

                const wrappedExpectedValue = wrapExpectedWithArray(element, actual, expected)

                expect(wrappedExpectedValue).toEqual('Test Expected')
            })

            test('given array of elements and multiples actual values then expected value is wrapped into an array', async () => {
                const elements = await $$('sel').getElements()
                const actual = ['Test Actual', 'Test Actual']

                const wrappedExpectedValue = wrapExpectedWithArray(elements, actual, expected)

                expect(wrappedExpectedValue).toEqual(['Test Expected', 'Test Expected'])
            })
        })

        describe('given multiple expect values', () => {
            const expected = ['Test Expected', 'Test Expected']
            test('when having single element and single actual value then expected values is not wrapped in another array', async () => {
                const actual = 'Test Actual'
                const element = await $('sel').getElement()

                const wrappedExpectedValue = wrapExpectedWithArray(element, actual, expected)

                expect(wrappedExpectedValue).toEqual(['Test Expected', 'Test Expected'])
            })

            test('given array of elements and multiples actual values then expected values is not wrapped into another array', async () => {
                const elements = await $$('sel').getElements()
                const actual = ['Test Actual', 'Test Actual']

                const wrappedExpectedValue = wrapExpectedWithArray(elements, actual, expected)

                expect(wrappedExpectedValue).toEqual(['Test Expected', 'Test Expected'])
            })
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

    describe(awaitElementOrArray, () => {

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
                    element: undefined,
                    elements: undefined,
                    selector: undefined,
                    other: undefined,
                    isEmptyElements: undefined
                })
            })

            test('should return undefined when received is Promise of undefined (typing not supported)', async () => {
                const awaitedElements = await awaitElementOrArray(Promise.resolve(undefined) as any)

                expect(awaitedElements).toEqual({
                    element: undefined,
                    elements: undefined,
                    selector: undefined,
                    other: undefined,
                    isEmptyElements: undefined
                })
            })

            test('should return single element when received is a non-awaited ChainableElement', async () => {
                const awaitedElements = await awaitElementOrArray(chainableElement)

                expect(awaitedElements.elements).toBeUndefined()
                expect(awaitedElements.element).toBeDefined()
                expect(awaitedElements.element).not.toBeInstanceOf(Promise)
                expect(awaitedElements.element?.elementId).toEqual('element1')
                expect(awaitedElements.isEmptyElements).toBe(undefined)
                expect(awaitedElements.selector).toBeDefined()
            })

            test('should return single element when received is an awaited ChainableElement', async () => {
                const awaitedElements = await awaitElementOrArray(await chainableElement)

                expect(awaitedElements.elements).toBeUndefined()
                expect(awaitedElements.element).toBeDefined()
                expect(awaitedElements.element).not.toBeInstanceOf(Promise)
                expect(awaitedElements.element?.elementId).toEqual('element1')
                expect(awaitedElements.isEmptyElements).toBe(undefined)
                expect(awaitedElements.selector).toBeDefined()
            })

            test('should return single element when received is getElement of non awaited ChainableElement (typing not supported)', async () => {
                const awaitedElements = await awaitElementOrArray(chainableElement.getElement())

                expect(awaitedElements.elements).toBeUndefined()
                expect(awaitedElements.element).toBeDefined()
                expect(awaitedElements.element).not.toBeInstanceOf(Promise)
                expect(awaitedElements.element?.elementId).toEqual('element1')
                expect(awaitedElements.isEmptyElements).toBe(undefined)
                expect(awaitedElements.selector).toBeDefined()

            })

            test('should return single element when received is getElement of an awaited ChainableElement', async () => {
                const awaitedElements = await awaitElementOrArray(await chainableElement.getElement())

                expect(awaitedElements.elements).toBeUndefined()
                expect(awaitedElements.element).toBeDefined()
                expect(awaitedElements.element).not.toBeInstanceOf(Promise)
                expect(awaitedElements.element?.elementId).toEqual('element1')
                expect(awaitedElements.isEmptyElements).toBe(undefined)
                expect(awaitedElements.selector).toBeDefined()
            })

            test('should return single element when received is WebdriverIO.Element', async () => {
                const awaitedElements = await awaitElementOrArray(element)

                expect(awaitedElements.element).toBeDefined()
                expect(awaitedElements.element).not.toBeInstanceOf(Promise)
                expect(awaitedElements.element?.elementId).toEqual('element1')
                expect(awaitedElements.elements).toBeUndefined()
                expect(awaitedElements.isEmptyElements).toBe(undefined)
                expect(awaitedElements.selector).toBeDefined()

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
                const { elements, element, other, isEmptyElements, selector } = await awaitElementOrArray(chainableElementArray)

                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(element).toBeUndefined()
                expect(elements).not.toBeInstanceOf(Promise)
                expect(isEmptyElements).toBe(false)
                expect(selector).toBeDefined()
                expect(other).toBeUndefined()
            })

            test('should return multiple elements when received is an awaited ChainableElementArray', async () => {
                const { elements, element, other, isEmptyElements, selector } = await awaitElementOrArray(await chainableElementArray)

                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(element).toBeUndefined()
                expect(isEmptyElements).toBe(false)
                expect(selector).toBeDefined()
                expect(other).toBeUndefined()
            })

            test('should return multiple elements when received is getElements of non awaited ChainableElement (typing not supported)', async () => {
                const { elements, element, other, isEmptyElements, selector } = await awaitElementOrArray(chainableElementArray.getElements() as any)

                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(element).toBeUndefined()
                expect(isEmptyElements).toBe(false)
                expect(selector).toBeDefined()
                expect(other).toBeUndefined()
            })

            test('should return multiple elements when received is getElements of an awaited ChainableElementArray', async () => {
                const { elements, element, other, isEmptyElements, selector } = await awaitElementOrArray(await chainableElementArray.getElements())

                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(element).toBeUndefined()
                expect(isEmptyElements).toBe(false)
                expect(selector).toBeDefined()
                expect(other).toBeUndefined()

            })

            test('should return multiple elements when received is WebdriverIO.Element[]', async () => {
                const { elements, element, other, isEmptyElements, selector } = await awaitElementOrArray(elementArray)
                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element2.selector })
                ]))
                expect(element).toBeUndefined()
                expect(isEmptyElements).toBe(false)
                expect(selector).toBeDefined()
                expect(other).toBeUndefined()
            })
        })

        test('should return the same object when not any type related to Elements', async () => {
            const anyOjbect = { foo: 'bar' }

            const { other, element, elements, isEmptyElements, selector } = await awaitElementOrArray(anyOjbect as any)

            expect(other).toBe(anyOjbect)
            expect(element).toBeUndefined()
            expect(elements).toBeUndefined()
            expect(isEmptyElements).toBe(undefined)
            expect(selector).toBeUndefined()

        })

        test('should return empty array as empty array of Element[]', async () => {
            const { other, element, elements, isEmptyElements, selector } = await awaitElementOrArray([])

            expect(elements).toEqual([])
            expect(element).toBeUndefined()
            expect(other).toBeUndefined()
            expect(isEmptyElements).toBe(true)
            expect(selector).toEqual([])
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
            notFoundElementFactory('notFoundElement'),
            elementWithoutSelectorFactory()
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
            [await $$('elements')],
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
            [await $$('elements')],
        ])('should return false for non-Element and non-ElementArray and non-Element[]: %s', async (element) => {
            const result = isElementOrArrayLike(element)

            expect(result).toBe(false)
        })
    })

    describe('multi-remote guards', () => {
        const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })
        let originalEnv: string | undefined

        beforeEach(() => {
            originalEnv = process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
            delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
        })

        afterEach(() => {
            if (originalEnv !== undefined) {
                process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = originalEnv
            }
        })

        /** `$$()` result with WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY enabled, decorated like an ElementArray */
        const multiRemoteElementArray = () => {
            process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = 'true'
            return createMultiRemoteElementArrayMock(browsers(), 'sel', 2)
        }

        test(isMultiRemoteElement, () => {
            expect(isMultiRemoteElement(createMultiRemoteElementMock(browsers(), 'sel'))).toBe(true)

            expect(isMultiRemoteElement(elementFactory('sel'))).toBe(false)
            expect(isMultiRemoteElement(multiRemoteBrowserFactory())).toBe(false)
            expect(isMultiRemoteElement(createMultiRemoteElementArrayMock(browsers(), 'sel', 2))).toBe(false)
        })

        test(isMultiRemoteElements, () => {
            expect(isMultiRemoteElements(createMultiRemoteElementArrayMock(browsers(), 'sel', 2))).toBe(true)

            expect(isMultiRemoteElements([])).toBe(false)
            expect(isMultiRemoteElements(elementArrayFactory('sel', 2))).toBe(false)
            expect(isMultiRemoteElements(multiRemoteElementArray())).toBe(false)
        })

        test(isMultiRemoteElementArray, () => {
            expect(isMultiRemoteElementArray(multiRemoteElementArray())).toBe(true)
            process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = 'true'
            expect(isMultiRemoteElementArray(createMultiRemoteElementArrayMock(browsers(), 'sel', 0))).toBe(true)

            delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
            expect(isMultiRemoteElementArray(createMultiRemoteElementArrayMock(browsers(), 'sel', 2))).toBe(false)
            expect(isMultiRemoteElementArray(elementArrayFactory('sel', 2))).toBe(false)
        })

        test(isMultiRemoteElementsLike, () => {
            expect(isMultiRemoteElementsLike(createMultiRemoteElementArrayMock(browsers(), 'sel', 2))).toBe(true)
            expect(isMultiRemoteElementsLike(multiRemoteElementArray())).toBe(true)

            expect(isMultiRemoteElementsLike(createMultiRemoteElementMock(browsers(), 'sel'))).toBe(false)
        })

        test(isMultiRemoteElementLike, () => {
            expect(isMultiRemoteElementLike(createMultiRemoteElementMock(browsers(), 'sel'))).toBe(true)
            expect(isMultiRemoteElementLike(createMultiRemoteElementArrayMock(browsers(), 'sel', 2))).toBe(true)

            expect(isMultiRemoteElementLike(elementFactory('sel'))).toBe(false)
        })

        test('regular element guards exclude multi-remote elements', () => {
            expect(isElement(createMultiRemoteElementMock(browsers(), 'sel'))).toBe(false)
            expect(isArrayOfElement(createMultiRemoteElementArrayMock(browsers(), 'sel', 2))).toBe(false)
            expect(isElementArrayLike(createMultiRemoteElementArrayMock(browsers(), 'sel', 2))).toBe(false)

            const elementArray = multiRemoteElementArray()
            expect(isElementArray(elementArray)).toBe(false)
            expect(isStrictlyElementArray(elementArray)).toBe(false)
            expect(isElementArrayLike(elementArray)).toBe(false)
        })

        test('isElementArrayLike is false for a MultiRemoteElementArray whose `every` is asynchronous', () => {
            const elements = multiRemoteElementArray() as unknown as { every: unknown }
            // Like WebdriverIO's `enhanceElementsArray()`, returning a (truthy) Promise
            elements.every = async () => false

            expect(isElementArrayLike(elements)).toBe(false)
        })
    })
})
