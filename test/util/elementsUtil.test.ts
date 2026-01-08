import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { awaitElements, wrapExpectedWithArray, map } from '../../src/util/elementsUtil.js'
import { elementFactory } from '../__mocks__/@wdio/globals.js'

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

    describe(awaitElements, () => {

        describe('given single element', () => {

            let element: WebdriverIO.Element
            let chainableElement: ChainablePromiseElement

            beforeEach(() => {
                element = elementFactory('element1')
                chainableElement = $('element1')
            })

            test('should return undefined when received is undefined', async () => {
                const awaitedElements = await awaitElements(undefined)

                expect(awaitedElements).toEqual({
                    elements: undefined,
                    isSingleElement: undefined,
                    isElementLikeType: false
                })
            })

            test('should return undefined when received is Promise of undefined (typing not supported)', async () => {
                const awaitedElements = await awaitElements(Promise.resolve(undefined) as any)

                expect(awaitedElements).toEqual({
                    elements: undefined,
                    isSingleElement: undefined,
                    isElementLikeType: false
                })
            })

            test('should return single element when received is a non-awaited ChainableElement', async () => {
                const awaitedElements = await awaitElements(chainableElement)

                expect(awaitedElements.elements).toHaveLength(1)
                expect(awaitedElements).toEqual({
                    elements: expect.arrayContaining([
                        expect.objectContaining({ selector: element.selector })
                    ]),
                    isSingleElement: true,
                    isElementLikeType: true
                })
            })

            test('should return single element when received is an awaited ChainableElement', async () => {
                const awaitedElements = await awaitElements(await chainableElement)

                expect(awaitedElements.elements).toHaveLength(1)
                expect(awaitedElements).toEqual({
                    elements: expect.arrayContaining([
                        expect.objectContaining({ selector: element.selector })
                    ]),
                    isSingleElement: true,
                    isElementLikeType: true
                })
            })

            test('should return single element when received is getElement of non awaited ChainableElement (typing not supported)', async () => {
                const awaitedElements = await awaitElements(chainableElement.getElement() as any)

                expect(awaitedElements.elements).toHaveLength(1)
                expect(awaitedElements).toEqual({
                    elements: expect.arrayContaining([
                        expect.objectContaining({ selector: element.selector })
                    ]),
                    isSingleElement: true,
                    isElementLikeType: true
                })
            })

            test('should return single element when received is getElement of an awaited ChainableElement', async () => {
                const awaitedElements = await awaitElements(await chainableElement.getElement())

                expect(awaitedElements.elements).toHaveLength(1)
                expect(awaitedElements).toEqual({
                    elements: expect.arrayContaining([
                        expect.objectContaining({ selector: element.selector })
                    ]),
                    isSingleElement: true,
                    isElementLikeType: true
                })
            })

            test('should return single element when received is WebdriverIO.Element', async () => {
                const awaitedElements = await awaitElements(element)

                expect(awaitedElements.elements).toHaveLength(1)
                expect(awaitedElements).toEqual({
                    elements: expect.arrayContaining([
                        expect.objectContaining({ selector: element.selector })
                    ]),
                    isSingleElement: true,
                    isElementLikeType: true
                })
            })

            test('should return multiple elements when received is WebdriverIO.Element[]', async () => {
                const elementArray = [elementFactory('element1'), elementFactory('element2')]

                const awaitedElements = await awaitElements(elementArray)

                expect(awaitedElements.elements).toHaveLength(2)
                expect(awaitedElements).toEqual({
                    elements: expect.arrayContaining([
                        expect.objectContaining({ selector: elementArray[0].selector }), expect.objectContaining({ selector: elementArray[1].selector })
                    ]),
                    isSingleElement: false,
                    isElementLikeType: true
                })
                expect(awaitedElements.elements).toHaveLength(2)
                expect(awaitedElements.elements?.[0].selector).toEqual(elementArray[0].selector)
                expect(awaitedElements.elements?.[1].selector).toEqual(elementArray[1].selector)
                expect(awaitedElements.isSingleElement).toBe(false)
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
                const { elements, isSingleElement, isElementLikeType } = await awaitElements(chainableElementArray)

                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(isSingleElement).toBe(false)
                expect(isElementLikeType).toBe(true)
            })

            test('should return multiple elements when received is an awaited ChainableElementArray', async () => {
                const { elements, isSingleElement, isElementLikeType } = await awaitElements(await chainableElementArray)

                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(isSingleElement).toBe(false)
                expect(isElementLikeType).toBe(true)
            })

            test('should return multiple elements when received is getElements of non awaited ChainableElement (typing not supported)', async () => {
                const { elements, isSingleElement, isElementLikeType } = await awaitElements(chainableElementArray.getElements() as any)

                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(isSingleElement).toBe(false)
                expect(isElementLikeType).toBe(true)
            })

            test('should return multiple elements when received is getElements of an awaited ChainableElementArray', async () => {
                const { elements, isSingleElement, isElementLikeType } = await awaitElements(await chainableElementArray.getElements())
                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element1.selector })
                ]))
                expect(isSingleElement).toBe(false)
                expect(isElementLikeType).toBe(true)
            })

            test('should return multiple elements when received is WebdriverIO.Element[]', async () => {
                const { elements, isSingleElement, isElementLikeType } = await awaitElements(elementArray)
                expect(elements).toHaveLength(2)
                expect(elements).toEqual(expect.objectContaining([
                    expect.objectContaining({ selector: element1.selector }),
                    expect.objectContaining({ selector: element2.selector })
                ]))
                expect(isSingleElement).toBe(false)
                expect(isElementLikeType).toBe(true)
            })
        })

        test('should return the same object when not any type related to Elements', async () => {
            const anyOjbect = { foo: 'bar' }

            const { elements, isSingleElement, isElementLikeType } = await awaitElements(anyOjbect as any)

            expect(elements).toBe(anyOjbect)
            expect(isSingleElement).toBe(false)
            expect(isElementLikeType).toBe(false)
        })

    })

    describe(map, () => {
        test('should map elements of type Element[]', async () => {
            const elements: WebdriverIO.Element[] = [elementFactory('el1'), elementFactory('el2')]
            const command = vi.fn().mockResolvedValue('mapped')

            const result = await map(elements, command)

            expect(result).toEqual(['mapped', 'mapped'])
            expect(command).toHaveBeenCalledTimes(2)
            expect(command).toHaveBeenCalledWith(elements[0], 0)
            expect(command).toHaveBeenCalledWith(elements[1], 1)
        })
        test('should map elements of type ElementArray', async () => {
            const elements: WebdriverIO.ElementArray = await $$('elements').getElements()
            const command = vi.fn().mockResolvedValue('mapped')

            const result = await map(elements, command)

            expect(result).toEqual(['mapped', 'mapped'])
            expect(command).toHaveBeenCalledTimes(2)
            expect(command).toHaveBeenCalledWith(elements[0], 0)
            expect(command).toHaveBeenCalledWith(elements[1], 1)
        })
    })
})
