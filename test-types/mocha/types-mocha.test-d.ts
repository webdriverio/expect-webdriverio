/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio'
import { expectTypeOf } from 'vitest'

describe('type assertions', () => {
    const chainableElement = {} as unknown as ChainablePromiseElement
    const chainableArray = {} as ChainablePromiseArray

    const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
    const elementArray: WebdriverIO.ElementArray = [] as unknown as WebdriverIO.ElementArray
    const elements: WebdriverIO.Element[] = [] as unknown as WebdriverIO.Element[]

    const networkMock: WebdriverIO.Mock = {} as unknown as WebdriverIO.Mock
    const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser

    // Type assertions

    describe('Browser', () => {
        describe('toHaveUrl', () => {
            it('should be supported correctly', async () => {
                expectTypeOf(expect(browser).toHaveUrl('https://example.com')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).not.toHaveUrl('https://example.com')).toEqualTypeOf<Promise<void>>()

                // Asymmetric matchers
                expectTypeOf(expect(browser).toHaveUrl(expect.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveUrl(expect.not.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveUrl(expect.any(String))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveUrl(expect.anything())).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(browser).toHaveUrl('https://example.com')).not.toEqualTypeOf<void>()
                expectTypeOf(expect(browser).not.toHaveUrl('https://example.com')).not.toEqualTypeOf<void>()
                expectTypeOf(expect(browser).toHaveUrl(expect.stringContaining('WebdriverIO'))).not.toEqualTypeOf<void>()

                expectTypeOf(expect(browser).toHaveUrl).parameter(0).extract<number>().toBeNever()
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                expectTypeOf(expect(element).toHaveUrl).toBeNever()
                // @ts-expect-error
                await expect(element).not.toHaveUrl('https://example.com')
                expectTypeOf(expect(true).toHaveUrl).toBeNever()
                // @ts-expect-error
                await expect(true).not.toHaveUrl('https://example.com')
            })
        })

        describe('toHaveTitle', () => {
            it('should be supported correctly', async () => {
                expectTypeOf(expect(browser).toHaveTitle('https://example.com')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).not.toHaveTitle('https://example.com')).toEqualTypeOf<Promise<void>>()

                // Asymmetric matchers
                expectTypeOf(expect(browser).toHaveTitle(expect.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveTitle(expect.any(String))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveTitle(expect.anything())).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(browser).toHaveTitle('https://example.com')).not.toEqualTypeOf<void>()
                expectTypeOf(expect(browser).not.toHaveTitle('https://example.com')).not.toEqualTypeOf<void>()
                expectTypeOf(expect(browser).toHaveTitle(expect.stringContaining('WebdriverIO'))).not.toEqualTypeOf<void>()
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                expectTypeOf(expect(element).toHaveTitle).toBeNever()
                // @ts-expect-error
                await expect(element).not.toHaveTitle('https://example.com')
                expectTypeOf(expect(true).toHaveTitle).toBeNever()
                // @ts-expect-error
                await expect(true).not.toHaveTitle('https://example.com')
            })
        })
    })

    describe('element', () => {

        describe('toBeDisabled', () => {
            it('should be supported correctly', async () => {
                // Element
                expectTypeOf(expect(element).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()

                // Element array
                expectTypeOf(expect(elementArray).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()

                // Chainable element
                expectTypeOf(expect(chainableElement).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()

                // Chainable element array
                expectTypeOf(expect(chainableArray).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toBeDisabled()).not.toEqualTypeOf<void>()
                expectTypeOf(expect(element).not.toBeDisabled()).not.toEqualTypeOf<void>()
            })

            it('should have ts errors when actual is not an element', async () => {
                expectTypeOf(expect(browser).toBeDisabled).toBeNever()
                // @ts-expect-error
                await expect(browser).not.toBeDisabled()
                expectTypeOf(expect(true).toBeDisabled).toBeNever()
                // @ts-expect-error
                await expect(true).not.toBeDisabled()
            })
        })

        describe('toHaveText', () => {
            it('should be supported correctly', async () => {
                expectTypeOf(expect(element).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveText([expect.stringContaining('text1'), expect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveText(['text1', /text1/, expect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()
                await expect(element).toHaveText(
                    'My-Ex-Am-Ple',
                    {
                        replace: [[/-/g, ' '], [/[A-Z]+/g, (match: string) => match.toLowerCase()]]
                    }
                )

                expectTypeOf(expect(element).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toHaveText('text')).not.toEqualTypeOf<void>()
                expectTypeOf(expect(element).toHaveText).parameter(0).extract<number>().toBeNever()

                expectTypeOf(expect(chainableElement).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveText([expect.stringContaining('text1'), expect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveText(['text1', /text1/, expect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableElement).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableElement).toHaveText('text')).not.toEqualTypeOf<void>()
                expectTypeOf(expect(chainableElement).toHaveText).parameter(0).extract<number>().toBeNever()

                expectTypeOf(expect(elementArray).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toHaveText([expect.stringContaining('text1'), expect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toHaveText(['text1', /text1/, expect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(elementArray).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(elementArray).toHaveText('text')).not.toEqualTypeOf<void>()
                expectTypeOf(expect(elementArray).toHaveText).parameter(0).extract<number>().toBeNever()

                expectTypeOf(expect(chainableArray).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toHaveText([expect.stringContaining('text1'), expect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toHaveText(['text1', /text1/, expect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableArray).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableArray).toHaveText('text')).not.toEqualTypeOf<void>()
                expectTypeOf(expect(chainableArray).toHaveText).parameter(0).extract<number>().toBeNever()

                expectTypeOf(expect(browser).toHaveText).toBeNever()
            })

            it('should have ts errors when actual is not an element', async () => {
                expectTypeOf(expect(browser).toHaveText).toBeNever()
                // @ts-expect-error
                await expect(browser).not.toHaveText('text')
                expectTypeOf(expect(true).toHaveText).toBeNever()
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                expectTypeOf(expect('text').toHaveText).toBeNever()
                // @ts-expect-error
                await expect('text').not.toHaveText('text')
                // @ts-expect-error
                await expect(Promise.resolve('text')).toHaveText('text')
                // @ts-expect-error
                await expect(Promise.resolve('text')).toHaveText('text')
            })
        })

        describe('toHaveHeight', () => {
            it('should be supported correctly', async () => {
                expectTypeOf(expect(element).toHaveHeight(100)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveHeight(100, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).not.toHaveHeight(100)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).not.toHaveHeight(100, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toHaveHeight({ width: 100, height: 200 })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).not.toHaveHeight({ width: 100, height: 200 })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).not.toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toHaveHeight(100)).not.toEqualTypeOf<void>()
                expectTypeOf(expect(element).not.toHaveHeight(100)).not.toEqualTypeOf<void>()

                expectTypeOf(expect(element).toHaveHeight({ width: 100, height: 200 })).not.toEqualTypeOf<void>()
                expectTypeOf(expect(element).not.toHaveHeight({ width: 100, height: 200 })).not.toEqualTypeOf<void>()

                expectTypeOf(expect(browser).toHaveHeight).toBeNever()
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                expectTypeOf(expect('text').toHaveHeight).toBeNever()
                // @ts-expect-error
                await expect('text').not.toHaveHeight(1)
                // @ts-expect-error
                await expect(Promise.resolve('text')).toHaveHeight(1)
                // @ts-expect-error
                await expect(Promise.resolve('text')).toHaveHeight(1)
            })
        })

        describe('toMatchSnapshot', () => {

            it('should be supported correctly', async () => {
                expectTypeOf(expect(element).toMatchSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).not.toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableElement).toMatchSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).not.toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()

                //@ts-expect-error
                expectTypeOf(expect(element).toMatchSnapshot()).toEqualTypeOf<void>()
                //@ts-expect-error
                expectTypeOf(expect(element).not.toMatchSnapshot()).toEqualTypeOf<void>()
                //@ts-expect-error
                expectTypeOf(expect(chainableElement).toMatchSnapshot()).toEqualTypeOf<void>()
                //@ts-expect-error
                expectTypeOf(expect(chainableElement).not.toMatchSnapshot()).toEqualTypeOf<void>()
            })
        })

        describe('toMatchInlineSnapshot', () => {

            it('should be correctly supported', async () => {
                expectTypeOf(expect(element).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableElement).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                //@ts-expect-error
                expectTypeOf(expect(element).toMatchInlineSnapshot()).toEqualTypeOf<void>()
                //@ts-expect-error
                expectTypeOf(expect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<void>()
            })

            it('should be correctly supported with getCSSProperty()', async () => {
                expectTypeOf(expect(element.getCSSProperty('test')).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()

                //@ts-expect-error
                expectTypeOf(expect(element).toMatchInlineSnapshot()).toEqualTypeOf<void>()
                //@ts-expect-error
                expectTypeOf(expect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<void>()

                //@ts-expect-error
                expectTypeOf(expect(element.getCSSProperty('test')).toMatchInlineSnapshot()).toEqualTypeOf<void>()
                //@ts-expect-error
                expectTypeOf(expect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot()).toEqualTypeOf<void>()
            })
        })

        describe('toBeElementsArrayOfSize', async () => {

            it('should work correctly when actual is chainableArray', async () => {
                expectTypeOf(expect(chainableArray).toBeElementsArrayOfSize(5)).toMatchTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toBeElementsArrayOfSize({ lte: 10 })).toMatchTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableArray).toBeElementsArrayOfSize(5)).not.toEqualTypeOf<void>()
                expectTypeOf(expect(chainableArray).toBeElementsArrayOfSize({ lte: 10 })).not.toEqualTypeOf<void>()
            })

            it('should work correctly when actual is element array', async () => {
                expectTypeOf(expect(elementArray).toBeElementsArrayOfSize(5)).toMatchTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toBeElementsArrayOfSize({ lte: 10 })).toMatchTypeOf<Promise<void>>()

                expectTypeOf(expect(elementArray).toBeElementsArrayOfSize(5)).not.toEqualTypeOf<void>()
                expectTypeOf(expect(elementArray).toBeElementsArrayOfSize({ lte: 10 })).not.toEqualTypeOf<void>()
            })

            it('should work correctly when actual is element[]', async () => {
                expectTypeOf(expect(elements).toBeElementsArrayOfSize(5)).toMatchTypeOf<Promise<void>>()
                expectTypeOf(expect(elements).toBeElementsArrayOfSize({ lte: 10 })).toMatchTypeOf<Promise<void>>()

                expectTypeOf(expect(elements).toBeElementsArrayOfSize(5)).not.toEqualTypeOf<void>()
                expectTypeOf(expect(elements).toBeElementsArrayOfSize({ lte: 10 })).not.toEqualTypeOf<void>()
            })

            it('should not work when actual is not chainableArray', async () => {
                expectTypeOf(expect(chainableElement).toBeElementsArrayOfSize).toBeNever()
                expectTypeOf(expect(true).toBeElementsArrayOfSize).toBeNever()
            })
        })
    })

    describe('Custom matchers', () => {
        describe('using `ExpectWebdriverIO` namespace augmentation', () => {
            it('should supported correctly a non-promise custom matcher', async () => {
                expectTypeOf(expect('test').toBeCustom()).toEqualTypeOf<void>()
                expectTypeOf(expect('test').not.toBeCustom()).toEqualTypeOf<void>()

                expectTypeOf(expect('test').toBeCustom()).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect('test').not.toBeCustom()).not.toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(1).toBeWithinRange(0, 2)).toEqualTypeOf<void>()
            })

            it('should supported correctly a promise custom matcher with only chainableElement as actual', async () => {
                expectTypeOf(expect(chainableElement).toBeCustomPromise()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toBeCustomPromise(expect.stringContaining('test'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).not.toBeCustomPromise(expect.not.stringContaining('test'))).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect('test').toBeCustomPromise).toBeNever()
                expectTypeOf(expect(chainableElement).toBeCustomPromise()).not.toEqualTypeOf<void>()
                expectTypeOf(expect(chainableElement).toBeCustomPromise(expect.stringContaining('test'))).not.toEqualTypeOf<void>()
                expectTypeOf(expect(chainableElement).not.toBeCustomPromise(expect.stringContaining('test'))).not.toEqualTypeOf<void>()
                // @ts-expect-error
                expect(chainableElement).toBeCustomPromise(expect.stringContaining(6))
            })

            it('should support custom asymmetric matcher', async () => {
                const expectString1 : ExpectWebdriverIO.PartialMatcher<string> = expect.toBeCustom()
                const expectString2 : ExpectWebdriverIO.PartialMatcher<string> = expect.not.toBeCustom()

                expectTypeOf(expect(chainableElement).toBeCustomPromise(expect.toBeCustom())).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect.toBeCustom()).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect.not.toBeCustom()).not.toEqualTypeOf<Promise<void>>()

                //@ts-expect-error
                expectTypeOf(expect(chainableElement).toBeCustomPromise(expect.toBeCustom())).toEqualTypeOf<void>()
            })
        })

        describe('using `expect` module declaration', () => {

            it('should support a simple matcher', async () => {
                expectTypeOf(expect(5).toBeWithinRange(1, 10)).toEqualTypeOf<void>()

                // Or as an asymmetric matcher:
                expectTypeOf(expect({ value: 5 }).toEqual({
                    value: expect.toBeWithinRange(1, 10)
                })).toEqualTypeOf<void>()

                // TODO: Manual fix for invalid args
                // @ts-expect-error
                expect(5).toBeWithinRange(1, '10')
                // TODO: Manual fix for invalid args
                // @ts-expect-error
                expect(5).toBeWithinRange('1')
            })

            it('should support a simple custom matcher with a chainable element matcher with promise', async () => {
                expectTypeOf(expect(chainableElement).toHaveSimpleCustomProperty('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveSimpleCustomProperty(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).not.toHaveSimpleCustomProperty(expect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()

                // Or as a custom asymmetric matcher:
                expectTypeOf(expect(chainableElement).toHaveSimpleCustomProperty(
                    expect.toHaveSimpleCustomProperty('string')
                )).toEqualTypeOf<Promise<void>>()
                const expectString1:string = expect.toHaveSimpleCustomProperty('string')
                const expectString2:string = expect.not.toHaveSimpleCustomProperty('string')

                // @ts-expect-error
                expect.toHaveSimpleCustomProperty(chainableElement)
                // @ts-expect-error
                expect.not.toHaveSimpleCustomProperty(chainableElement)

                // @ts-expect-error
                expect.toHaveSimpleCustomProperty(chainableElement)
            })

            it('should support a chainable element matcher with promise', async () => {
                expectTypeOf(expect(chainableElement).toHaveCustomProperty('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveCustomProperty(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).not.toHaveCustomProperty(expect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()

                // Or as a custom asymmetric matcher:
                expectTypeOf(expect(chainableElement).toHaveCustomProperty(
                    await expect.toHaveCustomProperty(chainableElement)
                )).toEqualTypeOf<Promise<void>>()
                const expectPromiseWdioElement1: Promise<ExpectWebdriverIO.PartialMatcher<string>> = expect.toHaveCustomProperty(chainableElement)
                const expectPromiseWdioElement2: Promise<ExpectWebdriverIO.PartialMatcher<string>> = expect.not.toHaveCustomProperty(chainableElement)

                expectTypeOf(expect.toHaveCustomProperty(chainableElement)).not.toEqualTypeOf<void>()
                expectTypeOf(expect.not.toHaveCustomProperty(chainableElement)).not.toEqualTypeOf<void>()

                expectTypeOf(expect.toHaveCustomProperty(chainableElement)).not.toEqualTypeOf<void>()
                // @ts-expect-error
                expect.toHaveCustomProperty('test')

                await expect(chainableElement).toHaveCustomProperty(
                    await expect.toHaveCustomProperty(chainableElement)
                )
            })
        })
    })

    describe('toBe', () => {

        it('should expect void type when actual is a boolean', async () => {
            expectTypeOf(expect(true).toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(expect(true).not.toBe(true)).toEqualTypeOf<void>()

            //@ts-expect-error
            expectTypeOf(expect(true).toBe(true)).toEqualTypeOf<Promise<void>>()
            //@ts-expect-error
            expectTypeOf(expect(true).not.toBe(true)).toEqualTypeOf<Promise<void>>()
        })

        it('should not expect Promise when actual is a chainable since toBe does not need to be awaited', async () => {
            expectTypeOf(expect(chainableElement).toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(expect(chainableElement).not.toBe(true)).toEqualTypeOf<void>()

            //@ts-expect-error
            expectTypeOf(expect(chainableElement).toBe(true)).toEqualTypeOf<Promise<void>>()
            //@ts-expect-error
            expectTypeOf(expect(chainableElement).not.toBe(true)).toEqualTypeOf<Promise<void>>()
        })

        it('should still expect void type when actual is a Promise since we do not overload them', async () => {
            const promiseBoolean = Promise.resolve(true)

            expectTypeOf(expect(promiseBoolean).toBeDefined()).toEqualTypeOf<void>()
            expectTypeOf(expect(promiseBoolean).not.toBeDefined()).toEqualTypeOf<void>()

            //@ts-expect-error
            expectTypeOf(expect(promiseBoolean).toBeDefined()).toEqualTypeOf<Promise<void>>()
            //@ts-expect-error
            expectTypeOf(expect(promiseBoolean).toBeDefined()).toEqualTypeOf<Promise<void>>()
        })

        it('should work with string', async () => {
            expectTypeOf(expect('text').toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(expect('text').not.toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(expect('text').toBe(expect.stringContaining('text'))).toEqualTypeOf<void>()
            expectTypeOf(expect('text').not.toBe(expect.stringContaining('text'))).toEqualTypeOf<void>()

            //@ts-expect-error
            expectTypeOf(expect('text').toBe(true)).toEqualTypeOf<Promise<void>>()
            //@ts-expect-error
            expectTypeOf(expect('text').not.toBe(true)).toEqualTypeOf<Promise<void>>()
            //@ts-expect-error
            expectTypeOf(expect('text').toBe(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
            //@ts-expect-error
            expectTypeOf(expect('text').not.toBe(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
        })
    })

    describe('Promise type assertions', () => {
        const booleanPromise: Promise<boolean> = Promise.resolve(true)

        it('should have expect return Matchers with a Promise', async () => {
            const expectPromiseBoolean1: ExpectWebdriverIO.Matchers<void, Promise<boolean>> & ExpectLibInverse<ExpectWebdriverIO.Matchers<void, Promise<boolean>>> & ExpectWebdriverIO.PromiseMatchers<boolean> = expect(booleanPromise)
            const expectPromiseBoolean2: ExpectWebdriverIO.Matchers<void, Promise<boolean>> = expect(booleanPromise).not
        })

        it('should work with resolves & rejects correctly', async () => {
            expectTypeOf(expect(booleanPromise).resolves.toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(booleanPromise).rejects.toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(booleanPromise).rejects.not.toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(booleanPromise).resolves.not.toBe(true)).toEqualTypeOf<Promise<void>>()

            //@ts-expect-error
            expectTypeOf(expect(booleanPromise).resolves.toBe(true)).toEqualTypeOf<void>()
            //@ts-expect-error
            expectTypeOf(expect(booleanPromise).rejects.toBe(true)).toEqualTypeOf<void>()

            //@ts-expect-error
            expect(true).resolves.toBe(true)
            //@ts-expect-error
            expect(true).rejects.toBe(true)
        })

        it('should not support chainable and expect PromiseVoid with toBe', async () => {
            //@ts-expect-error
            expectTypeOf(expect(chainableElement).toBe(true)).toEqualTypeOf<Promise<void>>()
            //@ts-expect-error
            expectTypeOf(expect(chainableElement).not.toBe(true)).toEqualTypeOf<Promise<void>>()
        })
    })

    describe('Network Matchers', () => {
        const promiseNetworkMock = Promise.resolve(networkMock)

        it('should not have ts errors when typing to Promise', async () => {
            expectTypeOf(expect(promiseNetworkMock).toBeRequested()).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(promiseNetworkMock).toBeRequestedTimes(2)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 })).toEqualTypeOf<Promise<void>>()

            expectTypeOf(expect(promiseNetworkMock).not.toBeRequested()).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(promiseNetworkMock).not.toBeRequestedTimes(2)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 })).toEqualTypeOf<Promise<void>>()

            expectTypeOf(expect(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api',
                method: 'POST',
                statusCode: 200,
                requestHeaders: { Authorization: 'foo' },
                responseHeaders: { Authorization: 'bar' },
                postData: { title: 'foo', description: 'bar' },
                response: { success: true },
            })).toEqualTypeOf<Promise<void>>()

            expectTypeOf(expect(promiseNetworkMock).toBeRequestedWith({
                url: expect.stringContaining('test'),
                method: 'POST',
                statusCode: 200,
                requestHeaders: expect.objectContaining({ Authorization: 'foo' }),
                responseHeaders: expect.objectContaining({ Authorization: 'bar' }),
                postData: expect.objectContaining({ title: 'foo', description: 'bar' }),
                response: expect.objectContaining({ success: true }),
            })).toEqualTypeOf<Promise<void>>()

            expectTypeOf(expect(promiseNetworkMock).toBeRequestedWith({
                url: expect.stringMatching(/.*\/api\/.*/i),
                method: ['POST', 'PUT'],
                statusCode: [401, 403],
                requestHeaders: headers => headers.Authorization.startsWith('Bearer '),
                postData: expect.objectContaining({ released: true, title: expect.stringContaining('foobar') }),
                response: (r: { data: { items: unknown[] } }) => Array.isArray(r) && r.data.items.length === 20
            })).toEqualTypeOf<Promise<void>>()
        })

        it('should have ts errors when typing to void', async () => {
            expectTypeOf(expect(promiseNetworkMock).toBeRequested()).not.toEqualTypeOf<void>()
            expectTypeOf(expect(promiseNetworkMock).toBeRequestedTimes(2) ).not.toEqualTypeOf<void>()// await expect(mock).toBeRequestedTimes({ eq: 2 })
            expectTypeOf(expect(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 }) ).not.toEqualTypeOf<void>()// request called at least 5 times but less than 11

            expectTypeOf(expect(promiseNetworkMock).not.toBeRequested()).not.toEqualTypeOf<void>()
            expectTypeOf(expect(promiseNetworkMock).not.toBeRequestedTimes(2) ).not.toEqualTypeOf<void>()// await expect(mock).toBeRequestedTimes({ eq: 2 })
            expectTypeOf(expect(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 }) ).not.toEqualTypeOf<void>()// request called at least 5 times but less than 11

            expectTypeOf(expect(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api',
                method: 'POST',
                statusCode: 200,
                requestHeaders: { Authorization: 'foo' },
                responseHeaders: { Authorization: 'bar' },
                postData: { title: 'foo', description: 'bar' },
                response: { success: true },
            })).not.toEqualTypeOf<void>()

            expectTypeOf(expect(promiseNetworkMock).toBeRequestedWith(expect.objectContaining({
                response: { success: true },
            }))).not.toEqualTypeOf<void>()
        })
    })

    describe('Expect', () => {
        it('should have ts errors when using a non existing expect.function', async () => {
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect.unimplementedFunction
        })

        it('should support stringContaining, anything and more', async () => {
            expect.stringContaining('WebdriverIO')
            expect.stringMatching(/WebdriverIO/)
            expect.arrayContaining(['WebdriverIO', 'Test'])
            expect.objectContaining({ name: 'WebdriverIO' })
            // Was not there but works!
            expect.closeTo(5, 10)
            expect.arrayContaining(['WebdriverIO', 'Test'])
            // New from jest 30!!
            expect.arrayOf(expect.stringContaining('WebdriverIO'))

            expect.anything()
            expect.any(Function)
            expect.any(Number)
            expect.any(Boolean)
            expect.any(String)
            expect.any(Symbol)
            expect.any(Date)
            expect.any(Error)

            expect.not.stringContaining('WebdriverIO')
            expect.not.stringMatching(/WebdriverIO/)
            expect.not.arrayContaining(['WebdriverIO', 'Test'])
            expect.not.objectContaining({ name: 'WebdriverIO' })
            expect.not.closeTo(5, 10)
            expect.not.arrayContaining(['WebdriverIO', 'Test'])
            expect.not.arrayOf(expect.stringContaining('WebdriverIO'))
        })

        describe('Soft Assertions', async () => {
            const actualString: string = 'Test Page'
            const actualPromiseString: Promise<string> = Promise.resolve('Test Page')

            describe('expect.soft', () => {
                it('should not need to be awaited/be a promise if actual is non-promise type', async () => {
                    const expectWdioMatcher1: WdioCustomMatchers<void, string> = expect.soft(actualString)
                    expectTypeOf(expect.soft(actualString).toBe('Test Page')).toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(actualString).not.toBe('Test Page')).toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(actualString).not.toBe(expect.stringContaining('Test Page'))).toEqualTypeOf<void>()

                    expectTypeOf(expect.soft(actualString).toBe('Test Page')).not.toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(actualString).not.toBe('Test Page')).not.toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(actualString).not.toBe(expect.stringContaining('Test Page'))).not.toEqualTypeOf<Promise<void>>()
                })

                it('should need to be awaited/be a promise if actual is promise type', async () => {
                    const expectWdioMatcher1: ExpectWebdriverIO.MatchersAndInverse<Promise<void>, Promise<string>> = expect.soft(actualPromiseString)
                    expectTypeOf(expect.soft(actualPromiseString).toBe('Test Page')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(actualPromiseString).not.toBe('Test Page')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(actualPromiseString).not.toBe(expect.stringContaining('Test Page'))).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expect.soft(actualPromiseString).toBe('Test Page')).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(actualPromiseString).not.toBe('Test Page')).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(actualPromiseString).not.toBe(expect.stringContaining('Test Page'))).not.toEqualTypeOf<void>()
                })

                it('should support chainable element', async () => {
                    const expectElement: ExpectWebdriverIO.MatchersAndInverse<void, WebdriverIO.Element> = expect.soft(element)
                    const expectElementChainable: ExpectWebdriverIO.MatchersAndInverse<void, typeof chainableElement> = expect.soft(chainableElement)

                    // @ts-expect-error
                    const expectElement2: ExpectWebdriverIO.MatchersAndInverse<Promise<void>, WebdriverIO.Element> = expect.soft(element)
                    // @ts-expect-error
                    const expectElementChainable2: ExpectWebdriverIO.MatchersAndInverse<Promise<void>, typeof chainableElement> = expect.soft(chainableElement)
                })

                it('should support chainable element with wdio Matchers', async () => {
                    expectTypeOf(expect.soft(element).toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableArray).toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    await expect.soft(element).toBeDisplayed()
                    await expect.soft(chainableElement).toBeDisplayed()
                    await expect.soft(chainableArray).toBeDisplayed()

                    expectTypeOf(expect.soft(element).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableArray).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    await expect.soft(element).not.toBeDisplayed()
                    await expect.soft(chainableElement).not.toBeDisplayed()
                    await expect.soft(chainableArray).not.toBeDisplayed()

                    expectTypeOf(expect.soft(element).toBeDisplayed()).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).toBeDisplayed()).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableArray).toBeDisplayed()).not.toEqualTypeOf<void>()

                    expectTypeOf(expect.soft(element).not.toBeDisplayed()).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).not.toBeDisplayed()).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableArray).not.toBeDisplayed()).not.toEqualTypeOf<void>()
                })

                it('should work with custom matcher and custom asymmetric matchers from `expect` module', async () => {
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).not.toHaveCustomProperty(expect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty(
                        expect.toHaveCustomProperty(chainableElement)
                    )).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty('text')).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty(expect.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).not.toHaveCustomProperty(expect.not.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty(
                        expect.toHaveCustomProperty(chainableElement)
                    )).not.toEqualTypeOf<void>()

                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).not.toHaveCustomProperty(expect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty(
                        expect.toHaveCustomProperty(chainableElement)
                    )).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty('text')).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty(expect.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).not.toHaveCustomProperty(expect.not.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomProperty(
                        expect.toHaveCustomProperty(chainableElement)
                    )).not.toEqualTypeOf<void>()
                })

                it('should work with custom matcher and custom asymmetric matchers from `ExpectWebDriverIO` namespace', async () => {
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).not.toBeCustomPromise(expect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise(
                        expect.toBeCustomPromise(chainableElement)
                    )).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise('text')).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise(expect.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).not.toBeCustomPromise(expect.not.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise(
                        expect.toBeCustomPromise(chainableElement)
                    )).not.toEqualTypeOf<void>()

                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).not.toBeCustomPromise(expect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise(
                        expect.toBeCustomPromise(chainableElement)
                    )).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise('text')).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise(expect.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).not.toBeCustomPromise(expect.not.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromise(
                        expect.toBeCustomPromise(chainableElement)
                    )).not.toEqualTypeOf<void>()
                })
            })

            describe('expect.getSoftFailures', () => {
                it('should be of type `SoftFailure`', async () => {
                    const expectSoftFailure1: ExpectWebdriverIO.SoftFailure[] = expect.getSoftFailures()

                    expectTypeOf(expect.getSoftFailures()).not.toEqualTypeOf<void>()
                })
            })

            describe('expect.assertSoftFailures', () => {
                it('should be of type void', async () => {
                    expectTypeOf(expect.assertSoftFailures()).toEqualTypeOf<void>()

                    expectTypeOf(expect.assertSoftFailures()).not.toEqualTypeOf<Promise<void>>()
                })
            })

            describe('expect.clearSoftFailures', () => {
                it('should be of type void', async () => {
                    expectTypeOf(expect.clearSoftFailures()).toEqualTypeOf<void>()

                    expectTypeOf(expect.clearSoftFailures()).not.toEqualTypeOf<Promise<void>>()
                })
            })
        })
    })

    describe('Asymmetric matchers', () => {
        const string: string = 'WebdriverIO is a test framework'
        const array: string[] = ['WebdriverIO', 'Test']
        const object: { name: string } = { name: 'WebdriverIO' }
        const number: number = 1

        it('should have no ts error using asymmetric matchers', async () => {
            expect(string).toEqual(expect.stringContaining('WebdriverIO'))
            expect(array).toEqual(expect.arrayContaining(['WebdriverIO', 'Test']))
            expect(object).toEqual(expect.objectContaining({ name: 'WebdriverIO' }))
            // This one is tested and is working correctly, surprisingly!
            expect(number).toEqual(expect.closeTo(1.0001, 0.0001))
            // New from jest 30, should work!
            expect(['apple', 'banana', 'cherry']).toEqual(expect.arrayOf(expect.any(String)))
        })
    })
})
