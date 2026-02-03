/* eslint-disable @typescript-eslint/no-unused-vars */
import { expectTypeOf } from 'vitest'
import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio'

describe('Jest augmentation typing assertions tests', () => {
    const chainableElement = {} as unknown as ChainablePromiseElement
    const chainableArray = {} as ChainablePromiseArray

    const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
    const elementArray: WebdriverIO.ElementArray = [] as unknown as WebdriverIO.ElementArray
    const elements: WebdriverIO.Element[] = [] as unknown as WebdriverIO.Element[]

    const networkMock: WebdriverIO.Mock = {} as unknown as WebdriverIO.Mock
    const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser

    describe('Browser', () => {
        describe('toHaveUrl', () => {
            it('should return Promise<void>', async () => {
                expectTypeOf(expect(browser).toHaveUrl('https://example.com')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).not.toHaveUrl('https://example.com')).toEqualTypeOf<Promise<void>>()

                // Asymmetric matchers
                expectTypeOf(expect(browser).toHaveUrl(expect.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveUrl(expect.not.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveUrl(expect.any(String))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveUrl(expect.anything())).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(browser).toHaveUrl).parameter(0).extract<number>().toBeNever()
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                expectTypeOf(expect(element).toHaveUrl).toBeNever()
                expectTypeOf(expect(true).toHaveUrl).toBeNever()
            })
        })

        describe('toHaveTitle', () => {
            it('should return Promise<void>', async () => {
                expectTypeOf(expect(browser).toHaveTitle('https://example.com')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).not.toHaveTitle('https://example.com')).toEqualTypeOf<Promise<void>>()

                // Asymmetric matchers
                expectTypeOf(expect(browser).toHaveTitle(expect.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveTitle(expect.any(String))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveTitle(expect.anything())).toEqualTypeOf<Promise<void>>()
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                expectTypeOf(expect(element).toHaveTitle).toBeNever()
                expectTypeOf(expect(true).toHaveTitle).toBeNever()
            })
        })

        describe('toHaveClipboardText', () => {
            it('should return Promise<void>', async () => {
                expectTypeOf(expect(browser).toHaveClipboardText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).not.toHaveClipboardText('text')).toEqualTypeOf<Promise<void>>()

                // Asymmetric matchers
                expectTypeOf(expect(browser).toHaveClipboardText(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveClipboardText(expect.any(String))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(browser).toHaveClipboardText(expect.anything())).toEqualTypeOf<Promise<void>>()
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                expectTypeOf(expect(element).toHaveClipboardText).toBeNever()
                expectTypeOf(expect(true).toHaveClipboardText).toBeNever()
            })
        })
    })

    describe('element', () => {

        describe('toBeDisabled', () => {
            it('should return Promise<void>', async () => {
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
            })

            it('should have ts errors when actual is not an element', async () => {
                expectTypeOf(expect(browser).toBeDisabled).toBeNever()
                expectTypeOf(expect(true).toBeDisabled).toBeNever()
            })
        })

        describe('toHaveText', () => {
            it('should return Promise<void>', async () => {
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

                expectTypeOf(expect(element).toHaveText).parameter(0).extract<number>().toBeNever()

                expectTypeOf(expect(chainableElement).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveText([expect.stringContaining('text1'), expect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveText(['text1', /text1/, expect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableElement).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableElement).toHaveText).parameter(0).extract<number>().toBeNever()

                expectTypeOf(expect(elementArray).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toHaveText([expect.stringContaining('text1'), expect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toHaveText(['text1', /text1/, expect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(elementArray).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(elementArray).toHaveText).parameter(0).extract<number>().toBeNever()

                expectTypeOf(expect(chainableArray).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toHaveText([expect.stringContaining('text1'), expect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toHaveText(['text1', /text1/, expect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableArray).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableArray).toHaveText).parameter(0).extract<number>().toBeNever()

                expectTypeOf(expect(browser).toHaveText).toBeNever()
            })

            it('should have ts errors when actual is not an element', async () => {
                expectTypeOf(expect(browser).toHaveText).toBeNever()
                expectTypeOf(expect(true).toHaveText).toBeNever()
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                expectTypeOf(expect('text').toHaveText).toBeNever()
                expectTypeOf(expect(Promise.resolve('text')).toHaveText).toBeNever()
                expectTypeOf(expect(Promise.resolve('text')).toHaveText).toBeNever()
            })
        })

        describe('toHaveHeight', () => {
            it('should return Promise<void>', async () => {
                expectTypeOf(expect(element).toHaveHeight(100)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveHeight(100, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).not.toHaveHeight(100)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).not.toHaveHeight(100, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toHaveHeight({ width: 100, height: 200 })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).not.toHaveHeight({ width: 100, height: 200 })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).not.toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(browser).toHaveHeight).toBeNever()
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                expectTypeOf(expect('text').toHaveHeight).toBeNever()
                expectTypeOf(expect(Promise.resolve('text')).toHaveHeight).toBeNever()
                expectTypeOf(expect(Promise.resolve('text')).toHaveHeight).toBeNever()
            })
        })

        describe('toMatchSnapshot', () => {

            it('should return Promise<void>', async () => {
                expectTypeOf(expect(element).toMatchSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).not.toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableElement).toMatchSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).not.toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()
            })
        })

        describe('toMatchInlineSnapshot', () => {

            it('should return Promise<void>', async () => {
                expectTypeOf(expect(element).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableElement).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()
            })

            it('should return Promise<void> with getCSSProperty()', async () => {
                expectTypeOf(expect(element.getCSSProperty('test')).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
            })
        })

        describe('toBeElementsArrayOfSize', async () => {

            it('should return Promise<void> when actual is chainableArray', async () => {
                expectTypeOf(expect(chainableArray).toBeElementsArrayOfSize(5)).toMatchTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableArray).toBeElementsArrayOfSize({ lte: 10 })).toMatchTypeOf<Promise<void>>()
            })

            it('should return Promise<void> when actual is element array', async () => {
                expectTypeOf(expect(elementArray).toBeElementsArrayOfSize(5)).toMatchTypeOf<Promise<void>>()
                expectTypeOf(expect(elementArray).toBeElementsArrayOfSize({ lte: 10 })).toMatchTypeOf<Promise<void>>()
            })

            it('should return Promise<void> when actual is element[]', async () => {
                expectTypeOf(expect(elements).toBeElementsArrayOfSize(5)).toMatchTypeOf<Promise<void>>()
                expectTypeOf(expect(elements).toBeElementsArrayOfSize({ lte: 10 })).toMatchTypeOf<Promise<void>>()
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
                expectTypeOf(expect('test').toBeCustomWdio()).toEqualTypeOf<void>()
                expectTypeOf(expect('test').not.toBeCustomWdio()).toEqualTypeOf<void>()
            })

            it('should supported correctly a promise custom matcher with only chainableElement as actual', async () => {
                expectTypeOf(expect(chainableElement).toBeCustomPromiseWdio()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toBeCustomPromiseWdio(expect.stringContaining('test'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).not.toBeCustomPromiseWdio(expect.not.stringContaining('test'))).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect('test').toBeCustomPromiseWdio).toBeNever()
                expectTypeOf(expect(chainableElement).toBeCustomPromiseWdio).parameter(0).extract<number>().toBeNever()
            })

            it('should support custom asymmetric matcher', async () => {
                const expectString1 : ExpectWebdriverIO.PartialMatcher<string> = expect.toBeCustomWdio()
                const expectString2 : ExpectWebdriverIO.PartialMatcher<string> = expect.not.toBeCustomWdio()

                expectTypeOf(expect(chainableElement).toBeCustomPromiseWdio(expect.toBeCustomWdio())).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect.toBeCustomWdio()).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect.not.toBeCustomWdio()).not.toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(chainableElement).toBeCustomPromiseWdio(expect.toBeCustomWdio())).not.toEqualTypeOf<void>()
            })
        })

        describe('using `jest` namespace augmentation', () => {

            it('should support a simple matcher', async () => {
                expectTypeOf(expect(5).toBeWithinRangeJest(1, 10)).toEqualTypeOf<void>()

                // Or as an asymmetric matcher:
                expectTypeOf(expect({ value: 5 }).toEqual({
                    value: expect.toBeWithinRangeJest(1, 10)
                })).toEqualTypeOf<void>()
            })

            it('should support a simple custom matcher with a chainable element matcher with promise', async () => {
                expectTypeOf(expect(chainableElement).toHaveSimpleCustomPropertyJest('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveSimpleCustomPropertyJest(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).not.toHaveSimpleCustomPropertyJest(expect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()

                // Or as a custom asymmetric matcher:
                expectTypeOf(expect(chainableElement).toHaveSimpleCustomPropertyJest(
                    expect.toHaveSimpleCustomPropertyJest('string')
                )).toEqualTypeOf<Promise<void>>()
                const expectString1:string = expect.toHaveSimpleCustomPropertyJest('string')
                const expectString2:string = expect.not.toHaveSimpleCustomPropertyJest('string')
            })

            it('should support a chainable element matcher with promise', async () => {
                expectTypeOf(expect(chainableElement).toHaveCustomPropertyJest('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).toHaveCustomPropertyJest(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(chainableElement).not.toHaveCustomPropertyJest(expect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()

                // Or as a custom asymmetric matcher:
                expectTypeOf(expect(chainableElement).toHaveCustomPropertyJest(
                    await expect.toHaveCustomPropertyJest(chainableElement)
                )).toEqualTypeOf<Promise<void>>()
                const expectPromiseWdioElement1: Promise<ExpectWebdriverIO.PartialMatcher<string>> = expect.toHaveCustomPropertyJest(chainableElement)
                const expectPromiseWdioElement2: Promise<ExpectWebdriverIO.PartialMatcher<string>> = expect.not.toHaveCustomPropertyJest(chainableElement)

                expectTypeOf(expect.toHaveCustomPropertyJest(chainableElement)).not.toEqualTypeOf<void>()
                expectTypeOf(expect.not.toHaveCustomPropertyJest(chainableElement)).not.toEqualTypeOf<void>()

                expectTypeOf(expect.toHaveCustomPropertyJest(chainableElement)).not.toEqualTypeOf<void>()

                await expect(chainableElement).toHaveCustomPropertyJest(
                    await expect.toHaveCustomPropertyJest(chainableElement)
                )
            })
        })
    })

    describe('toBe', () => {

        it('should return void when actual is a boolean', async () => {
            expectTypeOf(expect(true).toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(expect(true).not.toBe(true)).toEqualTypeOf<void>()

            expectTypeOf(expect(true).toBe(true)).not.toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(true).not.toBe(true)).not.toEqualTypeOf<Promise<void>>()
        })

        it('should return void when actual is a chainable', async () => {
            expectTypeOf(expect(chainableElement).toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(expect(chainableElement).not.toBe(true)).toEqualTypeOf<void>()

            expectTypeOf(expect(chainableElement).toBe(true)).not.toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(chainableElement).not.toBe(true)).not.toEqualTypeOf<Promise<void>>()
        })

        it('should return void when actual is a Promise', async () => {
            const promiseBoolean = Promise.resolve(true)

            expectTypeOf(expect(promiseBoolean).toBeDefined()).toEqualTypeOf<void>()
            expectTypeOf(expect(promiseBoolean).not.toBeDefined()).toEqualTypeOf<void>()

            expectTypeOf(expect(promiseBoolean).toBeDefined()).not.toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(promiseBoolean).toBeDefined()).not.toEqualTypeOf<Promise<void>>()
        })

        it('should return void when actual is a String', async () => {
            expectTypeOf(expect('text').toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(expect('text').not.toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(expect('text').toBe(expect.stringContaining('text'))).toEqualTypeOf<void>()
            expectTypeOf(expect('text').not.toBe(expect.stringContaining('text'))).toEqualTypeOf<void>()

            expectTypeOf(expect('text').toBe(true)).not.toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect('text').not.toBe(true)).not.toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect('text').toBe(expect.stringContaining('text'))).not.toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect('text').not.toBe(expect.stringContaining('text'))).not.toEqualTypeOf<Promise<void>>()
        })
    })

    describe('Promise type assertions', () => {
        const booleanPromise: Promise<boolean> = Promise.resolve(true)

        it('should have expect return Matchers with a Promise', async () => {
            const expectPromiseBoolean1: jest.Matchers<void, Promise<boolean>> = expect(booleanPromise)
            const expectPromiseBoolean2: jest.Matchers<void, Promise<boolean>> = expect(booleanPromise).not
        })

        it('should return Promise<void> for resolves & rejects', async () => {
            expectTypeOf(expect(booleanPromise).resolves.toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(booleanPromise).rejects.toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(booleanPromise).rejects.not.toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(booleanPromise).resolves.not.toBe(true)).toEqualTypeOf<Promise<void>>()

            expectTypeOf(expect(booleanPromise).resolves.toBe(true)).not.toEqualTypeOf<void>()
            expectTypeOf(expect(booleanPromise).rejects.toBe(true)).not.toEqualTypeOf<void>()
        })

        it('should not support chainable and expect PromiseVoid with toBe', async () => {
            expectTypeOf(expect(chainableElement).toBe(true)).not.toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect(chainableElement).not.toBe(true)).not.toEqualTypeOf<Promise<void>>()
        })
    })

    describe('Network Matchers', () => {
        const promiseNetworkMock = Promise.resolve(networkMock)

        it('should return Promise<void>', async () => {
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
    })

    describe('Standard Jest Matchers', () => {
        it('should return void', async () => {
            const obj = { a: 1 }
            expectTypeOf(expect(obj).toHaveProperty('a')).toEqualTypeOf<void>()
            expectTypeOf(expect(obj).toMatchObject({ a: 1 })).toEqualTypeOf<void>()
            expectTypeOf(expect(obj).toStrictEqual({ a: 1 })).toEqualTypeOf<void>()
            expectTypeOf(expect([1, 2]).toHaveLength(2)).toEqualTypeOf<void>()
        })
    })

    describe('More WDIO Matchers', () => {
        describe('Attribute Matchers', () => {
            it('should return Promise<void>', async () => {
                expectTypeOf(expect(element).toHaveAttribute('class')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveAttribute('class', 'val')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveAttribute('class', expect.stringContaining('val'))).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toHaveAttr('class')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveAttr('class', 'val')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveAttr('class', expect.stringContaining('val'))).toEqualTypeOf<Promise<void>>()
            })
        })

        describe('Class Matchers', () => {
            it('should return Promise<void>', async () => {
                expectTypeOf(expect(element).toHaveClass('class')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveClass(expect.stringContaining('class'))).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toHaveElementClass('class')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveElementClass(expect.stringContaining('class'))).toEqualTypeOf<Promise<void>>()
            })
        })

        describe('Property Matchers', () => {
            it('should return Promise<void>', async () => {
                expectTypeOf(expect(element).toHaveValue('val')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveValue(expect.stringContaining('val'))).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toHaveElementProperty('prop')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveElementProperty('prop', 'val')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveElementProperty('prop', expect.stringContaining('val'))).toEqualTypeOf<Promise<void>>()
            })
        })

        describe('Link Matchers', () => {
            it('should return Promise<void>', async () => {
                expectTypeOf(expect(element).toHaveHref('href')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveHref(expect.stringContaining('href'))).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toHaveLink('href')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveLink(expect.stringContaining('href'))).toEqualTypeOf<Promise<void>>()
            })
        })

        describe('Identity & Other Matchers', () => {
            it('should return Promise<void>', async () => {
                expectTypeOf(expect(element).toHaveId('id')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveId(expect.stringContaining('id'))).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toHaveHTML('html')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveHTML(expect.stringContaining('html'))).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toHaveComputedLabel('label')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveComputedLabel(expect.stringContaining('label'))).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expect(element).toHaveComputedRole('role')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveComputedRole(expect.stringContaining('role'))).toEqualTypeOf<Promise<void>>()
            })
        })

        describe('State Matchers', () => {
            it('should return Promise<void>', async () => {
                expectTypeOf(expect(element).toBeClickable()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toExist()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toBePresent()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toBeExisting()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toBeDisplayedInViewport()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toBeEnabled()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toBeFocused()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toBeSelected()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toBeChecked()).toEqualTypeOf<Promise<void>>()
            })
        })

        describe('Structure Matchers', () => {
            it('should return Promise<void>', async () => {
                expectTypeOf(expect(element).toHaveChildren()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveSize({ width: 10, height: 10 })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveWidth(10)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(element).toHaveStyle({ color: 'red' })).toEqualTypeOf<Promise<void>>()
            })
        })
    })

    describe('Expect', () => {
        it('should support stringContaining, anything and more', async () => {
            expect.stringContaining('WebdriverIO')
            expect.stringMatching(/WebdriverIO/)
            expect.arrayContaining(['WebdriverIO', 'Test'])
            expect.objectContaining({ name: 'WebdriverIO' })
            expect.closeTo(5, 10)
            expect.arrayContaining(['WebdriverIO', 'Test'])
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
                it('should return void if actual is non-promise type', async () => {
                    const expectWdioMatcher1: WdioCustomMatchers<void, string> = expect.soft(actualString)
                    expectTypeOf(expect.soft(actualString).toBe('Test Page')).toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(actualString).not.toBe('Test Page')).toEqualTypeOf<void>()
                    expectTypeOf(expect.soft(actualString).not.toBe(expect.stringContaining('Test Page'))).toEqualTypeOf<void>()
                })

                it('should return Promise<void> if actual is promise type', async () => {
                    const expectWdioMatcher1: ExpectWebdriverIO.MatchersAndInverse<Promise<void>, Promise<string>> = expect.soft(actualPromiseString)
                    expectTypeOf(expect.soft(actualPromiseString).toBe('Test Page')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(actualPromiseString).not.toBe('Test Page')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(actualPromiseString).not.toBe(expect.stringContaining('Test Page'))).toEqualTypeOf<Promise<void>>()
                })

                it('should support chainable element', async () => {
                    const expectElement: ExpectWebdriverIO.MatchersAndInverse<void, WebdriverIO.Element> = expect.soft(element)
                    const expectElementChainable: ExpectWebdriverIO.MatchersAndInverse<void, typeof chainableElement> = expect.soft(chainableElement)
                })

                it('should return Promise<void> with WDIO matchers', async () => {
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
                })

                it('should work with custom matcher and custom asymmetric matchers from `expect` module', async () => {
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomPropertyExpect('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomPropertyExpect(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).not.toHaveCustomPropertyExpect(expect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toHaveCustomPropertyExpect(
                        expect.toHaveCustomPropertyExpect(chainableElement)
                    )).toEqualTypeOf<Promise<void>>()
                })

                it('should work with custom matcher and custom asymmetric matchers from `ExpectWebDriverIO` namespace', async () => {
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromiseWdio('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromiseWdio(expect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).not.toBeCustomPromiseWdio(expect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(expect.soft(chainableElement).toBeCustomPromiseWdio(
                        expect.toBeCustomPromiseWdio(chainableElement)
                    )).toEqualTypeOf<Promise<void>>()
                })
            })

            describe('expect.getSoftFailures', () => {
                it('should return `SoftFailure[]`', async () => {
                    const expectSoftFailure1: ExpectWebdriverIO.SoftFailure[] = expect.getSoftFailures()
                    expectTypeOf(expect.getSoftFailures()).toEqualTypeOf<ExpectWebdriverIO.SoftFailure[]>()
                })
            })

            describe('expect.assertSoftFailures', () => {
                it('should return void', async () => {
                    expectTypeOf(expect.assertSoftFailures()).toEqualTypeOf<void>()
                })
            })

            describe('expect.clearSoftFailures', () => {
                it('should return void', async () => {
                    expectTypeOf(expect.clearSoftFailures()).toEqualTypeOf<void>()
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

    describe('@types/jest only - original Matchers', () => {
        describe('toMatchSnapshot & toMatchInlineSnapshot', () => {
            const snapshotName: string = 'test-snapshot'

            it('should work with string', async () => {
                const jsonString: string = '{}'
                const propertyMatchers = 'test'
                expectTypeOf(expect(jsonString).toMatchSnapshot(propertyMatchers)).toEqualTypeOf<void>()
                expectTypeOf(expect(jsonString).toMatchSnapshot(propertyMatchers, snapshotName)).toEqualTypeOf<void>()
                expectTypeOf(expect(jsonString).toMatchInlineSnapshot(propertyMatchers)).toEqualTypeOf<void>()
                expectTypeOf(expect(jsonString).toMatchInlineSnapshot(propertyMatchers, snapshotName)).toEqualTypeOf<void>()

                expectTypeOf(expect(jsonString).not.toMatchSnapshot(propertyMatchers)).toEqualTypeOf<void>()
                expectTypeOf(expect(jsonString).not.toMatchSnapshot(propertyMatchers, snapshotName)).toEqualTypeOf<void>()
                expectTypeOf(expect(jsonString).not.toMatchInlineSnapshot(propertyMatchers)).toEqualTypeOf<void>()
                expectTypeOf(expect(jsonString).not.toMatchInlineSnapshot(propertyMatchers, snapshotName)).toEqualTypeOf<void>()

                expectTypeOf(expect(jsonString).toMatchSnapshot(propertyMatchers)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(jsonString).toMatchSnapshot(propertyMatchers, snapshotName)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(jsonString).toMatchInlineSnapshot(propertyMatchers)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(jsonString).toMatchInlineSnapshot(propertyMatchers, snapshotName)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(jsonString).not.toMatchSnapshot(propertyMatchers)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(jsonString).not.toMatchSnapshot(propertyMatchers, snapshotName)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(jsonString).not.toMatchInlineSnapshot(propertyMatchers)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(jsonString).not.toMatchInlineSnapshot(propertyMatchers, snapshotName)).not.toEqualTypeOf<Promise<void>>()
            })

            it('should with object', async () => {
                const treeObject = { 1: 'test', 2: 'test2' }
                const propertyMatchers = { 1: 'test' }
                expectTypeOf(expect(treeObject).toMatchSnapshot(propertyMatchers)).toEqualTypeOf<void>()
                expectTypeOf(expect(treeObject).toMatchSnapshot(propertyMatchers, snapshotName)).toEqualTypeOf<void>()
                expectTypeOf(expect(treeObject).toMatchInlineSnapshot(propertyMatchers)).toEqualTypeOf<void>()
                expectTypeOf(expect(treeObject).toMatchInlineSnapshot(propertyMatchers, snapshotName)).toEqualTypeOf<void>()

                expectTypeOf(expect(treeObject).not.toMatchSnapshot(propertyMatchers)).toEqualTypeOf<void>()
                expectTypeOf(expect(treeObject).not.toMatchSnapshot(propertyMatchers, snapshotName)).toEqualTypeOf<void>()
                expectTypeOf(expect(treeObject).not.toMatchInlineSnapshot(propertyMatchers)).toEqualTypeOf<void>()
                expectTypeOf(expect(treeObject).not.toMatchInlineSnapshot(propertyMatchers, snapshotName)).toEqualTypeOf<void>()

                expectTypeOf(expect(treeObject).toMatchSnapshot(propertyMatchers)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(treeObject).toMatchSnapshot(propertyMatchers, snapshotName)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(treeObject).toMatchInlineSnapshot(propertyMatchers)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(treeObject).toMatchInlineSnapshot(propertyMatchers, snapshotName)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(treeObject).not.toMatchSnapshot(propertyMatchers)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(treeObject).not.toMatchSnapshot(propertyMatchers, snapshotName)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(treeObject).not.toMatchInlineSnapshot(propertyMatchers)).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(expect(treeObject).not.toMatchInlineSnapshot(propertyMatchers, snapshotName)).not.toEqualTypeOf<Promise<void>>()
            })
        })
    })
})

