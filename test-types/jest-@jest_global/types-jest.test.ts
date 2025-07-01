/* eslint-disable @typescript-eslint/no-unused-vars */

import { expect } from 'expect-webdriverio'
import { describe, it, expect as jestExpect } from '@jest/globals'

describe('type assertions', async () => {
    // TODO dprevost: using @wdio/globals/types overlap with the local types/expect-webdriverio.d.ts, find how to work with this
    // const chainableElement: ChainablePromiseElement = $('findMe')
    // const chainableArray: ChainablePromiseArray = $$('ul>li')

    // const element: WebdriverIO.Element = await chainableElement?.getElement()
    // const elementArray: WebdriverIO.ElementArray = await chainableArray?.getElements()

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
                expectPromiseVoid = expect(browser).toHaveUrl('https://example.com')
                expectPromiseVoid = expect(browser).not.toHaveUrl('https://example.com')

                // Asymmetric matchers
                expectPromiseVoid = expect(browser).toHaveUrl(expect.stringContaining('WebdriverIO'))
                expectPromiseVoid = expect(browser).toHaveUrl(expect.not.stringContaining('WebdriverIO'))
                expectPromiseVoid = expect(browser).toHaveUrl(expect.any(String))
                expectPromiseVoid = expect(browser).toHaveUrl(expect.anything())

                // @ts-expect-error
                expectVoid = expect(browser).toHaveUrl('https://example.com')
                // @ts-expect-error
                expectVoid = expect(browser).not.toHaveUrl('https://example.com')
                // @ts-expect-error
                expectVoid = expect(browser).toHaveUrl(expect.stringContaining('WebdriverIO'))

                // @ts-expect-error
                await expect(browser).toHaveUrl(6)
                //// @ts-expect-error TODO dprevost can we make the below fail?
                // await expect(browser).toHaveUrl(expect.objectContaining({}))
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                // @ts-expect-error
                await expect(element).toHaveUrl('https://example.com')
                // @ts-expect-error
                await expect(element).not.toHaveUrl('https://example.com')
                // @ts-expect-error
                await expect(true).toHaveUrl('https://example.com')
                // @ts-expect-error
                await expect(true).not.toHaveUrl('https://example.com')
            })
        })

        describe('toHaveTitle', () => {
            it('should be supported correctly', async () => {
                expectPromiseVoid = expect(browser).toHaveTitle('https://example.com')
                expectPromiseVoid = expect(browser).not.toHaveTitle('https://example.com')

                // Asymmetric matchers
                expectPromiseVoid = expect(browser).toHaveTitle(expect.stringContaining('WebdriverIO'))
                expectPromiseVoid = expect(browser).toHaveTitle(expect.any(String))
                expectPromiseVoid = expect(browser).toHaveTitle(expect.anything())

                // @ts-expect-error
                expectVoid = expect(browser).toHaveTitle('https://example.com')
                // @ts-expect-error
                expectVoid = expect(browser).not.toHaveTitle('https://example.com')
                // @ts-expect-error
                expectVoid = expect(browser).toHaveTitle(expect.stringContaining('WebdriverIO'))
            })

            it('should have ts errors when actual is not a Browser element', async () => {
                // @ts-expect-error
                await expect(element).toHaveTitle('https://example.com')
                // @ts-expect-error
                await expect(element).not.toHaveTitle('https://example.com')
                // @ts-expect-error
                await expect(true).toHaveTitle('https://example.com')
                // @ts-expect-error
                await expect(true).not.toHaveTitle('https://example.com')
            })
        })
    })

    describe('element', () => {

        describe('toBeDisabled', () => {
            it('should be supported correctly', async () => {
                // Element
                expectPromiseVoid = expect(element).toBeDisabled()
                expectPromiseVoid = expect(element).not.toBeDisabled()

                // Element array
                expectPromiseVoid = expect(elementArray).toBeDisabled()
                expectPromiseVoid = expect(elementArray).not.toBeDisabled()

                // Chainable element
                expectPromiseVoid = expect(chainableElement).toBeDisabled()
                expectPromiseVoid = expect(chainableElement).not.toBeDisabled()

                // Chainable element array
                expectPromiseVoid = expect(chainableArray).toBeDisabled()
                expectPromiseVoid = expect(chainableArray).not.toBeDisabled()

                // @ts-expect-error
                expectVoid = expect(element).toBeDisabled()
                // @ts-expect-error
                expectVoid = expect(element).not.toBeDisabled()
            })

            it('should have ts errors when actual is not an element', async () => {
                // @ts-expect-error
                await expect(browser).toBeDisabled()
                // @ts-expect-error
                await expect(browser).not.toBeDisabled()
                // @ts-expect-error
                await expect(true).toBeDisabled()
                // @ts-expect-error
                await expect(true).not.toBeDisabled()
            })
        })

        describe('toHaveText', () => {
            it('should be supported correctly', async () => {
                expectPromiseVoid = expect(element).toHaveText('text')
                expectPromiseVoid = expect(element).toHaveText(/text/)
                expectPromiseVoid = expect(element).toHaveText(['text1', 'text2'])
                expectPromiseVoid = expect(element).toHaveText([expect.stringContaining('text1'), expect.stringContaining('text2')])
                expectPromiseVoid = expect(element).toHaveText([/text1/, /text2/])
                expectPromiseVoid = expect(element).toHaveText(['text1', /text1/, expect.stringContaining('text3')])
                await expect(element).toHaveText(
                    'My-Ex-Am-Ple',
                    {
                        replace: [[/-/g, ' '], [/[A-Z]+/g, (match: string) => match.toLowerCase()]]
                    }
                )

                expectPromiseVoid = expect(element).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = expect(element).toHaveText('text')
                // @ts-expect-error
                await expect(element).toHaveText(6)

                expectPromiseVoid = expect(chainableElement).toHaveText('text')
                expectPromiseVoid = expect(chainableElement).toHaveText(/text/)
                expectPromiseVoid = expect(chainableElement).toHaveText(['text1', 'text2'])
                expectPromiseVoid = expect(chainableElement).toHaveText([expect.stringContaining('text1'), expect.stringContaining('text2')])
                expectPromiseVoid = expect(chainableElement).toHaveText([/text1/, /text2/])
                expectPromiseVoid = expect(chainableElement).toHaveText(['text1', /text1/, expect.stringContaining('text3')])

                expectPromiseVoid = expect(chainableElement).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = expect(chainableElement).toHaveText('text')
                // @ts-expect-error
                await expect(chainableElement).toHaveText(6)

                expectPromiseVoid = expect(elementArray).toHaveText('text')
                expectPromiseVoid = expect(elementArray).toHaveText(/text/)
                expectPromiseVoid = expect(elementArray).toHaveText(['text1', 'text2'])
                expectPromiseVoid = expect(elementArray).toHaveText([expect.stringContaining('text1'), expect.stringContaining('text2')])
                expectPromiseVoid = expect(elementArray).toHaveText([/text1/, /text2/])
                expectPromiseVoid = expect(elementArray).toHaveText(['text1', /text1/, expect.stringContaining('text3')])

                expectPromiseVoid = expect(elementArray).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = expect(elementArray).toHaveText('text')
                // @ts-expect-error
                await expect(elementArray).toHaveText(6)

                expectPromiseVoid = expect(chainableArray).toHaveText('text')
                expectPromiseVoid = expect(chainableArray).toHaveText(/text/)
                expectPromiseVoid = expect(chainableArray).toHaveText(['text1', 'text2'])
                expectPromiseVoid = expect(chainableArray).toHaveText([expect.stringContaining('text1'), expect.stringContaining('text2')])
                expectPromiseVoid = expect(chainableArray).toHaveText([/text1/, /text2/])
                expectPromiseVoid = expect(chainableArray).toHaveText(['text1', /text1/, expect.stringContaining('text3')])

                expectPromiseVoid = expect(chainableArray).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = expect(chainableArray).toHaveText('text')
                // @ts-expect-error
                await expect(chainableArray).toHaveText(6)

                // @ts-expect-error
                await expect(browser).toHaveText('text')
            })

            it('should have ts errors when actual is not an element', async () => {
                // @ts-expect-error
                await expect(browser).toHaveText('text')
                // @ts-expect-error
                await expect(browser).not.toHaveText('text')
                // @ts-expect-error
                await expect(true).toHaveText('text')
                // @ts-expect-error
                await expect(true).toHaveText('text')
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                // @ts-expect-error
                await expect('text').toHaveText('text')
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
                expectPromiseVoid = expect(element).toHaveHeight(100)
                expectPromiseVoid = expect(element).toHaveHeight(100, { message: 'Custom error message' })
                expectPromiseVoid = expect(element).not.toHaveHeight(100)
                expectPromiseVoid = expect(element).not.toHaveHeight(100, { message: 'Custom error message' })

                expectPromiseVoid = expect(element).toHaveHeight({ width: 100, height: 200 })
                expectPromiseVoid = expect(element).toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })
                expectPromiseVoid = expect(element).not.toHaveHeight({ width: 100, height: 200 })
                expectPromiseVoid = expect(element).not.toHaveHeight({ width: 100, height: 200 }, { message: 'Custom error message' })

                // @ts-expect-error
                expectVoid = expect(element).toHaveHeight(100)
                // @ts-expect-error
                expectVoid = expect(element).not.toHaveHeight(100)

                // @ts-expect-error
                expectVoid = expect(element).toHaveHeight({ width: 100, height: 200 })
                // @ts-expect-error
                expectVoid = expect(element).not.toHaveHeight({ width: 100, height: 200 })

                // @ts-expect-error
                await expect(browser).toHaveHeight(100)
            })

            it('should have ts errors when actual is string or Promise<string>', async () => {
                // @ts-expect-error
                await expect('text').toHaveText('text')
                // @ts-expect-error
                await expect('text').not.toHaveText('text')
                // @ts-expect-error
                await expect(Promise.resolve('text')).toHaveText('text')
                // @ts-expect-error
                await expect(Promise.resolve('text')).toHaveText('text')
            })
        })

        describe('toMatchSnapshot', () => {

            it('should be supported correctly', async () => {
                expectVoid = expect(element).toMatchSnapshot()
                expectVoid = expect(element).toMatchSnapshot('test label')
                expectVoid = expect(element).not.toMatchSnapshot('test label')

                expectPromiseVoid = expect(chainableElement).toMatchSnapshot()
                expectPromiseVoid = expect(chainableElement).toMatchSnapshot('test label')
                expectPromiseVoid = expect(chainableElement).not.toMatchSnapshot('test label')

                //@ts-expect-error
                expectPromiseVoid = expect(element).toMatchSnapshot()
                //@ts-expect-error
                expectPromiseVoid = expect(element).not.toMatchSnapshot()
                //@ts-expect-error
                expectVoid = expect(chainableElement).toMatchSnapshot()
                //@ts-expect-error
                expectVoid = expect(chainableElement).not.toMatchSnapshot()
            })

            // TODO - since we are overloading the `toMatchSnapshot` of jest.toMatchSnapshot, I wonder if we can achieve the below...
            // it('should have ts errors when not an element or chainable', async () => {
            //     //@ts-expect-error
            //     await expect('.findme').toMatchSnapshot()
            // })
        })

        describe('toMatchInlineSnapshot', () => {

            it('should be correctly supported', async () => {
                expectVoid = expect(element).toMatchInlineSnapshot()
                expectVoid = expect(element).toMatchInlineSnapshot('test snapshot')
                expectVoid = expect(element).toMatchInlineSnapshot('test snapshot', 'test label')

                expectPromiseVoid = expect(chainableElement).toMatchInlineSnapshot()
                expectPromiseVoid = expect(chainableElement).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = expect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')

                //@ts-expect-error
                expectPromiseVoid = expect(element).toMatchInlineSnapshot()
                //@ts-expect-error
                expectVoid = expect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')
            })

            it('should be correctly supported with getCSSProperty()', async () => {
                expectPromiseVoid = expect(element.getCSSProperty('test')).toMatchInlineSnapshot()
                expectPromiseVoid = expect(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = expect(element.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')

                expectPromiseVoid = expect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot()
                expectPromiseVoid = expect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = expect(chainableElement.getCSSProperty('test')).toMatchInlineSnapshot('test snapshot', 'test label')

                //@ts-expect-error
                expectPromiseVoid = expect(element).toMatchInlineSnapshot()
                //@ts-expect-error
                expectVoid = expect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')
            })
        })

        describe('toBeElementsArrayOfSize', async () => {

            it('should work correctly when actual is chainableArray', async () => {
                expectPromiseVoid = expect(chainableArray).toBeElementsArrayOfSize(5)
                expectPromiseVoid = expect(chainableArray).toBeElementsArrayOfSize({ lte: 10 })

                // @ts-expect-error
                expectVoid = expect(chainableArray).toBeElementsArrayOfSize(5)
                // @ts-expect-error
                expectVoid = expect(chainableArray).toBeElementsArrayOfSize({ lte: 10 })
            })

            it('should not work when actual is not chainableArray', async () => {
            // @ts-expect-error
                await expect(chainableElement).toBeElementsArrayOfSize(5)
                // @ts-expect-error
                await expect(chainableElement).toBeElementsArrayOfSize({ lte: 10 })
                // @ts-expect-error
                await expect(true).toBeElementsArrayOfSize(5)
                // @ts-expect-error
                await expect(true).toBeElementsArrayOfSize({ lte: 10 })
            })
        })
    })

    describe('Custom matchers', () => {
        describe('using `ExpectWebdriverIO` namespace augmentation', () => {
            it('should supported correctly a non-promise custom matcher', async () => {
                expectVoid = expect('test').toBeCustom()
                expectVoid = expect('test').not.toBeCustom()

                // @ts-expect-error
                expectPromiseVoid = expect('test').toBeCustom()
                // @ts-expect-error
                expectPromiseVoid = expect('test').not.toBeCustom()

                expectVoid = expect(1).toBeWithinRange(0, 2)
            })

            it('should supported correctly a promise custom matcher with only chainableElement as actual', async () => {
                expectPromiseVoid = expect(chainableElement).toBeCustomPromise()
                expectPromiseVoid = expect(chainableElement).toBeCustomPromise(expect.stringContaining('test'))
                expectPromiseVoid = expect(chainableElement).not.toBeCustomPromise(expect.not.stringContaining('test'))

                // @ts-expect-error
                expect('test').toBeCustomPromise()
                // @ts-expect-error
                expectVoid = expect(chainableElement).toBeCustomPromise()
                // @ts-expect-error
                expectVoid = expect(chainableElement).toBeCustomPromise(expect.stringContaining('test'))
                // @ts-expect-error
                expectVoid = expect(chainableElement).not.toBeCustomPromise(expect.stringContaining('test'))
                // @ts-expect-error
                expect(chainableElement).toBeCustomPromise(expect.stringContaining(6))
            })

            it('should support custom asymmetric matcher', async () => {
                const expectString1 : ExpectWebdriverIO.PartialMatcher<string> = expect.toBeCustom()
                const expectString2 : ExpectWebdriverIO.PartialMatcher<string> = expect.not.toBeCustom()

                expectPromiseVoid = expect(chainableElement).toBeCustomPromise(expect.toBeCustom())

                // @ts-expect-error
                expectPromiseVoid = expect.toBeCustom()
                // @ts-expect-error
                expectPromiseVoid = expect.not.toBeCustom()

                //@ts-expect-error
                expectVoid = expect(chainableElement).toBeCustomPromise(expect.toBeCustom())
            })
        })

        describe('using `expect` module declaration', () => {

            it('should support a simple matcher', async () => {
                expectVoid = expect(5).toBeWithinRange(1, 10)

                // Or as an asymmetric matcher:
                expectVoid = expect({ value: 5 }).toEqual({
                    value: expect.toBeWithinRange(1, 10)
                })

                // @ts-expect-error
                expectVoid = expect(5).toBeWithinRange(1, '10')
                // @ts-expect-error
                expectPromiseVoid = expect(5).toBeWithinRange('1')
            })

            it('should support a simple custom matcher with a chainable element matcher with promise', async () => {
                expectPromiseVoid = expect(chainableElement).toHaveSimpleCustomProperty('text')
                expectPromiseVoid = expect(chainableElement).toHaveSimpleCustomProperty(expect.stringContaining('text'))
                expectPromiseVoid = expect(chainableElement).not.toHaveSimpleCustomProperty(expect.not.stringContaining('text'))

                // Or as a custom asymmetric matcher:
                expectPromiseVoid = expect(chainableElement).toHaveSimpleCustomProperty(
                    expect.toHaveSimpleCustomProperty('string')
                )
                const expectString1:string = expect.toHaveSimpleCustomProperty('string')
                const expectString2:string = expect.not.toHaveSimpleCustomProperty('string')

                // TODO how to make the below fails when the await is missing inf front of the expect from the asymmetric matcher?
                // expectPromiseVoid = expect(chainableElement).toHaveCustomProperty(
                //     expect.toHaveCustomProperty(chainableElement)
                // )

                // @ts-expect-error
                expectVoid = expect.toHaveSimpleCustomProperty(chainableElement)
                // @ts-expect-error
                expectVoid = expect.not.toHaveSimpleCustomProperty(chainableElement)

                // @ts-expect-error
                expectVoid = expect.toHaveSimpleCustomProperty(chainableElement)
            })

            it('should support a chainable element matcher with promise', async () => {
                expectPromiseVoid = expect(chainableElement).toHaveCustomProperty('text')
                expectPromiseVoid = expect(chainableElement).toHaveCustomProperty(expect.stringContaining('text'))
                expectPromiseVoid = expect(chainableElement).not.toHaveCustomProperty(expect.not.stringContaining('text'))

                // Or as a custom asymmetric matcher:
                expectPromiseVoid = expect(chainableElement).toHaveCustomProperty(
                    await expect.toHaveCustomProperty(chainableElement)
                )
                const expectPromiseWdioElement1: Promise<ExpectWebdriverIO.PartialMatcher<string>> = expect.toHaveCustomProperty(chainableElement)
                const expectPromiseWdioElement2: Promise<ExpectWebdriverIO.PartialMatcher<string>> = expect.not.toHaveCustomProperty(chainableElement)

                // TODO how to make the below fails when the await is missing inf front of the expect from the asymmetric matcher?
                // expectPromiseVoid = expect(chainableElement).toHaveCustomProperty(
                //     expect.toHaveCustomProperty(chainableElement)
                // )

                // @ts-expect-error
                expectVoid = expect.toHaveCustomProperty(chainableElement)
                // @ts-expect-error
                expectVoid = expect.not.toHaveCustomProperty(chainableElement)

                // @ts-expect-error
                expectVoid = expect.toHaveCustomProperty(chainableElement)
                // @ts-expect-error
                expect.toHaveCustomProperty('test')

                await expect(chainableElement).toHaveCustomProperty(
                    await expect.toHaveCustomProperty(chainableElement)
                )
            })

            // TODO this is not supported in Wdio right now, maybe one day we can support it
            // it('should support an async asymmetric matcher on a non async matcher', async () => {
            //     expectPromiseVoid = expect({ value: 5 }).toEqual({
            //         value: expect.toHaveCustomProperty(chainableElement)
            //     })

            //     // @ts-expect-error
            //     expectVoid = expect({ value: 5 }).toEqual({
            //         value: expect.toHaveCustomProperty(chainableElement)
            //     })

            // })
        })
    })

    describe('toBe', () => {

        it('should expect void type when actual is a boolean', async () => {
            expectVoid = expect(true).toBe(true)
            expectVoid = expect(true).not.toBe(true)

            //@ts-expect-error
            expectPromiseVoid = expect(true).toBe(true)
            //@ts-expect-error
            expectPromiseVoid = expect(true).not.toBe(true)
        })

        it('should not expect Promise when actual is a chainable since toBe does not need to be awaited', async () => {
            expectVoid = expect(chainableElement).toBe(true)
            expectVoid = expect(chainableElement).not.toBe(true)

            //@ts-expect-error
            expectPromiseVoid = expect(chainableElement).toBe(true)
            //@ts-expect-error
            expectPromiseVoid = expect(chainableElement).not.toBe(true)
        })

        it('should still expect void type when actual is a Promise since we do not overload them', async () => {
            const promiseBoolean = Promise.resolve(true)

            expectVoid = expect(promiseBoolean).toBe(true)
            expectVoid = expect(promiseBoolean).not.toBe(true)

            //@ts-expect-error
            expectPromiseVoid = expect(promiseBoolean).toBe(true)
            //@ts-expect-error
            expectPromiseVoid = expect(promiseBoolean).toBe(true)
        })

        it('should work with string', async () => {
            expectVoid = expect('text').toBe(true)
            expectVoid = expect('text').not.toBe(true)
            expectVoid = expect('text').toBe(expect.stringContaining('text'))
            expectVoid = expect('text').not.toBe(expect.stringContaining('text'))

            //@ts-expect-error
            expectPromiseVoid = expect('text').toBe(true)
            //@ts-expect-error
            expectPromiseVoid = expect('text').not.toBe(true)
            //@ts-expect-error
            expectPromiseVoid = expect('text').toBe(expect.stringContaining('text'))
            //@ts-expect-error
            expectPromiseVoid = expect('text').not.toBe(expect.stringContaining('text'))
        })
    })

    describe('Promise type assertions', () => {
        const booleanPromise: Promise<boolean> = Promise.resolve(true)

        it('should expect a Promise of type', async () => {
            const expectPromiseBoolean1: ExpectWebdriverIO.MatchersAndInverse<void, Promise<boolean>> = expect(booleanPromise)
            const expectPromiseBoolean2: jest.Matchers<void, Promise<boolean>> = expect(booleanPromise).not

            // @ts-expect-error
            const expectPromiseBoolean3: jest.JestMatchers<boolean> = expect(booleanPromise)
            //// @ts-expect-error
            // const expectPromiseBoolean4: jest.Matchers<void, boolean> = expect(booleanPromise).not
        })

        it('should work with resolves & rejects correctly', async () => {
            // TODO dprevost should we bring back the support for this?
            // expectPromiseVoid = expect(booleanPromise).resolves.toBe(true)
            // expectPromiseVoid = expect(booleanPromise).rejects.toBe(true)

            //@ts-expect-error
            expectVoid = expect(booleanPromise).resolves.toBe(true)
            //@ts-expect-error
            expectVoid = expect(booleanPromise).rejects.toBe(true)

        })

        it('should not support chainable and expect PromiseVoid with toBe', async () => {
            //@ts-expect-error
            expectPromiseVoid = expect(chainableElement).toBe(true)
            //@ts-expect-error
            expectPromiseVoid = expect(chainableElement).not.toBe(true)
        })
    })

    describe('Network Matchers', () => {
        // const promiseNetworkMock = browser.mock('**/api/todo*')
        const promiseNetworkMock = Promise.resolve(networkMock)

        it('should not have ts errors when typing to Promise', async () => {
            expectPromiseVoid = expect(promiseNetworkMock).toBeRequested()
            expectPromiseVoid = expect(promiseNetworkMock).toBeRequestedTimes(2)
            expectPromiseVoid = expect(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 })

            expectPromiseVoid = expect(promiseNetworkMock).not.toBeRequested()
            expectPromiseVoid = expect(promiseNetworkMock).not.toBeRequestedTimes(2)
            expectPromiseVoid = expect(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 })

            expectPromiseVoid = expect(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api/todo',
                method: 'POST',
                statusCode: 200,
                requestHeaders: { Authorization: 'foo' },
                responseHeaders: { Authorization: 'bar' },
                postData: { title: 'foo', description: 'bar' },
                response: { success: true },
            })

            // TODO dprevost: Asymmetric matcher is not defined on the entire object in the .d.ts file, it is a bug?
            // expectPromiseVoid = expect(promiseNetworkMock).toBeRequestedWith(expect.objectContaining({
            //     response: { success: true },                    // [optional] object | function | custom matcher
            // }))

            expectPromiseVoid = expect(promiseNetworkMock).toBeRequestedWith({
                url: expect.stringContaining('test'),
                method: 'POST',
                statusCode: 200,
                requestHeaders: expect.objectContaining({ Authorization: 'foo' }),
                responseHeaders: expect.objectContaining({ Authorization: 'bar' }),
                postData: expect.objectContaining({ title: 'foo', description: 'bar' }),
                response: expect.objectContaining({ success: true }),
            })

            expectPromiseVoid = expect(promiseNetworkMock).toBeRequestedWith({
                url: expect.stringMatching(/.*\/api\/.*/i),
                method: ['POST', 'PUT'],
                statusCode: [401, 403],
                requestHeaders: headers => headers.Authorization.startsWith('Bearer '),
                postData: expect.objectContaining({ released: true, title: expect.stringContaining('foobar') }),
                response: (r: { data: { items: unknown[] } }) => Array.isArray(r) && r.data.items.length === 20
            })
        })

        it('should have ts errors when typing to void', async () => {
            // @ts-expect-error
            expectVoid = expect(promiseNetworkMock).toBeRequested()
            // @ts-expect-error
            expectVoid = expect(promiseNetworkMock).toBeRequestedTimes(2) // await expect(mock).toBeRequestedTimes({ eq: 2 })
            // @ts-expect-error
            expectVoid = expect(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11

            // @ts-expect-error
            expectVoid = expect(promiseNetworkMock).not.toBeRequested()
            // @ts-expect-error
            expectVoid = expect(promiseNetworkMock).not.toBeRequestedTimes(2) // await expect(mock).toBeRequestedTimes({ eq: 2 })
            // @ts-expect-error
            expectVoid = expect(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11

            // @ts-expect-error
            expectVoid = expect(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api/todo',
                method: 'POST',
                statusCode: 200,
                requestHeaders: { Authorization: 'foo' },
                responseHeaders: { Authorization: 'bar' },
                postData: { title: 'foo', description: 'bar' },
                response: { success: true },
            })

            // @ts-expect-error
            expectVoid = expect(promiseNetworkMock).toBeRequestedWith(expect.objectContaining({
                response: { success: true },
            }))
        })
    })

    describe('Expect', () => {
        it('should have ts errors when using a non existing expect.function', async () => {
            // @ts-expect-error
            expect.unimplementedFunction()
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

            //@ts-expect-error
            expect.not.anything()
            //@ts-expect-error
            expect.not.any(Function)
            //@ts-expect-error
            expect.not.any(Number)
            //@ts-expect-error
            expect.not.any(Boolean)
            //@ts-expect-error
            expect.not.any(String)
            //@ts-expect-error
            expect.not.any(Symbol)
            //@ts-expect-error
            expect.not.any(Date)
            //@ts-expect-error
            expect.not.any(Error)
        })

        describe('Soft Assertions', async () => {
            const actualString: string = 'test'
            const actualPromiseString: Promise<string> = Promise.resolve('test')

            describe('expect.soft', () => {
                it('should not need to be awaited/be a promise if actual is non-promise type', async () => {
                    const expectWdioMatcher1: WdioCustomMatchers<void, string> = expect.soft(actualString)
                    expectVoid = expect.soft(actualString).toBe('Test Page')
                    expectVoid = expect.soft(actualString).not.toBe('Test Page')
                    expectVoid = expect.soft(actualString).not.toBe(expect.stringContaining('Test Page'))

                    // @ts-expect-error
                    expectPromiseVoid = expect.soft(actualString).toBe('Test Page')
                    // @ts-expect-error
                    expectPromiseVoid = expect.soft(actualString).not.toBe('Test Page')
                    // @ts-expect-error
                    expectPromiseVoid = expect.soft(actualString).not.toBe(expect.stringContaining('Test Page'))
                })

                it('should need to be awaited/be a promise if actual is promise type', async () => {
                    const expectWdioMatcher1: ExpectWebdriverIO.MatchersAndInverse<Promise<void>, Promise<string>> = expect.soft(actualPromiseString)
                    expectPromiseVoid = expect.soft(actualPromiseString).toBe('Test Page')
                    expectPromiseVoid = expect.soft(actualPromiseString).not.toBe('Test Page')
                    expectPromiseVoid = expect.soft(actualPromiseString).not.toBe(expect.stringContaining('Test Page'))

                    // @ts-expect-error
                    expectVoid = expect.soft(actualPromiseString).toBe('Test Page')
                    // @ts-expect-error
                    expectVoid = expect.soft(actualPromiseString).not.toBe('Test Page')
                    // @ts-expect-error
                    expectVoid = expect.soft(actualPromiseString).not.toBe(expect.stringContaining('Test Page'))
                })

                it('should support chainable element', async () => {
                    const expectElement: WdioCustomMatchers<void, WebdriverIO.Element> = expect.soft(element)
                    const expectElementChainable: WdioCustomMatchers<void, typeof chainableElement> = expect.soft(chainableElement)

                    // @ts-expect-error
                    const expectElement2: WdioCustomMatchers<Promise<void>, WebdriverIO.Element> = expect.soft(element)
                    // @ts-expect-error
                    const expectElementChainable2: WdioCustomMatchers<Promise<void>, typeof chainableElement> = expect.soft(chainableElement)
                })

                it('should support chainable element with wdio Matchers', async () => {
                    expectPromiseVoid = expect.soft(element).toBeDisplayed()
                    expectPromiseVoid = expect.soft(chainableElement).toBeDisplayed()
                    expectPromiseVoid = expect.soft(chainableArray).toBeDisplayed()
                    await expect.soft(element).toBeDisplayed()
                    await expect.soft(chainableElement).toBeDisplayed()
                    await expect.soft(chainableArray).toBeDisplayed()

                    expectPromiseVoid = expect.soft(element).not.toBeDisplayed()
                    expectPromiseVoid = expect.soft(chainableElement).not.toBeDisplayed()
                    expectPromiseVoid = expect.soft(chainableArray).not.toBeDisplayed()
                    await expect.soft(element).not.toBeDisplayed()
                    await expect.soft(chainableElement).not.toBeDisplayed()
                    await expect.soft(chainableArray).not.toBeDisplayed()

                    // @ts-expect-error
                    expectVoid = expect.soft(element).toBeDisplayed()
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toBeDisplayed()
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableArray).toBeDisplayed()

                    // @ts-expect-error
                    expectVoid = expect.soft(element).not.toBeDisplayed()
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).not.toBeDisplayed()
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableArray).not.toBeDisplayed()
                })

                it('should have ts (or lint) errors when actual is a chainable not awaited', async () => {
                    // TODO dprevost: see if an eslint rule could help us here to detect missing await when not using wdio matchers
                    // expectPromiseVoid = expect.soft(chainableElement.getText()).toEqual('Basketball Shoes')
                    // expectPromiseVoid = expect.soft(chainableElement.getText()).toMatch(/€\d+/)
                })

                it('should work with custom matcher and custom asymmetric matchers from `expect` module', async () => {
                    expectPromiseVoid = expect.soft(chainableElement).toHaveCustomProperty('text')
                    expectPromiseVoid = expect.soft(chainableElement).toHaveCustomProperty(expect.stringContaining('text'))
                    expectPromiseVoid = expect.soft(chainableElement).not.toHaveCustomProperty(expect.not.stringContaining('text'))
                    expectPromiseVoid = expect.soft(chainableElement).toHaveCustomProperty(
                        expect.toHaveCustomProperty(chainableElement)
                    )

                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toHaveCustomProperty('text')
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toHaveCustomProperty(expect.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).not.toHaveCustomProperty(expect.not.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toHaveCustomProperty(
                        expect.toHaveCustomProperty(chainableElement)
                    )

                    expectPromiseVoid = expect.soft(chainableElement).toHaveCustomProperty('text')
                    expectPromiseVoid = expect.soft(chainableElement).toHaveCustomProperty(expect.stringContaining('text'))
                    expectPromiseVoid = expect.soft(chainableElement).not.toHaveCustomProperty(expect.not.stringContaining('text'))
                    expectPromiseVoid = expect.soft(chainableElement).toHaveCustomProperty(
                        expect.toHaveCustomProperty(chainableElement)
                    )

                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toHaveCustomProperty('text')
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toHaveCustomProperty(expect.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).not.toHaveCustomProperty(expect.not.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toHaveCustomProperty(
                        expect.toHaveCustomProperty(chainableElement)
                    )
                })

                it('should work with custom matcher and custom asymmetric matchers from `ExpectWebDriverIO` namespace', async () => {
                    expectPromiseVoid = expect.soft(chainableElement).toBeCustomPromise('text')
                    expectPromiseVoid = expect.soft(chainableElement).toBeCustomPromise(expect.stringContaining('text'))
                    expectPromiseVoid = expect.soft(chainableElement).not.toBeCustomPromise(expect.not.stringContaining('text'))
                    expectPromiseVoid = expect.soft(chainableElement).toBeCustomPromise(
                        expect.toBeCustomPromise(chainableElement)
                    )

                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toBeCustomPromise('text')
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toBeCustomPromise(expect.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).not.toBeCustomPromise(expect.not.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toBeCustomPromise(
                        expect.toBeCustomPromise(chainableElement)
                    )

                    expectPromiseVoid = expect.soft(chainableElement).toBeCustomPromise('text')
                    expectPromiseVoid = expect.soft(chainableElement).toBeCustomPromise(expect.stringContaining('text'))
                    expectPromiseVoid = expect.soft(chainableElement).not.toBeCustomPromise(expect.not.stringContaining('text'))
                    expectPromiseVoid = expect.soft(chainableElement).toBeCustomPromise(
                        expect.toBeCustomPromise(chainableElement)
                    )

                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toBeCustomPromise('text')
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toBeCustomPromise(expect.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).not.toBeCustomPromise(expect.not.stringContaining('text'))
                    // @ts-expect-error
                    expectVoid = expect.soft(chainableElement).toBeCustomPromise(
                        expect.toBeCustomPromise(chainableElement)
                    )
                })
            })

            describe('expect.getSoftFailures', () => {
                it('should be of type `SoftFailure`', async () => {
                    const expectSoftFailure1: ExpectWebdriverIO.SoftFailure[] = expect.getSoftFailures()

                    // @ts-expect-error
                    expectVoid = expect.getSoftFailures()
                })
            })

            describe('expect.assertSoftFailures', () => {
                it('should be of type void', async () => {
                    expectVoid = expect.assertSoftFailures()

                    // @ts-expect-error
                    expectPromiseVoid = expect.assertSoftFailures()
                })
            })

            describe('expect.clearSoftFailures', () => {
                it('should be of type void', async () => {
                    expectVoid = expect.clearSoftFailures()

                    // @ts-expect-error
                    expectPromiseVoid = expect.clearSoftFailures()
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

        it('should support mock matchers existing only on JestExpect', () => {
            const mockFn = () => {}

            // Jest-specific mock matchers
            expect(mockFn).toHaveBeenCalled()
        })

        describe('Jest-specific Promise matchers', () => {
            it('should support resolves and rejects', async () => {
                const stringPromise = Promise.resolve('Hello Jest')
                const rejectedPromise = Promise.reject(new Error('Failed'))

                expectPromiseVoid = jestExpect(stringPromise).resolves.toBe('Hello Jest')
                expectPromiseVoid = jestExpect(rejectedPromise).rejects.toThrow('Failed')

                // @ts-expect-error
                expectVoid = jestExpect(stringPromise).resolves.toBe('Hello Jest')
                // @ts-expect-error
                expectVoid = jestExpect(rejectedPromise).rejects.toThrow('Failed')
            })
        })

        describe('toMatchSnapshot & toMatchInlineSnapshot', () => {
            const snapshotName: string = 'test-snapshot'

            it('should work with string', async () => {
                const jsonString: string = '{}'
                const propertyMatchers = 'test'
                expectVoid = jestExpect(jsonString).toMatchSnapshot(propertyMatchers)
                expectVoid = jestExpect(jsonString).toMatchSnapshot(propertyMatchers, snapshotName)
                expectVoid = jestExpect(jsonString).toMatchInlineSnapshot(propertyMatchers)
                expectVoid = jestExpect(jsonString).toMatchInlineSnapshot(propertyMatchers, snapshotName)

                expectVoid = jestExpect(jsonString).not.toMatchSnapshot(propertyMatchers)
                expectVoid = jestExpect(jsonString).not.toMatchSnapshot(propertyMatchers, snapshotName)
                expectVoid = jestExpect(jsonString).not.toMatchInlineSnapshot(propertyMatchers)
                expectVoid = jestExpect(jsonString).not.toMatchInlineSnapshot(propertyMatchers, snapshotName)

                // @ts-expect-error
                expectPromiseVoid = jestExpect(jsonString).toMatchSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(jsonString).toMatchSnapshot(propertyMatchers, snapshotName)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(jsonString).toMatchInlineSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(jsonString).toMatchInlineSnapshot(propertyMatchers, snapshotName)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(jsonString).not.toMatchSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(jsonString).not.toMatchSnapshot(propertyMatchers, snapshotName)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(jsonString).not.toMatchInlineSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(jsonString).not.toMatchInlineSnapshot(propertyMatchers, snapshotName)
            })

            it('should with object', async () => {
                const treeObject = { 1: 'test', 2: 'test2' }
                const propertyMatchers = { 1: 'test' }
                expectVoid = jestExpect(treeObject).toMatchSnapshot(propertyMatchers)
                expectVoid = jestExpect(treeObject).toMatchSnapshot(propertyMatchers, snapshotName)
                expectVoid = jestExpect(treeObject).toMatchInlineSnapshot(propertyMatchers)
                expectVoid = jestExpect(treeObject).toMatchInlineSnapshot(propertyMatchers, snapshotName)

                expectVoid = jestExpect(treeObject).not.toMatchSnapshot(propertyMatchers)
                expectVoid = jestExpect(treeObject).not.toMatchSnapshot(propertyMatchers, snapshotName)
                expectVoid = jestExpect(treeObject).not.toMatchInlineSnapshot(propertyMatchers)
                expectVoid = jestExpect(treeObject).not.toMatchInlineSnapshot(propertyMatchers, snapshotName)

                // @ts-expect-error
                expectPromiseVoid = jestExpect(treeObject).toMatchSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(treeObject).toMatchSnapshot(propertyMatchers, snapshotName)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(treeObject).toMatchInlineSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(treeObject).toMatchInlineSnapshot(propertyMatchers, snapshotName)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(treeObject).not.toMatchSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(treeObject).not.toMatchSnapshot(propertyMatchers, snapshotName)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(treeObject).not.toMatchInlineSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = jestExpect(treeObject).not.toMatchInlineSnapshot(propertyMatchers, snapshotName)
            })
        })
    })
})
