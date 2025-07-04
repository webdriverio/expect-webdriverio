/* eslint-disable @typescript-eslint/no-unused-vars */
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
    let expectPromiseUnknown: Promise<unknown>

    describe('Browser', () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser

        describe('toHaveUrl', () => {
            it('should be supported correctly', async () => {
                expectPromiseVoid = expectAsync(browser).toHaveUrl('https://example.com')
                expectPromiseVoid = expectAsync(browser).not.toHaveUrl('https://example.com')

                // Asymmetric matchers
                expectPromiseVoid = expectAsync(browser).toHaveUrl(wdioExpect.stringContaining('WebdriverIO'))
                expectPromiseVoid = expectAsync(browser).toHaveUrl(wdioExpect.not.stringContaining('WebdriverIO'))
                expectPromiseVoid = expectAsync(browser).toHaveUrl(wdioExpect.any(String))
                expectPromiseVoid = expectAsync(browser).toHaveUrl(wdioExpect.anything())

                // @ts-expect-error
                expectVoid = expectAsync(browser).toHaveUrl('https://example.com')
                // @ts-expect-error
                expectVoid = expectAsync(browser).not.toHaveUrl('https://example.com')
                // @ts-expect-error
                expectVoid = expectAsync(browser).toHaveUrl(wdioExpect.stringContaining('WebdriverIO'))

                // @ts-expect-error
                await expectAsync(browser).toHaveUrl(6)
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                // @ts-expect-error
                await expectAsync(element).toHaveUrl('https://example.com')
                // @ts-expect-error
                await expectAsync(element).not.toHaveUrl('https://example.com')
                // @ts-expect-error
                await expectAsync(true).toHaveUrl('https://example.com')
                // @ts-expect-error
                await expectAsync(true).not.toHaveUrl('https://example.com')
            })
        })

        describe('toHaveTitle', () => {
            it('should be supported correctly', async () => {
                const test = expectAsync('text')
                expectPromiseVoid = expectAsync(browser).toHaveTitle('https://example.com')
                expectPromiseVoid = expectAsync(browser).not.toHaveTitle('https://example.com')

                // Asymmetric matchers
                expectPromiseVoid = expectAsync(browser).toHaveTitle(wdioExpect.stringContaining('WebdriverIO'))
                expectPromiseVoid = expectAsync(browser).toHaveTitle(wdioExpect.any(String))
                expectPromiseVoid = expectAsync(browser).toHaveTitle(wdioExpect.anything())

                // @ts-expect-error
                expectVoid = expectAsync(browser).toHaveTitle('https://example.com')
                // @ts-expect-error
                expectVoid = expectAsync(browser).not.toHaveTitle('https://example.com')
                // @ts-expect-error
                expectVoid = expectAsync(browser).toHaveTitle(wdioExpect.stringContaining('WebdriverIO'))
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                // @ts-expect-error
                await expectAsync(element).toHaveTitle('https://example.com')
                // @ts-expect-error
                await expectAsync(element).not.toHaveTitle('https://example.com')
                // @ts-expect-error
                await expectAsync(true).toHaveTitle('https://example.com')
                // @ts-expect-error
                await expectAsync(true).not.toHaveTitle('https://example.com')
            })
        })
    })

    describe('element', () => {

        describe('toBeDisabled', () => {
            it('should be supported correctly', async () => {
                // Element
                expectPromiseVoid = expectAsync(element).toBeDisabled()
                expectPromiseVoid = expectAsync(element).not.toBeDisabled()

                // Element array
                expectPromiseVoid = expectAsync(elementArray).toBeDisabled()
                expectPromiseVoid = expectAsync(elementArray).not.toBeDisabled()

                // Chainable element
                expectPromiseVoid = expectAsync(chainableElement).toBeDisabled()
                expectPromiseVoid = expectAsync(chainableElement).not.toBeDisabled()

                // Chainable element array
                expectPromiseVoid = expectAsync(chainableArray).toBeDisabled()
                expectPromiseVoid = expectAsync(chainableArray).not.toBeDisabled()

                // @ts-expect-error
                expectVoid = expectAsync(element).toBeDisabled()
                // @ts-expect-error
                expectVoid = expectAsync(element).not.toBeDisabled()
            })

            it('should have ts errors when actual is not an element', async () => {
                // @ts-expect-error
                await expectAsync(browser).toBeDisabled()
                // @ts-expect-error
                await expectAsync(browser).not.toBeDisabled()
                // @ts-expect-error
                await expectAsync(true).toBeDisabled()
                // @ts-expect-error
                await expectAsync(true).not.toBeDisabled()
            })
        })

        describe('toHaveText', () => {
            it('should be supported correctly', async () => {
                expectPromiseVoid = expectAsync(element).toHaveText('text')
                expectPromiseVoid = expectAsync(element).toHaveText(/text/)
                expectPromiseVoid = expectAsync(element).toHaveText(['text1', 'text2'])
                expectPromiseVoid = expectAsync(element).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])
                expectPromiseVoid = expectAsync(element).toHaveText([/text1/, /text2/])
                expectPromiseVoid = expectAsync(element).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])
                await expectAsync(element).toHaveText(
                    'My-Ex-Am-Ple',
                    {
                        replace: [[/-/g, ' '], [/[A-Z]+/g, (match: string) => match.toLowerCase()]]
                    }
                )

                expectPromiseVoid = expectAsync(element).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = expectAsync(element).toHaveText('text')
                // @ts-expect-error
                await expectAsync(element).toHaveText(6)

                expectPromiseVoid = expectAsync(chainableElement).toHaveText('text')
                expectPromiseVoid = expectAsync(chainableElement).toHaveText(/text/)
                expectPromiseVoid = expectAsync(chainableElement).toHaveText(['text1', 'text2'])
                expectPromiseVoid = expectAsync(chainableElement).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])
                expectPromiseVoid = expectAsync(chainableElement).toHaveText([/text1/, /text2/])
                expectPromiseVoid = expectAsync(chainableElement).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])

                expectPromiseVoid = expectAsync(chainableElement).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = expectAsync(chainableElement).toHaveText('text')
                // @ts-expect-error
                await expectAsync(chainableElement).toHaveText(6)

                expectPromiseVoid = expectAsync(elementArray).toHaveText('text')
                expectPromiseVoid = expectAsync(elementArray).toHaveText(/text/)
                expectPromiseVoid = expectAsync(elementArray).toHaveText(['text1', 'text2'])
                expectPromiseVoid = expectAsync(elementArray).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])
                expectPromiseVoid = expectAsync(elementArray).toHaveText([/text1/, /text2/])
                expectPromiseVoid = expectAsync(elementArray).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])

                expectPromiseVoid = expectAsync(elementArray).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = expectAsync(elementArray).toHaveText('text')
                // @ts-expect-error
                await expectAsync(elementArray).toHaveText(6)

                expectPromiseVoid = expectAsync(chainableArray).toHaveText('text')
                expectPromiseVoid = expectAsync(chainableArray).toHaveText(/text/)
                expectPromiseVoid = expectAsync(chainableArray).toHaveText(['text1', 'text2'])
                expectPromiseVoid = expectAsync(chainableArray).toHaveText([wdioExpect.stringContaining('text1'), wdioExpect.stringContaining('text2')])
                expectPromiseVoid = expectAsync(chainableArray).toHaveText([/text1/, /text2/])
                expectPromiseVoid = expectAsync(chainableArray).toHaveText(['text1', /text1/, wdioExpect.stringContaining('text3')])

                expectPromiseVoid = expectAsync(chainableArray).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = expectAsync(chainableArray).toHaveText('text')
                // @ts-expect-error
                await expectAsync(chainableArray).toHaveText(6)

                // @ts-expect-error
                await expectAsync(browser).toHaveText('text')
            })

            it('should have ts errors when actual is not an element', async () => {
                // @ts-expect-error
                await expectAsync(browser).toHaveText('text')
                // @ts-expect-error
                await expectAsync(browser).not.toHaveText('text')
                // @ts-expect-error
                await expectAsync(true).toHaveText('text')
                // @ts-expect-error
                await expectAsync(true).toHaveText('text')
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                // @ts-expect-error
                await expectAsync('text').toHaveText('text')
                // @ts-expect-error
                await expectAsync('text').not.toHaveText('text')
                // @ts-expect-error
                await expectAsync(Promise.resolve('text')).toHaveText('text')
                // @ts-expect-error
                await expectAsync(Promise.resolve('text')).toHaveText('text')
            })
        })

        describe('toHaveHeight', () => {
            it('should be supported correctly', async () => {
                expectPromiseVoid = expectAsync(element).toHaveHeight(100)
                expectPromiseVoid = expectAsync(element).toHaveHeight(100, { message: 'Custom error message' })
                expectPromiseVoid = expectAsync(element).not.toHaveHeight(100)
                expectPromiseVoid = expectAsync(element).not.toHaveHeight(100, { message: 'Custom error message' })

                expectPromiseVoid = expectAsync(element).toHaveHeight({ width: 100, height: 200 })
                expectPromiseVoid = expectAsync(element).toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })
                expectPromiseVoid = expectAsync(element).not.toHaveHeight({ width: 100, height: 200 })
                expectPromiseVoid = expectAsync(element).not.toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })

                // @ts-expect-error
                expectVoid = expectAsync(element).toHaveHeight(100)
                // @ts-expect-error
                expectVoid = expectAsync(element).not.toHaveHeight(100)

                // @ts-expect-error
                expectVoid = expectAsync(element).toHaveHeight({ width: 100, height: 200 })
                // @ts-expect-error
                expectVoid = expectAsync(element).not.toHaveHeight({ width: 100, height: 200 })

                // @ts-expect-error
                await expectAsync(browser).toHaveHeight(100)
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                // @ts-expect-error
                await expectAsync('text').toHaveText('text')
                // @ts-expect-error
                await expectAsync('text').not.toHaveText('text')
                // @ts-expect-error
                await expectAsync(Promise.resolve('text')).toHaveText('text')
                // @ts-expect-error
                await expectAsync(Promise.resolve('text')).toHaveText('text')
            })
        })

        describe('toMatchSnapshot', () => {

            it('should be supported correctly', async () => {
                expectPromiseVoid = expectAsync(element).toMatchSnapshot()
                expectPromiseVoid = expectAsync(element).toMatchSnapshot('test label')
                expectPromiseVoid = expectAsync(element).not.toMatchSnapshot('test label')

                expectPromiseVoid = expectAsync(chainableElement).toMatchSnapshot()
                expectPromiseVoid = expectAsync(chainableElement).toMatchSnapshot('test label')
                expectPromiseVoid = expectAsync(chainableElement).not.toMatchSnapshot('test label')
            })
        })

        describe('toMatchInlineSnapshot', () => {

            it('should be correctly supported', async () => {
                expectPromiseVoid = expectAsync(element).toMatchInlineSnapshot()
                expectPromiseVoid = expectAsync(element).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = expectAsync(element).toMatchInlineSnapshot('test snapshot', 'test label')

                expectPromiseVoid = expectAsync(chainableElement).toMatchInlineSnapshot()
                expectPromiseVoid = expectAsync(chainableElement).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = expectAsync(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')

                //@ts-expect-error
                expectVoid = expectAsync(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')
            })

            it('should be correctly supported with getCSSProperty()', async () => {
                expectPromiseVoid = expectAsync(element.getCSSProperty('test')).toMatchInlineSnapshot()
                expectPromiseVoid = expectAsync(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = expectAsync(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')

                expectPromiseVoid = expectAsync(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot()
                expectPromiseVoid = expectAsync(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = expectAsync(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')

                //@ts-expect-error
                expectVoid = expectAsync(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')
            })
        })

        describe('toBeElementsArrayOfSize', async () => {

            it('should work correctly when actual is chainableArray', async () => {
                expectPromiseVoid = expectAsync(chainableArray).toBeElementsArrayOfSize(5)
                expectPromiseVoid = expectAsync(chainableArray).toBeElementsArrayOfSize({ lte: 10 })

                // @ts-expect-error
                expectVoid = expectAsync(chainableArray).toBeElementsArrayOfSize(5)
                // @ts-expect-error
                expectVoid = expectAsync(chainableArray).toBeElementsArrayOfSize({ lte: 10 })
            })

            it('should not work when actual is not chainableArray', async () => {
            // @ts-expect-error
                await expectAsync(chainableElement).toBeElementsArrayOfSize(5)
                // @ts-expect-error
                await expectAsync(chainableElement).toBeElementsArrayOfSize({ lte: 10 })
                // @ts-expect-error
                await expectAsync(true).toBeElementsArrayOfSize(5)
                // @ts-expect-error
                await expectAsync(true).toBeElementsArrayOfSize({ lte: 10 })
            })
        })
    })

    describe('Custom matchers', () => {
        describe('using `ExpectWebdriverIO` namespace augmentation', () => {

            it('should supported correctly a promise custom matcher with only chainableElement as actual', async () => {
                expectPromiseVoid = expectAsync(chainableElement).toBeCustomPromise()
                expectPromiseVoid = expectAsync(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('test'))
                expectPromiseVoid = expectAsync(chainableElement).not.toBeCustomPromise(wdioExpect.not.stringContaining('test'))

                // @ts-expect-error
                expectAsync('test').toBeCustomPromise()
                // @ts-expect-error
                expectVoid = expectAsync(chainableElement).toBeCustomPromise()
                // @ts-expect-error
                expectVoid = expectAsync(chainableElement).toBeCustomPromise(wdioExpect.stringContaining('test'))
                // @ts-expect-error
                expectVoid = expectAsync(chainableElement).not.toBeCustomPromise(wdioExpect.stringContaining('test'))
                // @ts-expect-error
                expectAsync(chainableElement).toBeCustomPromise(wdioExpect.stringContaining(6))
            })

            it('should support custom asymmetric matcher', async () => {
                const expectString1 : ExpectWebdriverIO.PartialMatcher<string> = wdioExpect.toBeCustom()
                const expectString2 : ExpectWebdriverIO.PartialMatcher<string> = wdioExpect.not.toBeCustom()

                expectPromiseVoid = expectAsync(chainableElement).toBeCustomPromise(wdioExpect.toBeCustom())

                // @ts-expect-error
                expectPromiseVoid = wdioExpect.toBeCustom()
                // @ts-expect-error
                expectPromiseVoid = wdioExpect.not.toBeCustom()

                //@ts-expect-error
                expectVoid = expectAsync(chainableElement).toBeCustomPromise(wdioExpect.toBeCustom())
            })
        })

        describe('using `expect` module declaration', () => {

            it('should support a simple matcher', async () => {
                expectPromiseVoid = expectAsync(5).toBeWithinRange(1, 10)

                // TODO dprevost this one seems to be a problem, it should be a promise!!!!!
                // Or as an asymmetric matcher:
                expectVoid = expect({ value: 5 }).toEqual({
                    value: wdioExpect.toBeWithinRange(1, 10)
                })

                // @ts-expect-error
                expectVoid = expectAsync(5).toBeWithinRange(1, '10')
                // @ts-expect-error
                expectPromiseVoid = expectAsync(5).toBeWithinRange('1')
            })

            it('should support a simple custom matcher with a chainable element matcher with promise', async () => {
                expectPromiseVoid = expectAsync(chainableElement).toHaveSimpleCustomProperty('text')
                expectPromiseVoid = expectAsync(chainableElement).toHaveSimpleCustomProperty(wdioExpect.stringContaining('text'))
                expectPromiseVoid = expectAsync(chainableElement).not.toHaveSimpleCustomProperty(wdioExpect.not.stringContaining('text'))

                // Or as a custom asymmetric matcher:
                expectPromiseVoid = expectAsync(chainableElement).toHaveSimpleCustomProperty(
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
                expectPromiseVoid = expectAsync(chainableElement).toHaveCustomProperty('text')
                expectPromiseVoid = expectAsync(chainableElement).toHaveCustomProperty(wdioExpect.stringContaining('text'))
                expectPromiseVoid = expectAsync(chainableElement).not.toHaveCustomProperty(wdioExpect.not.stringContaining('text'))

                // Or as a custom asymmetric matcher:
                expectPromiseVoid = expectAsync(chainableElement).toHaveCustomProperty(
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

                await expectAsync(chainableElement).toHaveCustomProperty(
                    await wdioExpect.toHaveCustomProperty(chainableElement)
                )
            })
        })
    })

    describe('toBe', () => {
        it('should expect void type when actual is a boolean', async () => {
            expectVoid = expect(true).toBe(true)
            expectVoid = expect(true).not.toBe(true)

            expectPromiseVoid = expectAsync(true).toBe(true)
            expectPromiseVoid = expectAsync(true).not.toBe(true)
        })

        // // TODO dprevost: Is this a valid use case? Should we support it?
        // it('should expect Promise when actual is a chainable since toBe does not need to be awaited', async () => {
        //     expectPromiseVoid = expectAsync(chainableElement).toBe(true)
        //     expectPromiseVoid = expectAsync(chainableElement).not.toBe(true)

        //     //@ts-expect-error
        //     expectPromiseVoid = expectAsync(chainableElement).toBe(true)
        //     //@ts-expect-error
        //     expectPromiseVoid = expectAsync(chainableElement).not.toBe(true)
        // })

        it('should still expect void type when actual is a Promise since we do not overload them', async () => {
            const promiseBoolean = Promise.resolve(true)

            expectPromiseUnknown = expectAsync(promiseBoolean).toBe(true)
            expectPromiseUnknown = expectAsync(promiseBoolean).not.toBe(true)

            expectPromiseVoid = expectAsync(promiseBoolean).toBe(true)
            expectPromiseVoid = expectAsync(promiseBoolean).toBe(true)
        })

        it('should work with string', async () => {
            expectPromiseUnknown = expectAsync('text').toBe(true)
            expectPromiseUnknown = expectAsync('text').not.toBe(true)
            expectPromiseUnknown = expectAsync('text').toBe(wdioExpect.stringContaining('text'))
            expectPromiseUnknown = expectAsync('text').not.toBe(wdioExpect.stringContaining('text'))

            expectPromiseVoid = expectAsync('text').toBe(true)
            expectPromiseVoid = expectAsync('text').not.toBe(true)
            expectPromiseVoid = expectAsync('text').toBe(wdioExpect.stringContaining('text'))
            expectPromiseVoid = expectAsync('text').not.toBe(wdioExpect.stringContaining('text'))
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
            expectPromiseVoid = expectAsync(chainableElement).toBe(true)
            expectPromiseVoid = expectAsync(chainableElement).not.toBe(true)
        })
    })

    describe('Network Matchers', () => {
        const promiseNetworkMock = Promise.resolve(networkMock)

        it('should not have ts errors when typing to Promise', async () => {
            expectPromiseVoid = expectAsync(promiseNetworkMock).toBeRequested()
            expectPromiseVoid = expectAsync(promiseNetworkMock).toBeRequestedTimes(2)
            expectPromiseVoid = expectAsync(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 })

            expectPromiseVoid = expectAsync(promiseNetworkMock).not.toBeRequested()
            expectPromiseVoid = expectAsync(promiseNetworkMock).not.toBeRequestedTimes(2)
            expectPromiseVoid = expectAsync(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 })

            expectPromiseVoid = expectAsync(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api',
                method: 'POST',
                statusCode: 200,
                requestHeaders: { Authorization: 'foo' },
                responseHeaders: { Authorization: 'bar' },
                postData: { title: 'foo', description: 'bar' },
                response: { success: true },
            })

            expectPromiseVoid = expectAsync(promiseNetworkMock).toBeRequestedWith({
                url: wdioExpect.stringContaining('test'),
                method: 'POST',
                statusCode: 200,
                requestHeaders: wdioExpect.objectContaining({ Authorization: 'foo' }),
                responseHeaders: wdioExpect.objectContaining({ Authorization: 'bar' }),
                postData: wdioExpect.objectContaining({ title: 'foo', description: 'bar' }),
                response: wdioExpect.objectContaining({ success: true }),
            })

            expectPromiseVoid = expectAsync(promiseNetworkMock).toBeRequestedWith({
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
            expectVoid = expectAsync(promiseNetworkMock).toBeRequested()
            // @ts-expect-error
            expectVoid = expectAsync(promiseNetworkMock).toBeRequestedTimes(2) // await expectAsync(mock).toBeRequestedTimes({ eq: 2 })
            // @ts-expect-error
            expectVoid = expectAsync(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11

            // @ts-expect-error
            expectVoid = expectAsync(promiseNetworkMock).not.toBeRequested()
            // @ts-expect-error
            expectVoid = expectAsync(promiseNetworkMock).not.toBeRequestedTimes(2) // await expectAsync(mock).toBeRequestedTimes({ eq: 2 })
            // @ts-expect-error
            expectVoid = expectAsync(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11

            // @ts-expect-error
            expectVoid = expectAsync(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api',
                method: 'POST',
                statusCode: 200,
                requestHeaders: { Authorization: 'foo' },
                responseHeaders: { Authorization: 'bar' },
                postData: { title: 'foo', description: 'bar' },
                response: { success: true },
            })

            // @ts-expect-error
            expectVoid = expectAsync(promiseNetworkMock).toBeRequestedWith(wdioExpect.objectContaining({
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

            // TODO dprevost: Should we support these?
            // wdioExpect.not.anything()
            // wdioExpect.not.any(Function)
            // wdioExpect.not.any(Number)
            // wdioExpect.not.any(Boolean)
            // wdioExpect.not.any(String)
            // wdioExpect.not.any(Symbol)
            // wdioExpect.not.any(Date)
            // wdioExpect.not.any(Error)
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
                    const expectElement: WdioCustomMatchers<void, WebdriverIO.Element> = wdioExpect.soft(element)
                    const expectElementChainable: WdioCustomMatchers<void, typeof chainableElement> = wdioExpect.soft(chainableElement)

                    // // @ts-expect-error
                    // const expectElement2: WdioCustomMatchers<Promise<void>, WebdriverIO.Element> = wdioExpect.soft(element)
                    // // @ts-expect-error
                    // const expectElementChainable2: WdioCustomMatchers<Promise<void>, typeof chainableElement> = wdioExpect.soft(chainableElement)
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

            // @ts-expect-error
            expectVoid = expectAsync(Promise.resolve('test')).toBeResolved()
            // @ts-expect-error
            expectVoid = expectAsync(Promise.resolve('test')).toBeRejected()

            // @ts-expect-error
            expectVoid = expectAsync(Promise.resolve('test')).toBeResolved()
        })
        it('jasmine special asymmetric matcher', async () => {
            // Note: Even though the below is valid syntax, jasmine prefix for asymmetric matchers is not supported by wdioExpect.
            expectAsync({}).toEqual(jasmine.any(Object))
            expectAsync(12).toEqual(jasmine.any(Number))
        })

    })
})
