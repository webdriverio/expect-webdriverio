/* eslint-disable @typescript-eslint/no-unused-vars */

// Desired since we do not want to overwrite the global `expect` from Jasmine
import { expect as wdioExpect } from 'expect-webdriverio'
describe('type assertions', () => {
    const chainableElement = {} as unknown as ChainablePromiseElement
    const chainableArray = {} as ChainablePromiseArray

    const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
    const elementArray: WebdriverIO.ElementArray = [] as unknown as WebdriverIO.ElementArray

    const networkMock: WebdriverIO.Mock = {} as unknown as WebdriverIO.Mock

    // Type assertions
    let expectPromiseVoid: Promise<void>
    let expectVoid: void

    describe('Browser', () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser

        describe('toHaveUrl', () => {
            it('should be supported correctly', async () => {
                expectPromiseVoid = wdioExpect(browser).toHaveUrl('https://example.com')
                expectPromiseVoid = wdioExpect(browser).not.toHaveUrl('https://example.com')

                // Asymmetric matchers
                expectPromiseVoid = wdioExpect(browser).toHaveUrl(wdioExpect.stringContaining('WebdriverIO'))
                expectPromiseVoid = wdioExpect(browser).toHaveUrl(wdioExpect.not.stringContaining('WebdriverIO'))
                expectPromiseVoid = wdioExpect(browser).toHaveUrl(wdioExpect.any(String))
                expectPromiseVoid = wdioExpect(browser).toHaveUrl(wdioExpect.anything())

                // @ts-expect-error
                expectVoid = wdioExpect(browser).toHaveUrl('https://example.com')
                // @ts-expect-error
                expectVoid = wdioExpect(browser).not.toHaveUrl('https://example.com')
                // @ts-expect-error
                expectVoid = wdioExpect(browser).toHaveUrl(wdioExpect.stringContaining('WebdriverIO'))

                // @ts-expect-error
                await wdioExpect(browser).toHaveUrl(6)
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                // @ts-expect-error
                await wdioExpect(element).toHaveUrl('https://example.com')
                // @ts-expect-error
                await wdioExpect(element).not.toHaveUrl('https://example.com')
                // @ts-expect-error
                await wdioExpect(true).toHaveUrl('https://example.com')
                // @ts-expect-error
                await wdioExpect(true).not.toHaveUrl('https://example.com')
            })
        })

        describe('toHaveTitle', () => {
            it('should be supported correctly', async () => {
                expectPromiseVoid = wdioExpect(browser).toHaveTitle('https://example.com')
                expectPromiseVoid = wdioExpect(browser).not.toHaveTitle('https://example.com')

                // Asymmetric matchers
                expectPromiseVoid = wdioExpect(browser).toHaveTitle(wdioExpect.stringContaining('WebdriverIO'))
                expectPromiseVoid = wdioExpect(browser).toHaveTitle(wdioExpect.any(String))
                expectPromiseVoid = wdioExpect(browser).toHaveTitle(wdioExpect.anything())

                // @ts-expect-error
                expectVoid = wdioExpect(browser).toHaveTitle('https://example.com')
                // @ts-expect-error
                expectVoid = wdioExpect(browser).not.toHaveTitle('https://example.com')
                // @ts-expect-error
                expectVoid = wdioExpect(browser).toHaveTitle(wdioExpect.stringContaining('WebdriverIO'))
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                // @ts-expect-error
                await wdioExpect(element).toHaveTitle('https://example.com')
                // @ts-expect-error
                await wdioExpect(element).not.toHaveTitle('https://example.com')
                // @ts-expect-error
                await wdioExpect(true).toHaveTitle('https://example.com')
                // @ts-expect-error
                await wdioExpect(true).not.toHaveTitle('https://example.com')
            })
        })
    })

    describe('element', () => {

        describe('toBeDisabled', () => {
            it('should be supported correctly', async () => {
                // Element
                expectPromiseVoid = wdioExpect(element).toBeDisabled()
                expectPromiseVoid = wdioExpect(element).not.toBeDisabled()

                // Element array
                expectPromiseVoid = wdioExpect(elementArray).toBeDisabled()
                expectPromiseVoid = wdioExpect(elementArray).not.toBeDisabled()

                // Chainable element
                expectPromiseVoid = wdioExpect(chainableElement).toBeDisabled()
                expectPromiseVoid = wdioExpect(chainableElement).not.toBeDisabled()

                // Chainable element array
                expectPromiseVoid = wdioExpect(chainableArray).toBeDisabled()
                expectPromiseVoid = wdioExpect(chainableArray).not.toBeDisabled()

                // @ts-expect-error
                expectVoid = wdioExpect(element).toBeDisabled()
                // @ts-expect-error
                expectVoid = wdioExpect(element).not.toBeDisabled()
            })

            it('should have ts errors when actual is not an element', async () => {
                // @ts-expect-error
                await wdioExpect(browser).toBeDisabled()
                // @ts-expect-error
                await wdioExpect(browser).not.toBeDisabled()
                // @ts-expect-error
                await wdioExpect(true).toBeDisabled()
                // @ts-expect-error
                await wdioExpect(true).not.toBeDisabled()
            })
        })

        describe('toHaveText', () => {
            it('should be supported correctly', async () => {
                expectPromiseVoid = wdioExpect(element).toHaveText('text')
                expectPromiseVoid = wdioExpect(element).toHaveText(/text/)
                expectPromiseVoid = wdioExpect(element).toHaveText(['text1', 'text2'])
                expectPromiseVoid = wdioExpect(element).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])
                expectPromiseVoid = wdioExpect(element).toHaveText([/text1/, /text2/])
                expectPromiseVoid = wdioExpect(element).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])
                await wdioExpect(element).toHaveText(
                    'My-Ex-Am-Ple',
                    {
                        replace: [[/-/g, ' '], [/[A-Z]+/g, (match: string) => match.toLowerCase()]]
                    }
                )

                expectPromiseVoid = wdioExpect(element).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = wdioExpect(element).toHaveText('text')
                // @ts-expect-error
                await wdioExpect(element).toHaveText(6)

                expectPromiseVoid = wdioExpect(chainableElement).toHaveText('text')
                expectPromiseVoid = wdioExpect(chainableElement).toHaveText(/text/)
                expectPromiseVoid = wdioExpect(chainableElement).toHaveText(['text1', 'text2'])
                expectPromiseVoid = wdioExpect(chainableElement).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])
                expectPromiseVoid = wdioExpect(chainableElement).toHaveText([/text1/, /text2/])
                expectPromiseVoid = wdioExpect(chainableElement).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])

                expectPromiseVoid = wdioExpect(chainableElement).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = wdioExpect(chainableElement).toHaveText('text')
                // @ts-expect-error
                await wdioExpect(chainableElement).toHaveText(6)

                expectPromiseVoid = wdioExpect(elementArray).toHaveText('text')
                expectPromiseVoid = wdioExpect(elementArray).toHaveText(/text/)
                expectPromiseVoid = wdioExpect(elementArray).toHaveText(['text1', 'text2'])
                expectPromiseVoid = wdioExpect(elementArray).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])
                expectPromiseVoid = wdioExpect(elementArray).toHaveText([/text1/, /text2/])
                expectPromiseVoid = wdioExpect(elementArray).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])

                expectPromiseVoid = wdioExpect(elementArray).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = wdioExpect(elementArray).toHaveText('text')
                // @ts-expect-error
                await wdioExpect(elementArray).toHaveText(6)

                expectPromiseVoid = wdioExpect(chainableArray).toHaveText('text')
                expectPromiseVoid = wdioExpect(chainableArray).toHaveText(/text/)
                expectPromiseVoid = wdioExpect(chainableArray).toHaveText(['text1', 'text2'])
                expectPromiseVoid = wdioExpect(chainableArray).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])
                expectPromiseVoid = wdioExpect(chainableArray).toHaveText([/text1/, /text2/])
                expectPromiseVoid = wdioExpect(chainableArray).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])

                expectPromiseVoid = wdioExpect(chainableArray).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = wdioExpect(chainableArray).toHaveText('text')
                // @ts-expect-error
                await wdioExpect(chainableArray).toHaveText(6)

                // @ts-expect-error
                await wdioExpect(browser).toHaveText('text')
            })

            it('should have ts errors when actual is not an element', async () => {
                // @ts-expect-error
                await wdioExpect(browser).toHaveText('text')
                // @ts-expect-error
                await wdioExpect(browser).not.toHaveText('text')
                // @ts-expect-error
                await wdioExpect(true).toHaveText('text')
                // @ts-expect-error
                await wdioExpect(true).toHaveText('text')
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                // @ts-expect-error
                await wdioExpect('text').toHaveText('text')
                // @ts-expect-error
                await wdioExpect('text').not.toHaveText('text')
                // @ts-expect-error
                await wdioExpect(Promise.resolve('text')).toHaveText('text')
                // @ts-expect-error
                await wdioExpect(Promise.resolve('text')).toHaveText('text')
            })
        })

        describe('toHaveHeight', () => {
            it('should be supported correctly', async () => {
                expectPromiseVoid = wdioExpect(element).toHaveHeight(100)
                expectPromiseVoid = wdioExpect(element).toHaveHeight(100, { message: 'Custom error message' })
                expectPromiseVoid = wdioExpect(element).not.toHaveHeight(100)
                expectPromiseVoid = wdioExpect(element).not.toHaveHeight(100, { message: 'Custom error message' })

                expectPromiseVoid = wdioExpect(element).toHaveHeight({ width: 100, height: 200 })
                expectPromiseVoid = wdioExpect(element).toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })
                expectPromiseVoid = wdioExpect(element).not.toHaveHeight({ width: 100, height: 200 })
                expectPromiseVoid = wdioExpect(element).not.toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })

                // @ts-expect-error
                expectVoid = wdioExpect(element).toHaveHeight(100)
                // @ts-expect-error
                expectVoid = wdioExpect(element).not.toHaveHeight(100)

                // @ts-expect-error
                expectVoid = wdioExpect(element).toHaveHeight({ width: 100, height: 200 })
                // @ts-expect-error
                expectVoid = wdioExpect(element).not.toHaveHeight({ width: 100, height: 200 })

                // @ts-expect-error
                await wdioExpect(browser).toHaveHeight(100)
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                // @ts-expect-error
                await wdioExpect('text').toHaveText('text')
                // @ts-expect-error
                await wdioExpect('text').not.toHaveText('text')
                // @ts-expect-error
                await wdioExpect(Promise.resolve('text')).toHaveText('text')
                // @ts-expect-error
                await wdioExpect(Promise.resolve('text')).toHaveText('text')
            })
        })

        describe('toMatchSnapshot', () => {

            it('should be supported correctly', async () => {
                expectVoid = wdioExpect(element).toMatchSnapshot()
                expectVoid = wdioExpect(element).toMatchSnapshot('test label')
                expectVoid = wdioExpect(element).not.toMatchSnapshot('test label')

                expectPromiseVoid = wdioExpect(chainableElement).toMatchSnapshot()
                expectPromiseVoid = wdioExpect(chainableElement).toMatchSnapshot('test label')
                expectPromiseVoid = wdioExpect(chainableElement).not.toMatchSnapshot('test label')

                //@ts-expect-error
                expectPromiseVoid = wdioExpect(element).toMatchSnapshot()
                //@ts-expect-error
                expectPromiseVoid = wdioExpect(element).not.toMatchSnapshot()
                //@ts-expect-error
                expectVoid = wdioExpect(chainableElement).toMatchSnapshot()
                //@ts-expect-error
                expectVoid = wdioExpect(chainableElement).not.toMatchSnapshot()
            })
        })

        describe('toMatchInlineSnapshot', () => {

            it('should be correctly supported', async () => {
                expectVoid = wdioExpect(element).toMatchInlineSnapshot()
                expectVoid = wdioExpect(element).toMatchInlineSnapshot('test snapshot')
                expectVoid = wdioExpect(element).toMatchInlineSnapshot('test snapshot', 'test label')

                expectPromiseVoid = wdioExpect(chainableElement).toMatchInlineSnapshot()
                expectPromiseVoid = wdioExpect(chainableElement).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = wdioExpect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')

                //@ts-expect-error
                expectPromiseVoid = wdioExpect(element).toMatchInlineSnapshot()
                //@ts-expect-error
                expectVoid = wdioExpect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')
            })

            it('should be correctly supported with getCSSProperty()', async () => {
                expectPromiseVoid = wdioExpect(element.getCSSProperty('test')).toMatchInlineSnapshot()
                expectPromiseVoid = wdioExpect(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = wdioExpect(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')

                expectPromiseVoid = wdioExpect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot()
                expectPromiseVoid = wdioExpect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = wdioExpect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')

                //@ts-expect-error
                expectPromiseVoid = wdioExpect(element).toMatchInlineSnapshot()
                //@ts-expect-error
                expectVoid = wdioExpect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')
            })
        })

        describe('toBeElementsArrayOfSize', async () => {

            it('should work correctly when actual is chainableArray', async () => {
                expectPromiseVoid = wdioExpect(chainableArray).toBeElementsArrayOfSize(5)
                expectPromiseVoid = wdioExpect(chainableArray).toBeElementsArrayOfSize({ lte: 10 })

                // @ts-expect-error
                expectVoid = wdioExpect(chainableArray).toBeElementsArrayOfSize(5)
                // @ts-expect-error
                expectVoid = wdioExpect(chainableArray).toBeElementsArrayOfSize({ lte: 10 })
            })

            it('should not work when actual is not chainableArray', async () => {
            // @ts-expect-error
                await wdioExpect(chainableElement).toBeElementsArrayOfSize(5)
                // @ts-expect-error
                await wdioExpect(chainableElement).toBeElementsArrayOfSize({ lte: 10 })
                // @ts-expect-error
                await wdioExpect(true).toBeElementsArrayOfSize(5)
                // @ts-expect-error
                await wdioExpect(true).toBeElementsArrayOfSize({ lte: 10 })
            })
        })
    })

    describe('Custom matchers', () => {
        describe('using `ExpectWebdriverIO` namespace augmentation', () => {
            it('should supported correctly a non-promise custom matcher', async () => {
                expectVoid = wdioExpect('test').toBeCustom()
                expectVoid = wdioExpect('test').not.toBeCustom()

                // @ts-expect-error
                expectPromiseVoid = wdioExpect('test').toBeCustom()
                // @ts-expect-error
                expectPromiseVoid = wdioExpect('test').not.toBeCustom()

                expectVoid = wdioExpect(1).toBeWithinRange(0, 2)
            })

            it('should supported correctly a promise custom matcher with only chainableElement as actual', async () => {
                expectPromiseVoid = wdioExpect(chainableElement).toBeCustomPromise()
                expectPromiseVoid = wdioExpect(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('test'))
                expectPromiseVoid = wdioExpect(chainableElement).not.toBeCustomPromise(wdioExpect.not.stringContaining('test'))

                // @ts-expect-error
                wdioExpect('test').toBeCustomPromise()
                // @ts-expect-error
                expectVoid = wdioExpect(chainableElement).toBeCustomPromise()
                // @ts-expect-error
                expectVoid = wdioExpect(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('test'))
                // @ts-expect-error
                expectVoid = wdioExpect(chainableElement).not.toBeCustomPromise(wdioExpect.stringContaining('test'))
                // @ts-expect-error
                wdioExpect(chainableElement).toBeCustomPromise(wdioExpect.stringContaining(6))
            })

            it('should support custom asymmetric matcher', async () => {
                const expectString1 : ExpectWebdriverIO.PartialMatcher<string> = wdioExpect.toBeCustom()
                const expectString2 : ExpectWebdriverIO.PartialMatcher<string> = wdioExpect.not.toBeCustom()

                expectPromiseVoid = wdioExpect(chainableElement).toBeCustomPromise(wdioExpect.toBeCustom())

                // @ts-expect-error
                expectPromiseVoid = wdioExpect.toBeCustom()
                // @ts-expect-error
                expectPromiseVoid = wdioExpect.not.toBeCustom()

                //@ts-expect-error
                expectVoid = wdioExpect(chainableElement).toBeCustomPromise(wdioExpect.toBeCustom())
            })
        })

        describe('using `expect` module declaration', () => {

            it('should support a simple matcher', async () => {
                expectVoid = wdioExpect(5).toBeWithinRange(1, 10)

                // Or as an asymmetric matcher:
                expectVoid = wdioExpect({ value: 5 }).toEqual({
                    value: wdioExpect.toBeWithinRange(1, 10)
                })

                // @ts-expect-error
                expectVoid = wdioExpect(5).toBeWithinRange(1, '10')
                // @ts-expect-error
                expectPromiseVoid = wdioExpect(5).toBeWithinRange('1')
            })

            it('should support a simple custom matcher with a chainable element matcher with promise', async () => {
                expectPromiseVoid = wdioExpect(chainableElement).toHaveSimpleCustomProperty('text')
                expectPromiseVoid = wdioExpect(chainableElement).toHaveSimpleCustomProperty(wdioExpect.stringContaining('text'))
                expectPromiseVoid = wdioExpect(chainableElement).not.toHaveSimpleCustomProperty(wdioExpect.not.stringContaining('text'))

                // Or as a custom asymmetric matcher:
                expectPromiseVoid = wdioExpect(chainableElement).toHaveSimpleCustomProperty(
                    wdioExpect.toHaveSimpleCustomProperty('string')
                )
                const expectString1:string = wdioExpect.toHaveSimpleCustomProperty('string')
                const expectString2:string = wdioExpect.not.toHaveSimpleCustomProperty('string')

                // @ts-expect-error
                expectVoid = wdioExpect.toHaveSimpleCustomProperty(chainableElement)
                // @ts-expect-error
                expectVoid = wdioExpect.not.toHaveSimpleCustomProperty(chainableElement)

                // @ts-expect-error
                expectVoid = wdioExpect.toHaveSimpleCustomProperty(chainableElement)
            })

            it('should support a chainable element matcher with promise', async () => {
                expectPromiseVoid = wdioExpect(chainableElement).toHaveCustomProperty('text')
                expectPromiseVoid = wdioExpect(chainableElement).toHaveCustomProperty(wdioExpect.stringContaining('text'))
                expectPromiseVoid = wdioExpect(chainableElement).not.toHaveCustomProperty(wdioExpect.not.stringContaining('text'))

                // Or as a custom asymmetric matcher:
                expectPromiseVoid = wdioExpect(chainableElement).toHaveCustomProperty(
                    await wdioExpect.toHaveCustomProperty(chainableElement)
                )
                const expectPromiseWdioElement1: Promise<ExpectWebdriverIO.PartialMatcher<string>> = wdioExpect.toHaveCustomProperty(chainableElement)
                const expectPromiseWdioElement2: Promise<ExpectWebdriverIO.PartialMatcher<string>> = wdioExpect.not.toHaveCustomProperty(chainableElement)

                // @ts-expect-error
                expectVoid = wdioExpect.toHaveCustomProperty(chainableElement)
                // @ts-expect-error
                expectVoid = wdioExpect.not.toHaveCustomProperty(chainableElement)

                // @ts-expect-error
                expectVoid = wdioExpect.toHaveCustomProperty(chainableElement)
                // @ts-expect-error
                wdioExpect.toHaveCustomProperty('test')

                await wdioExpect(chainableElement).toHaveCustomProperty(
                    await wdioExpect.toHaveCustomProperty(chainableElement)
                )
            })
        })
    })

    describe('toBe', () => {

        it('should expect void type when actual is a boolean', async () => {
            expectVoid = wdioExpect(true).toBe(true)
            expectVoid = wdioExpect(true).not.toBe(true)

            //@ts-expect-error
            expectPromiseVoid = wdioExpect(true).toBe(true)
            //@ts-expect-error
            expectPromiseVoid = wdioExpect(true).not.toBe(true)
        })

        it('should not expect Promise when actual is a chainable since toBe does not need to be awaited', async () => {
            expectVoid = wdioExpect(chainableElement).toBe(true)
            expectVoid = wdioExpect(chainableElement).not.toBe(true)

            //@ts-expect-error
            expectPromiseVoid = wdioExpect(chainableElement).toBe(true)
            //@ts-expect-error
            expectPromiseVoid = wdioExpect(chainableElement).not.toBe(true)
        })

        it('should still expect void type when actual is a Promise since we do not overload them', async () => {
            const promiseBoolean = Promise.resolve(true)

            // TODO dprevost verify which typing apply here, is it the expectLib or the force expectAsync of wdio/jasmine-framework?
            // expectPromiseVoid = wdioExpect(promiseBoolean).toBe(true)
            // expectPromiseVoid = wdioExpect(promiseBoolean).not.toBe(true)

            // //@ts-expect-error
            // expectVoid = wdioExpect(promiseBoolean).toBe(true)
            // //@ts-expect-error
            // expectVoid = wdioExpect(promiseBoolean).toBe(true)
        })

        it('should work with string', async () => {
            expectVoid = wdioExpect('text').toBe(true)
            expectVoid = wdioExpect('text').not.toBe(true)
            expectVoid = wdioExpect('text').toBe(wdioExpect.stringContaining('text'))
            expectVoid = wdioExpect('text').not.toBe(wdioExpect.stringContaining('text'))

            //@ts-expect-error
            expectPromiseVoid = wdioExpect('text').toBe(true)
            //@ts-expect-error
            expectPromiseVoid = wdioExpect('text').not.toBe(true)
            //@ts-expect-error
            expectPromiseVoid = wdioExpect('text').toBe(wdioExpect.stringContaining('text'))
            //@ts-expect-error
            expectPromiseVoid = wdioExpect('text').not.toBe(wdioExpect.stringContaining('text'))
        })
    })

    describe('Promise type assertions', () => {
        const booleanPromise: Promise<boolean> = Promise.resolve(true)

        it('should work with resolves & rejects correctly', async () => {
            expectPromiseVoid = wdioExpect(booleanPromise).resolves.toBe(true)
            expectPromiseVoid = wdioExpect(booleanPromise).rejects.toBe(true)

            //@ts-expect-error
            expectVoid = wdioExpect(booleanPromise).resolves.toBe(true)
            //@ts-expect-error
            expectVoid = wdioExpect(booleanPromise).rejects.toBe(true)

        })

        it('should not support chainable and expect PromiseVoid with toBe', async () => {
            //@ts-expect-error
            expectPromiseVoid = wdioExpect(chainableElement).toBe(true)
            //@ts-expect-error
            expectPromiseVoid = wdioExpect(chainableElement).not.toBe(true)
        })
    })

    describe('Network Matchers', () => {
        const promiseNetworkMock = Promise.resolve(networkMock)

        it('should not have ts errors when typing to Promise', async () => {
            expectPromiseVoid = wdioExpect(promiseNetworkMock).toBeRequested()
            expectPromiseVoid = wdioExpect(promiseNetworkMock).toBeRequestedTimes(2)
            expectPromiseVoid = wdioExpect(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 })

            expectPromiseVoid = wdioExpect(promiseNetworkMock).not.toBeRequested()
            expectPromiseVoid = wdioExpect(promiseNetworkMock).not.toBeRequestedTimes(2)
            expectPromiseVoid = wdioExpect(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 })

            expectPromiseVoid = wdioExpect(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api',
                method: 'POST',
                statusCode: 200,
                requestHeaders: { Authorization: 'foo' },
                responseHeaders: { Authorization: 'bar' },
                postData: { title: 'foo', description: 'bar' },
                response: { success: true },
            })

            expectPromiseVoid = wdioExpect(promiseNetworkMock).toBeRequestedWith({
                url: wdioExpect.stringContaining('test'),
                method: 'POST',
                statusCode: 200,
                requestHeaders: wdioExpect.objectContaining({ Authorization: 'foo' }),
                responseHeaders: wdioExpect.objectContaining({ Authorization: 'bar' }),
                postData: wdioExpect.objectContaining({ title: 'foo', description: 'bar' }),
                response: wdioExpect.objectContaining({ success: true }),
            })

            expectPromiseVoid = wdioExpect(promiseNetworkMock).toBeRequestedWith({
                url: wdioExpect.stringMatching(/.*\/api\/.*/i),
                method: ['POST', 'PUT'],
                statusCode: [401, 403],
                requestHeaders: headers => headers.Authorization.startsWith('Bearer '),
                postData: wdioExpect.objectContaining({ released: true, title: wdioExpect.stringContaining('foobar') }),
                response: (r: { data: { items: unknown[] } }) => Array.isArray(r) && r.data.items.length === 20
            })
        })

        it('should have ts errors when typing to void', async () => {
            // @ts-expect-error
            expectVoid = wdioExpect(promiseNetworkMock).toBeRequested()
            // @ts-expect-error
            expectVoid = wdioExpect(promiseNetworkMock).toBeRequestedTimes(2) // await wdioExpect(mock).toBeRequestedTimes({ eq: 2 })
            // @ts-expect-error
            expectVoid = wdioExpect(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11

            // @ts-expect-error
            expectVoid = wdioExpect(promiseNetworkMock).not.toBeRequested()
            // @ts-expect-error
            expectVoid = wdioExpect(promiseNetworkMock).not.toBeRequestedTimes(2) // await wdioExpect(mock).toBeRequestedTimes({ eq: 2 })
            // @ts-expect-error
            expectVoid = wdioExpect(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11

            // @ts-expect-error
            expectVoid = wdioExpect(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api',
                method: 'POST',
                statusCode: 200,
                requestHeaders: { Authorization: 'foo' },
                responseHeaders: { Authorization: 'bar' },
                postData: { title: 'foo', description: 'bar' },
                response: { success: true },
            })

            // @ts-expect-error
            expectVoid = wdioExpect(promiseNetworkMock).toBeRequestedWith(wdioExpect.objectContaining({
                response: { success: true },
            }))
        })
    })

    describe('Expect', () => {
        it('should have ts errors when using a non existing wdioExpect.function', async () => {
            // @ts-expect-error
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
                    expectVoid = wdioExpect.soft(actualString).toBe('Test Page')
                    expectVoid = wdioExpect.soft(actualString).not.toBe('Test Page')
                    expectVoid = wdioExpect.soft(actualString).not.toBe(wdioExpect.stringContaining('Test Page'))

                    // @ts-expect-error
                    expectPromiseVoid = wdioExpect.soft(actualString).toBe('Test Page')
                    // @ts-expect-error
                    expectPromiseVoid = wdioExpect.soft(actualString).not.toBe('Test Page')
                    // @ts-expect-error
                    expectPromiseVoid = wdioExpect.soft(actualString).not.toBe(wdioExpect.stringContaining('Test Page'))
                })

                it('should need to be awaited/be a promise if actual is promise type', async () => {
                    const expectWdioMatcher1: ExpectWebdriverIO.MatchersAndInverse<Promise<void>, Promise<string>> = wdioExpect.soft(actualPromiseString)
                    expectPromiseVoid = wdioExpect.soft(actualPromiseString).toBe('Test Page')
                    expectPromiseVoid = wdioExpect.soft(actualPromiseString).not.toBe('Test Page')
                    expectPromiseVoid = wdioExpect.soft(actualPromiseString).not.toBe(wdioExpect.stringContaining('Test Page'))

                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(actualPromiseString).toBe('Test Page')
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(actualPromiseString).not.toBe('Test Page')
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(actualPromiseString).not.toBe(wdioExpect.stringContaining('Test Page'))
                })

                it('should support chainable element', async () => {
                    const expectElement: ExpectWebdriverIO.MatchersAndInverse<void, WebdriverIO.Element> = wdioExpect.soft(element)
                    const expectElementChainable: ExpectWebdriverIO.MatchersAndInverse<void, typeof chainableElement> = wdioExpect.soft(chainableElement)

                    // @ts-expect-error
                    const expectElement2: ExpectWebdriverIO.MatchersAndInverse<Promise<void>, WebdriverIO.Element> = wdioExpect.soft(element)
                    // @ts-expect-error
                    const expectElementChainable2: ExpectWebdriverIO.MatchersAndInverse<Promise<void>, typeof chainableElement> = wdioExpect.soft(chainableElement)
                })

                it('should support chainable element with wdio Matchers', async () => {
                    expectPromiseVoid = wdioExpect.soft(element).toBeDisplayed()
                    expectPromiseVoid = wdioExpect.soft(chainableElement).toBeDisplayed()
                    expectPromiseVoid = wdioExpect.soft(chainableArray).toBeDisplayed()
                    await wdioExpect.soft(element).toBeDisplayed()
                    await wdioExpect.soft(chainableElement).toBeDisplayed()
                    await wdioExpect.soft(chainableArray).toBeDisplayed()

                    expectPromiseVoid = wdioExpect.soft(element).not.toBeDisplayed()
                    expectPromiseVoid = wdioExpect.soft(chainableElement).not.toBeDisplayed()
                    expectPromiseVoid = wdioExpect.soft(chainableArray).not.toBeDisplayed()
                    await wdioExpect.soft(element).not.toBeDisplayed()
                    await wdioExpect.soft(chainableElement).not.toBeDisplayed()
                    await wdioExpect.soft(chainableArray).not.toBeDisplayed()

                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(element).toBeDisplayed()
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toBeDisplayed()
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableArray).toBeDisplayed()

                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(element).not.toBeDisplayed()
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).not.toBeDisplayed()
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableArray).not.toBeDisplayed()
                })

                it('should work with custom matcher and custom asymmetric matchers from `expect` module', async () => {
                    expectPromiseVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty('text')
                    expectPromiseVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty(wdioExpect.stringContaining('text'))
                    expectPromiseVoid = wdioExpect.soft(chainableElement).not.toHaveCustomProperty(wdioExpect.not.stringContaining('text'))
                    expectPromiseVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty(
                        wdioExpect.toHaveCustomProperty(chainableElement)
                    )

                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty('text')
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty(wdioExpect.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).not.toHaveCustomProperty(wdioExpect.not.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty(
                        wdioExpect.toHaveCustomProperty(chainableElement)
                    )

                    expectPromiseVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty('text')
                    expectPromiseVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty(wdioExpect.stringContaining('text'))
                    expectPromiseVoid = wdioExpect.soft(chainableElement).not.toHaveCustomProperty(wdioExpect.not.stringContaining('text'))
                    expectPromiseVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty(
                        wdioExpect.toHaveCustomProperty(chainableElement)
                    )

                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty('text')
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty(wdioExpect.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).not.toHaveCustomProperty(wdioExpect.not.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toHaveCustomProperty(
                        wdioExpect.toHaveCustomProperty(chainableElement)
                    )
                })

                it('should work with custom matcher and custom asymmetric matchers from `ExpectWebDriverIO` namespace', async () => {
                    expectPromiseVoid = wdioExpect.soft(chainableElement).toBeCustomPromise('text')
                    expectPromiseVoid = wdioExpect.soft(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('text'))
                    expectPromiseVoid = wdioExpect.soft(chainableElement).not.toBeCustomPromise(wdioExpect.not.stringContaining('text'))
                    expectPromiseVoid = wdioExpect.soft(chainableElement).toBeCustomPromise(
                        wdioExpect.toBeCustomPromise(chainableElement)
                    )

                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toBeCustomPromise('text')
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).not.toBeCustomPromise(wdioExpect.not.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toBeCustomPromise(
                        wdioExpect.toBeCustomPromise(chainableElement)
                    )

                    expectPromiseVoid = wdioExpect.soft(chainableElement).toBeCustomPromise('text')
                    expectPromiseVoid = wdioExpect.soft(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('text'))
                    expectPromiseVoid = wdioExpect.soft(chainableElement).not.toBeCustomPromise(wdioExpect.not.stringContaining('text'))
                    expectPromiseVoid = wdioExpect.soft(chainableElement).toBeCustomPromise(
                        wdioExpect.toBeCustomPromise(chainableElement)
                    )

                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toBeCustomPromise('text')
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).not.toBeCustomPromise(wdioExpect.not.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = wdioExpect.soft(chainableElement).toBeCustomPromise(
                        wdioExpect.toBeCustomPromise(chainableElement)
                    )
                })
            })

            describe('wdioExpect.getSoftFailures', () => {
                it('should be of type `SoftFailure`', async () => {
                    const expectSoftFailure1: ExpectWebdriverIO.SoftFailure[] = wdioExpect.getSoftFailures()

                    // @ts-expect-error
                    expectVoid = wdioExpect.getSoftFailures()
                })
            })

            describe('wdioExpect.assertSoftFailures', () => {
                it('should be of type void', async () => {
                    expectVoid = wdioExpect.assertSoftFailures()

                    // @ts-expect-error
                    expectPromiseVoid = wdioExpect.assertSoftFailures()
                })
            })

            describe('wdioExpect.clearSoftFailures', () => {
                it('should be of type void', async () => {
                    expectVoid = wdioExpect.clearSoftFailures()

                    // @ts-expect-error
                    expectPromiseVoid = wdioExpect.clearSoftFailures()
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
            wdioExpect(string).toEqual(wdioExpect.stringContaining('WebdriverIO'))
            wdioExpect(array).toEqual(wdioExpect.arrayContaining(['WebdriverIO', 'Test']))
            wdioExpect(object).toEqual(wdioExpect.objectContaining({ name: 'WebdriverIO' }))
            wdioExpect(number).toEqual(wdioExpect.closeTo(1.0001, 0.0001))
            wdioExpect(['apple', 'banana', 'cherry']).toEqual(wdioExpect.arrayOf(wdioExpect.any(String)))
        })
    })

    describe('Jasmine only cases', () => {
        let expectPromiseLikeVoid: PromiseLike<void>

        it('should not overwrite the jasmine global expect', async () => {
            const expectVoid: jasmine.ArrayLikeMatchers<string> = expect('test')
        })
        it('should support expectAsync correctly for non wdio types', async () => {
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).toBeResolved()
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).toBeResolvedTo(wdioExpect.stringContaining('test error'))
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).not.toBeResolvedTo(wdioExpect.not.stringContaining('test error'))
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).toBeRejected()
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).not.toBeResolved()
            expectPromiseLikeVoid = expectAsync(Promise.resolve('test')).not.toBeRejected()
        })
    })
})
