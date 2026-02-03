/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect as wdioExpect } from 'expect-webdriverio'
import { expectTypeOf } from 'vitest'
describe('type assertions', () => {
    const chainableElement = {} as unknown as ChainablePromiseElement
    const chainableArray = {} as ChainablePromiseArray

    const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
    const elementArray: WebdriverIO.ElementArray = [] as unknown as WebdriverIO.ElementArray

    const networkMock: WebdriverIO.Mock = {} as unknown as WebdriverIO.Mock

    // Type assertions

    describe('Browser', () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser

        describe('toHaveUrl', () => {
            it('should be supported correctly', async () => {
                expectTypeOf(expectAsync(browser).toHaveUrl('https://example.com')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(browser).not.toHaveUrl('https://example.com')).toEqualTypeOf<Promise<void>>()

                // Asymmetric matchers
                expectTypeOf(expectAsync(browser).toHaveUrl(wdioExpect.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(browser).toHaveUrl(wdioExpect.not.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(browser).toHaveUrl(wdioExpect.any(String))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(browser).toHaveUrl(wdioExpect.anything())).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(browser).toHaveUrl('https://example.com')).not.toEqualTypeOf<void>()
                expectTypeOf(expectAsync(browser).not.toHaveUrl('https://example.com')).not.toEqualTypeOf<void>()
                expectTypeOf(expectAsync(browser).toHaveUrl(wdioExpect.stringContaining('WebdriverIO'))).not.toEqualTypeOf<void>()

                await expectAsync(browser).toHaveUrl(6)
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                await expectAsync(element).toHaveUrl('https://example.com')
                await expectAsync(element).not.toHaveUrl('https://example.com')
                await expectAsync(true).toHaveUrl('https://example.com')
                await expectAsync(true).not.toHaveUrl('https://example.com')
            })
        })

        describe('toHaveTitle', () => {
            it('should be supported correctly', async () => {
                const test = expectAsync('text')
                expectTypeOf(expectAsync(browser).toHaveTitle('https://example.com')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(browser).not.toHaveTitle('https://example.com')).toEqualTypeOf<Promise<void>>()

                // Asymmetric matchers
                expectTypeOf(expectAsync(browser).toHaveTitle(wdioExpect.stringContaining('WebdriverIO'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(browser).toHaveTitle(wdioExpect.any(String))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(browser).toHaveTitle(wdioExpect.anything())).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(browser).toHaveTitle('https://example.com')).not.toEqualTypeOf<void>()
                expectTypeOf(expectAsync(browser).not.toHaveTitle('https://example.com')).not.toEqualTypeOf<void>()
                expectTypeOf(expectAsync(browser).toHaveTitle(wdioExpect.stringContaining('WebdriverIO'))).not.toEqualTypeOf<void>()
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                await expectAsync(element).toHaveTitle('https://example.com')
                await expectAsync(element).not.toHaveTitle('https://example.com')
                await expectAsync(true).toHaveTitle('https://example.com')
                await expectAsync(true).not.toHaveTitle('https://example.com')
            })
        })
    })

    describe('element', () => {

        describe('toBeDisabled', () => {
            it('should be supported correctly', async () => {
                // Element
                expectTypeOf(expectAsync(element).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()

                // Element array
                expectTypeOf(expectAsync(elementArray).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(elementArray).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()

                // Chainable element
                expectTypeOf(expectAsync(chainableElement).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()

                // Chainable element array
                expectTypeOf(expectAsync(chainableArray).toBeDisabled()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableArray).not.toBeDisabled()).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(element).toBeDisabled()).not.toEqualTypeOf<void>()
                expectTypeOf(expectAsync(element).not.toBeDisabled()).not.toEqualTypeOf<void>()
            })

            it('should have ts errors when actual is not an element', async () => {
                await expectAsync(browser).toBeDisabled()
                await expectAsync(browser).not.toBeDisabled()
                await expectAsync(true).toBeDisabled()
                await expectAsync(true).not.toBeDisabled()
            })
        })

        describe('toHaveText', () => {
            it('should be supported correctly', async () => {
                expectTypeOf(expectAsync(element).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()
                await expectAsync(element).toHaveText(
                    'My-Ex-Am-Ple',
                    {
                        replace: [[/-/g, ' '], [/[A-Z]+/g, (match: string) => match.toLowerCase()]]
                    }
                )

                expectTypeOf(expectAsync(element).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(element).toHaveText('text')).not.toEqualTypeOf<void>()
                await expectAsync(element).toHaveText(6)

                expectTypeOf(expectAsync(chainableElement).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(chainableElement).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(chainableElement).toHaveText('text')).not.toEqualTypeOf<void>()
                await expectAsync(chainableElement).toHaveText(6)

                expectTypeOf(expectAsync(elementArray).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(elementArray).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(elementArray).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(elementArray).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(elementArray).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(elementArray).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(elementArray).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(elementArray).toHaveText('text')).not.toEqualTypeOf<void>()
                await expectAsync(elementArray).toHaveText(6)

                expectTypeOf(expectAsync(chainableArray).toHaveText('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableArray).toHaveText(/text/)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableArray).toHaveText(['text1', 'text2'])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableArray).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableArray).toHaveText([/text1/, /text2/])).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableArray).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(chainableArray).not.toHaveText('text')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(chainableArray).toHaveText('text')).not.toEqualTypeOf<void>()
                await expectAsync(chainableArray).toHaveText(6)

                await expectAsync(browser).toHaveText('text')
            })

            it('should have ts errors when actual is not an element', async () => {
                await expectAsync(browser).toHaveText('text')
                await expectAsync(browser).not.toHaveText('text')
                await expectAsync(true).toHaveText('text')
                await expectAsync(true).toHaveText('text')
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                await expectAsync('text').toHaveText('text')
                await expectAsync('text').not.toHaveText('text')
                await expectAsync(Promise.resolve('text')).toHaveText('text')
                await expectAsync(Promise.resolve('text')).toHaveText('text')
            })
        })

        describe('toHaveHeight', () => {
            it('should be supported correctly', async () => {
                expectTypeOf(expectAsync(element).toHaveHeight(100)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).toHaveHeight(100, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).not.toHaveHeight(100)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).not.toHaveHeight(100, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(element).toHaveHeight({ width: 100, height: 200 })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).not.toHaveHeight({ width: 100, height: 200 })).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).not.toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(element).toHaveHeight(100)).not.toEqualTypeOf<void>()
                expectTypeOf(expectAsync(element).not.toHaveHeight(100)).not.toEqualTypeOf<void>()

                expectTypeOf(expectAsync(element).toHaveHeight({ width: 100, height: 200 })).not.toEqualTypeOf<void>()
                expectTypeOf(expectAsync(element).not.toHaveHeight({ width: 100, height: 200 })).not.toEqualTypeOf<void>()

                await expectAsync(browser).toHaveHeight(100)
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                await expectAsync('text').toHaveText('text')
                await expectAsync('text').not.toHaveText('text')
                await expectAsync(Promise.resolve('text')).toHaveText('text')
                await expectAsync(Promise.resolve('text')).toHaveText('text')
            })
        })

        describe('toMatchSnapshot', () => {

            it('should be supported correctly', async () => {
                expectTypeOf(expectAsync(element).toMatchSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).not.toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(chainableElement).toMatchSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).not.toMatchSnapshot('test label')).toEqualTypeOf<Promise<void>>()
            })
        })

        describe('toMatchInlineSnapshot', () => {

            it('should be correctly supported', async () => {
                expectTypeOf(expectAsync(element).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(chainableElement).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                //@ts-expect-error
                expectTypeOf(expectAsync(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<void>()
            })

            it('should be correctly supported with getCSSProperty()', async () => {
                expectTypeOf(expectAsync(element.getCSSProperty('test')).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<Promise<void>>()

                //@ts-expect-error
                expectTypeOf(expectAsync(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')).toEqualTypeOf<void>()
            })
        })

        describe('toBeElementsArrayOfSize', async () => {

            it('should work correctly when actual is chainableArray', async () => {
                expectTypeOf(expectAsync(chainableArray).toBeElementsArrayOfSize(5)).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableArray).toBeElementsArrayOfSize({ lte: 10 })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(chainableArray).toBeElementsArrayOfSize(5)).not.toEqualTypeOf<void>()
                expectTypeOf(expectAsync(chainableArray).toBeElementsArrayOfSize({ lte: 10 })).not.toEqualTypeOf<void>()
            })

            it('should not work when actual is not chainableArray', async () => {
                await expectAsync(chainableElement).toBeElementsArrayOfSize(5)
                await expectAsync(chainableElement).toBeElementsArrayOfSize({ lte: 10 })
                await expectAsync(true).toBeElementsArrayOfSize(5)
                await expectAsync(true).toBeElementsArrayOfSize({ lte: 10 })
            })
        })
    })

    describe('Custom matchers', () => {
        describe('using `ExpectWebdriverIO` namespace augmentation', () => {

            it('should supported correctly a promise custom matcher with only chainableElement as actual', async () => {
                expectTypeOf(expectAsync(chainableElement).toBeCustomPromise()).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('test'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).not.toBeCustomPromise(wdioExpect.not.stringContaining('test'))).toEqualTypeOf<Promise<void>>()

                expectAsync('test').toBeCustomPromise()
                expectTypeOf(expectAsync(chainableElement).toBeCustomPromise()).not.toEqualTypeOf<void>()
                expectTypeOf(expectAsync(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('test'))).not.toEqualTypeOf<void>()
                expectTypeOf(expectAsync(chainableElement).not.toBeCustomPromise(wdioExpect.stringContaining('test'))).not.toEqualTypeOf<void>()
                expectAsync(chainableElement).toBeCustomPromise(wdioExpect.stringContaining(6))
            })

            it('should support custom asymmetric matcher', async () => {
                const expectString1 : ExpectWebdriverIO.PartialMatcher<string> = wdioExpect.toBeCustom()
                const expectString2 : ExpectWebdriverIO.PartialMatcher<string> = wdioExpect.not.toBeCustom()

                expectTypeOf(expectAsync(chainableElement).toBeCustomPromise(wdioExpect.toBeCustom())).toEqualTypeOf<Promise<void>>()

                expectTypeOf(wdioExpect.toBeCustom()).not.toEqualTypeOf<Promise<void>>()
                expectTypeOf(wdioExpect.not.toBeCustom()).not.toEqualTypeOf<Promise<void>>()

                //@ts-expect-error
                expectTypeOf(expectAsync(chainableElement).toBeCustomPromise(wdioExpect.toBeCustom())).toEqualTypeOf<void>()
            })
        })

        describe('using `expect` module declaration', () => {

            it('should support a simple matcher', async () => {
                expectTypeOf(expectAsync(5).toBeWithinRange(1, 10)).toEqualTypeOf<Promise<void>>()

                // Or as an asymmetric matcher:
                expectTypeOf(expectAsync({ value: 5 }).toEqual({
                    value: wdioExpect.toBeWithinRange(1, 10)
                })).toEqualTypeOf<Promise<void>>()

                expectTypeOf(expectAsync(5).toBeWithinRange(1, '10')).not.toEqualTypeOf<void>()
                expectAsync(5).toBeWithinRange('1')
            })

            it('should support a simple custom matcher with a chainable element matcher with promise', async () => {
                expectTypeOf(expectAsync(chainableElement).toHaveSimpleCustomProperty('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).toHaveSimpleCustomProperty(wdioExpect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).not.toHaveSimpleCustomProperty(wdioExpect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()

                // Or as a custom asymmetric matcher:
                expectTypeOf(expectAsync(chainableElement).toHaveSimpleCustomProperty(
                    wdioExpect.toHaveSimpleCustomProperty('string')
                )).toEqualTypeOf<Promise<void>>()
                const expectString1:string = wdioExpect.toHaveSimpleCustomProperty('string')
                const expectString2:string = wdioExpect.not.toHaveSimpleCustomProperty('string')

                expectTypeOf(wdioExpect.toHaveSimpleCustomProperty(chainableElement)).not.toEqualTypeOf<void>()
                expectTypeOf(wdioExpect.not.toHaveSimpleCustomProperty(chainableElement)).not.toEqualTypeOf<void>()

                expectTypeOf(wdioExpect.toHaveSimpleCustomProperty(chainableElement)).not.toEqualTypeOf<void>()
            })

            it('should support a chainable element matcher with promise', async () => {
                expectTypeOf(expectAsync(chainableElement).toHaveCustomProperty('text')).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).toHaveCustomProperty(wdioExpect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                expectTypeOf(expectAsync(chainableElement).not.toHaveCustomProperty(wdioExpect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()

                // Or as a custom asymmetric matcher:
                expectTypeOf(expectAsync(chainableElement).toHaveCustomProperty(
                    await wdioExpect.toHaveCustomProperty(chainableElement)
                )).toEqualTypeOf<Promise<void>>()
                const expectPromiseWdioElement1: Promise<ExpectWebdriverIO.PartialMatcher<string>> = wdioExpect.toHaveCustomProperty(chainableElement)
                const expectPromiseWdioElement2: Promise<ExpectWebdriverIO.PartialMatcher<string>> = wdioExpect.not.toHaveCustomProperty(chainableElement)

                expectTypeOf(wdioExpect.toHaveCustomProperty(chainableElement)).not.toEqualTypeOf<void>()
                expectTypeOf(wdioExpect.not.toHaveCustomProperty(chainableElement)).not.toEqualTypeOf<void>()

                expectTypeOf(wdioExpect.toHaveCustomProperty(chainableElement)).not.toEqualTypeOf<void>()
                wdioExpect.toHaveCustomProperty('test')

                await expectAsync(chainableElement).toHaveCustomProperty(
                    await wdioExpect.toHaveCustomProperty(chainableElement)
                )
            })
        })
    })

    describe('toBe', () => {
        it('should expect void type when actual is a boolean', async () => {
            expectTypeOf(expect(true).toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(expect(true).not.toBe(true)).toEqualTypeOf<void>()

            expectTypeOf(expectAsync(true).toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync(true).not.toBe(true)).toEqualTypeOf<Promise<void>>()
        })

        it('should expect Promise when actual is a chainable since toBe does not need to be awaited', async () => {
            expectTypeOf(expectAsync(chainableElement).toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync(chainableElement).not.toBe(true)).toEqualTypeOf<Promise<void>>()
        })

        it('should expect Promise type when actual is a Promise since it is expectAsync', async () => {
            const promiseBoolean = Promise.resolve(true)

            expectTypeOf(expectAsync(promiseBoolean).toBe(true)).toEqualTypeOf<Promise<unknown>>()
            expectTypeOf(expectAsync(promiseBoolean).not.toBe(true)).toEqualTypeOf<Promise<unknown>>()

            expectTypeOf(expectAsync(promiseBoolean).toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync(promiseBoolean).toBe(true)).toEqualTypeOf<Promise<void>>()
        })

        it('should work with string', async () => {
            expectTypeOf(expectAsync('text').toBe(true)).toEqualTypeOf<Promise<unknown>>()
            expectTypeOf(expectAsync('text').not.toBe(true)).toEqualTypeOf<Promise<unknown>>()
            expectTypeOf(expectAsync('text').toBe(wdioExpect.stringContaining('text'))).toEqualTypeOf<Promise<unknown>>()
            expectTypeOf(expectAsync('text').not.toBe(wdioExpect.stringContaining('text'))).toEqualTypeOf<Promise<unknown>>()

            expectTypeOf(expectAsync('text').toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync('text').not.toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync('text').toBe(wdioExpect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync('text').not.toBe(wdioExpect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
        })
    })

    describe('Promise type assertions', () => {
        const booleanPromise: Promise<boolean> = Promise.resolve(true)

        it('should expect a Promise of type', async () => {
            const expectPromiseBoolean1: jasmine.AsyncMatchers<boolean, void> = expectAsync(booleanPromise)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const expectPromiseBoolean2: jasmine.AsyncMatchers<boolean, any> = expectAsync(booleanPromise).not
        })

        it('should work with resolves & rejects correctly', async () => {
            //@ts-expect-error
            expectAsync(booleanPromise).resolves.toBe(true)
            //@ts-expect-error
            expectAsync(booleanPromise).rejects.toBe(true)
        })

        it('should not support chainable and expect PromiseVoid with toBe', async () => {
            expectTypeOf(expectAsync(chainableElement).toBe(true)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync(chainableElement).not.toBe(true)).toEqualTypeOf<Promise<void>>()
        })
    })

    describe('Network Matchers', () => {
        const promiseNetworkMock = Promise.resolve(networkMock)

        it('should not have ts errors when typing to Promise', async () => {
            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequested()).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedTimes(2)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 })).toEqualTypeOf<Promise<void>>()

            expectTypeOf(expectAsync(promiseNetworkMock).not.toBeRequested()).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync(promiseNetworkMock).not.toBeRequestedTimes(2)).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 })).toEqualTypeOf<Promise<void>>()

            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api',
                method: 'POST',
                statusCode: 200,
                requestHeaders: { Authorization: 'foo' },
                responseHeaders: { Authorization: 'bar' },
                postData: { title: 'foo', description: 'bar' },
                response: { success: true },
            })).toEqualTypeOf<Promise<void>>()

            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith({
                url: wdioExpect.stringContaining('test'),
                method: 'POST',
                statusCode: 200,
                requestHeaders: wdioExpect.objectContaining({ Authorization: 'foo' }),
                responseHeaders: wdioExpect.objectContaining({ Authorization: 'bar' }),
                postData: wdioExpect.objectContaining({ title: 'foo', description: 'bar' }),
                response: wdioExpect.objectContaining({ success: true }),
            })).toEqualTypeOf<Promise<void>>()

            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith({
                url: wdioExpect.stringMatching(/.*\/api\/.*/i),
                method: ['POST', 'PUT'],
                statusCode: [401, 403],
                requestHeaders: headers => headers.Authorization.startsWith('Bearer '),
                postData: wdioExpect.objectContaining({ released: true, title: wdioExpect.stringContaining('foobar') }),
                response: (r: { data: { items: unknown[] } }) => Array.isArray(r) && r.data.items.length === 20
            })).toEqualTypeOf<Promise<void>>()

            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith(jasmine.objectContaining({
                method: 'POST'
            }))).toEqualTypeOf<Promise<void>>()
        })

        it('should have ts errors when typing to void', async () => {
            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequested()).not.toEqualTypeOf<void>()
            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedTimes(2) ).not.toEqualTypeOf<void>() // await expectAsync(mock).toBeRequestedTimes({ eq: 2 })
            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 }) ).not.toEqualTypeOf<void>() // request called at least 5 times but less than 11

            expectTypeOf(expectAsync(promiseNetworkMock).not.toBeRequested()).not.toEqualTypeOf<void>()
            expectTypeOf(expectAsync(promiseNetworkMock).not.toBeRequestedTimes(2) ).not.toEqualTypeOf<void>() // await expectAsync(mock).toBeRequestedTimes({ eq: 2 })
            expectTypeOf(expectAsync(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 }) ).not.toEqualTypeOf<void>() // request called at least 5 times but less than 11

            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api',
                method: 'POST',
                statusCode: 200,
                requestHeaders: { Authorization: 'foo' },
                responseHeaders: { Authorization: 'bar' },
                postData: { title: 'foo', description: 'bar' },
                response: { success: true },
            })).not.toEqualTypeOf<void>()

            expectTypeOf(expectAsync(promiseNetworkMock).toBeRequestedWith(wdioExpect.objectContaining({
                response: { success: true },
            }))).not.toEqualTypeOf<void>()
        })
    })

    describe('Expect', () => {
        it('should have ts errors when using a non existing wdioExpect.function', async () => {
            wdioExpect.unimplementedFunction()
        })

        it('should support stringContaining, anything and more', async () => {
            wdioExpect.stringContaining('WebdriverIO')
            wdioExpect.stringMatching(/WebdriverIO/)
            wdioExpect.arrayContaining(['WebdriverIO', 'Test'])
            wdioExpect.objectContaining({ name: 'WebdriverIO' })
            // Was not there but works!
            wdioExpect.closeTo(5, 10)
            wdioExpect.arrayContaining(['WebdriverIO', 'Test'])
            // New from jest 30!!
            wdioExpect.arrayOf(wdioExpect.stringContaining('WebdriverIO'))

            wdioExpect.anything()
            wdioExpect.any(Function)
            wdioExpect.any(Number)
            wdioExpect.any(Boolean)
            wdioExpect.any(String)
            wdioExpect.any(Symbol)
            wdioExpect.any(Date)
            wdioExpect.any(Error)

            wdioExpect.not.stringContaining('WebdriverIO')
            wdioExpect.not.stringMatching(/WebdriverIO/)
            wdioExpect.not.arrayContaining(['WebdriverIO', 'Test'])
            wdioExpect.not.objectContaining({ name: 'WebdriverIO' })
            wdioExpect.not.closeTo(5, 10)
            wdioExpect.not.arrayContaining(['WebdriverIO', 'Test'])
            wdioExpect.not.arrayOf(wdioExpect.stringContaining('WebdriverIO'))
        })

        describe('Soft Assertions', async () => {
            const actualString: string = 'Test Page'
            const actualPromiseString: Promise<string> = Promise.resolve('Test Page')

            describe('wdioExpect.soft', () => {
                it('should not need to be awaited/be a promise if actual is non-promise type', async () => {
                    const expectWdioMatcher1: WdioCustomMatchers<void, string> = wdioExpect.soft(actualString)
                    expectTypeOf(wdioExpect.soft(actualString).toBe('Test Page')).toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(actualString).not.toBe('Test Page')).toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(actualString).not.toBe(wdioExpect.stringContaining('Test Page'))).toEqualTypeOf<void>()

                    expectTypeOf(wdioExpect.soft(actualString).toBe('Test Page')).not.toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(actualString).not.toBe('Test Page')).not.toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(actualString).not.toBe(wdioExpect.stringContaining('Test Page'))).not.toEqualTypeOf<Promise<void>>()
                })

                it('should need to be awaited/be a promise if actual is promise type', async () => {
                    const expectWdioMatcher1: ExpectWebdriverIO.MatchersAndInverse<Promise<void>, Promise<string>> = wdioExpect.soft(actualPromiseString)
                    expectTypeOf(wdioExpect.soft(actualPromiseString).toBe('Test Page')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(actualPromiseString).not.toBe('Test Page')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(actualPromiseString).not.toBe(wdioExpect.stringContaining('Test Page'))).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(wdioExpect.soft(actualPromiseString).toBe('Test Page')).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(actualPromiseString).not.toBe('Test Page')).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(actualPromiseString).not.toBe(wdioExpect.stringContaining('Test Page'))).not.toEqualTypeOf<void>()
                })

                it('should support chainable element', async () => {
                    const expectElement: WdioCustomMatchers<void, WebdriverIO.Element> = wdioExpect.soft(element)
                    const expectElementChainable: WdioCustomMatchers<void, typeof chainableElement> = wdioExpect.soft(chainableElement)

                    // // @ts-expect-error
                    // const expectElement2: WdioCustomMatchers<Promise<void>, WebdriverIO.Element> = wdioExpect.soft(element)
                    // // @ts-expect-error
                    // const expectElementChainable2: WdioCustomMatchers<Promise<void>, typeof chainableElement> = wdioExpect.soft(chainableElement)
                })

                it('should support chainable element with wdio Matchers', async () => {
                    expectTypeOf(wdioExpect.soft(element).toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableArray).toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    await wdioExpect.soft(element).toBeDisplayed()
                    await wdioExpect.soft(chainableElement).toBeDisplayed()
                    await wdioExpect.soft(chainableArray).toBeDisplayed()

                    expectTypeOf(wdioExpect.soft(element).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableArray).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
                    await wdioExpect.soft(element).not.toBeDisplayed()
                    await wdioExpect.soft(chainableElement).not.toBeDisplayed()
                    await wdioExpect.soft(chainableArray).not.toBeDisplayed()

                    expectTypeOf(wdioExpect.soft(element).toBeDisplayed()).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeDisplayed()).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableArray).toBeDisplayed()).not.toEqualTypeOf<void>()

                    expectTypeOf(wdioExpect.soft(element).not.toBeDisplayed()).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).not.toBeDisplayed()).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableArray).not.toBeDisplayed()).not.toEqualTypeOf<void>()
                })
                it('should work with custom matcher and custom asymmetric matchers from `expect` module', async () => {
                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty(wdioExpect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).not.toHaveCustomProperty(wdioExpect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty(
                        wdioExpect.toHaveCustomProperty(chainableElement)
                    )).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty('text')).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty(wdioExpect.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).not.toHaveCustomProperty(wdioExpect.not.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty(
                        wdioExpect.toHaveCustomProperty(chainableElement)
                    )).not.toEqualTypeOf<void>()

                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty(wdioExpect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).not.toHaveCustomProperty(wdioExpect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty(
                        wdioExpect.toHaveCustomProperty(chainableElement)
                    )).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty('text')).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty(wdioExpect.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).not.toHaveCustomProperty(wdioExpect.not.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toHaveCustomProperty(
                        wdioExpect.toHaveCustomProperty(chainableElement)
                    )).not.toEqualTypeOf<void>()
                })

                it('should work with custom matcher and custom asymmetric matchers from `ExpectWebDriverIO` namespace', async () => {
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).not.toBeCustomPromise(wdioExpect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise(
                        wdioExpect.toBeCustomPromise(chainableElement)
                    )).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise('text')).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).not.toBeCustomPromise(wdioExpect.not.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise(
                        wdioExpect.toBeCustomPromise(chainableElement)
                    )).not.toEqualTypeOf<void>()

                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise('text')).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).not.toBeCustomPromise(wdioExpect.not.stringContaining('text'))).toEqualTypeOf<Promise<void>>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise(
                        wdioExpect.toBeCustomPromise(chainableElement)
                    )).toEqualTypeOf<Promise<void>>()

                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise('text')).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).not.toBeCustomPromise(wdioExpect.not.stringContaining('text'))).not.toEqualTypeOf<void>()
                    expectTypeOf(wdioExpect.soft(chainableElement).toBeCustomPromise(
                        wdioExpect.toBeCustomPromise(chainableElement)
                    )).not.toEqualTypeOf<void>()
                })
            })

            describe('wdioExpect.getSoftFailures', () => {
                it('should be of type `SoftFailure`', async () => {
                    const expectSoftFailure1: ExpectWebdriverIO.SoftFailure[] = wdioExpect.getSoftFailures()

                    expectTypeOf(wdioExpect.getSoftFailures()).not.toEqualTypeOf<void>()
                })
            })

            describe('wdioExpect.assertSoftFailures', () => {
                it('should be of type void', async () => {
                    expectTypeOf(wdioExpect.assertSoftFailures()).toEqualTypeOf<void>()

                    expectTypeOf(wdioExpect.assertSoftFailures()).not.toEqualTypeOf<Promise<void>>()
                })
            })

            describe('wdioExpect.clearSoftFailures', () => {
                it('should be of type void', async () => {
                    expectTypeOf(wdioExpect.clearSoftFailures()).toEqualTypeOf<void>()

                    expectTypeOf(wdioExpect.clearSoftFailures()).not.toEqualTypeOf<Promise<void>>()
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
            expectAsync(string).toEqual(wdioExpect.stringContaining('WebdriverIO'))
            expectAsync(array).toEqual(wdioExpect.arrayContaining(['WebdriverIO', 'Test']))
            expectAsync(object).toEqual(wdioExpect.objectContaining({ name: 'WebdriverIO' }))
            // This one is tested and is working correctly, surprisingly!
            expectAsync(number).toEqual(wdioExpect.closeTo(1.0001, 0.0001))
            // New from jest 30, should work!
            expectAsync(['apple', 'banana', 'cherry']).toEqual(wdioExpect.arrayOf(wdioExpect.any(String)))
        })
    })

    describe('Jasmine only cases', () => {
        let expectPromiseLikeVoid: PromiseLike<void>
        it('should support expectAsync correctly for non wdio types', async () => {
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).toBeResolved()
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).toBeResolvedTo(wdioExpect.stringContaining('test error'))
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).not.toBeResolvedTo(wdioExpect.not.stringContaining('test error'))
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).toBeRejected()
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).not.toBeResolved()
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).not.toBeRejected()

            expectTypeOf(expectAsync(Promise.resolve('test')).toBeResolved()).not.toEqualTypeOf<void>()
            expectTypeOf(expectAsync(Promise.resolve('test')).toBeRejected()).not.toEqualTypeOf<void>()

            expectTypeOf(expectAsync(Promise.resolve('test')).toBeResolved()).not.toEqualTypeOf<void>()
        })
        it('jasmine special asymmetric matcher', async () => {
            // Note: Even though the below is valid syntax, jasmine prefix for asymmetric matchers is not supported by wdioExpect.
            expectAsync({}).toEqual(jasmine.any(Object))
            expectAsync(12).toEqual(jasmine.any(Number))
        })

    })
})
