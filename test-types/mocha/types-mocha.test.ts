/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="webdriverio"/>

import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio'

describe('type assertions', () => {
    const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
    const chainableElement = {} as unknown as ChainablePromiseElement
    const chainableArray = {} as ChainablePromiseArray
    const networkMock: WebdriverIO.Mock = {} as unknown as WebdriverIO.Mock

    describe('toHaveUrl', () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        it('should not have ts errors and be able to await the promise when actual is browser', async () => {
            const expectPromiseVoid: Promise<void> = expect(browser).toHaveUrl('https://example.com')
            await expectPromiseVoid

            const expectNotPromiseVoid: Promise<void> = expect(browser).not.toHaveUrl('https://example.com')
            await expectNotPromiseVoid
        })

        it('should have ts errors and not need to await the promise when actual is browser', async () => {
            // @ts-expect-error
            const expectVoid: void = expect(browser).toHaveUrl('https://example.com')
            // @ts-expect-error
            const expectNotVoid: void = expect(browser).not.toHaveUrl('https://example.com')
        })

        it('should have ts errors when actual is an element', async () => {
            // @ts-expect-error
            await expect(element).toHaveUrl('https://example.com')
        })

        it('should have ts errors when actual is an ChainableElement', async () => {
            // @ts-expect-error
            await expect(chainableElement).toHaveUrl('https://example.com')
        })

        // TODO dprevost fix expect.stringContaining
        // it('should support stringContaining', async () => {
        //     const expectVoid1: Promise<void> = expect(browser).toHaveUrl(expect.stringContaining('WebdriverIO'))

        //     // @ts-expect-error
        //     const expectVoid2: void = expect(browser).toHaveUrl(expect.stringContaining('WebdriverIO'))
        // })
    })

    describe('element type assertions', () => {

        describe('toBeDisabled', () => {
            it('should not have ts errors and be able to await the promise for element', async () => {
                // expect no ts errors
                const expectIsPromiseVoid: Promise<void> = expect(element).toBeDisabled()
                await expectIsPromiseVoid

                const expectNotIsPromiseVoid: Promise<void> = expect(element).not.toBeDisabled()
                await expectNotIsPromiseVoid
            })

            it('should not have ts errors and be able to await the promise for chainable', async () => {
                // expect no ts errors
                const expectIsPromiseVoid: Promise<void> = expect(chainableElement).toBeDisabled()
                await expectIsPromiseVoid

                const expectNotIsPromiseVoid: Promise<void> = expect(chainableElement).not.toBeDisabled()
                await expectNotIsPromiseVoid
            })

            it('should have ts errors when typing to void for element', async () => {
                // @ts-expect-error
                const expectToBeIsVoid: void = expect(element).toBeDisabled()
                // @ts-expect-error
                const expectNotToBeIsVoid: void = expect(element).not.toBeDisabled()
            })

            it('should have ts errors when typing to void for chainable', async () => {
                // @ts-expect-error
                const expectToBeIsVoid: void = expect(chainableElement).toBeDisabled()
                // @ts-expect-error
                const expectNotToBeIsVoid: void = expect(chainableElement).not.toBeDisabled()
            })
        })

        describe('toMatchSnapshot', () => {

            it('should not have ts errors when typing to Promise<void> for an element', async () => {
                const expectPromise1: Promise<void> = expect(element).toMatchSnapshot()
                const expectPromise2: Promise<void> = expect(element).toMatchSnapshot('test label')
            })

            it('should not have ts errors when typing to Promise<void> for a chainable', async () => {
                const expectPromise1: Promise<void> = expect(chainableElement).toMatchSnapshot()
                const expectPromise2: Promise<void> = expect(chainableElement).toMatchSnapshot('test label')
            })

            // We need somehow to exclude the Jest types one for this to success
            it('should have ts errors when typing to void for an element like', async () => {
                //@ts-expect-error
                const expectNotToBeVoid1: void = expect(element).toMatchSnapshot()
                //@ts-expect-error
                const expectNotToBeVoid2: void = expect(chainableElement).toMatchSnapshot()
            })

            // TODO - conditional types check on T to have the below match void does not work
            // it('should not have ts errors when typing to void for a string', async () => {
            //     const expectNotToBeVoid: void = expect('.findme').toMatchSnapshot()
            // })
        })

        describe('toMatchInlineSnapshot', () => {

            it('should not have ts errors when typing to Promise<void> for an element', async () => {
                const expectPromise1: Promise<void> = expect(element).toMatchInlineSnapshot()
                const expectPromise2: Promise<void> = expect(element).toMatchInlineSnapshot('test snapshot')
                const expectPromise3: Promise<void> = expect(element).toMatchInlineSnapshot('test snapshot', 'test label')
            })

            it('should not have ts errors when typing to Promise<void> for a chainable', async () => {
                const expectPromise1: Promise<void> = expect(chainableElement).toMatchInlineSnapshot()
                const expectPromise2: Promise<void> = expect(chainableElement).toMatchInlineSnapshot('test snapshot')
                const expectPromise3: Promise<void> = expect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')
            })

            // We need somehow to exclude the Jest types one for this to success
            it('should have ts errors when typing to void for an element like', async () => {
                //@ts-expect-error
                const expectNotToBeVoid1: void = expect(element).toMatchInlineSnapshot()
                //@ts-expect-error
                const expectPromise2: void = expect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')
            })

            // TODO - conditional types check on T to have the below match void does not work
            // it('should not have ts errors when typing to void for a string', async () => {
            //     const expectNotToBeVoid: void = expect('.findme').toMatchInlineSnapshot()
            // })
        })
    })

    describe('toBe', () => {

        it('should not have ts errors when typing to void when actual is boolean', async () => {
            const expectToBeIsVoid: void = expect(true).toBe(true)
            const expectNotToBeIsVoid: void = expect(true).not.toBe(true)
        })

        it('should have ts errors when typing to Promise when actual is boolean', async () => {
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid1: Promise<void> = expect(true).toBe(true)

            //@ts-expect-error
            const expectToBeIsNotPromiseVoid2: Promise<void> = expect(true).not.toBe(true)
        })

        it('should expect void when actual is an awaited element/chainable', async () => {
            const isClickableElement = await element.isClickable()
            const expectPromiseVoid1: void = expect(isClickableElement).toBe(true)

            const isClickableChainable: boolean = await chainableElement.isClickable()
            const expectPromiseVoid2: void = expect(isClickableChainable).toBe(true)

            // @ts-expect-error
            const expectPromiseVoid3: Promise<void> = expect(isClickableElement).toBe(true)

            // @ts-expect-error
            const expectPromiseVoid4: Promise<void> = expect(isClickableChainable).toBe(true)
        })
    })

    describe('string type assertions', () => {
        it('should not have ts errors when typing to void', async () => {
            // Expect no ts errors
            const expectToBeIsVoid: void = expect('test').toBe('test')
        })

        it('should have ts errors when typing to Promise', async () => {
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = expect('test').toBe('test')
        })
    })

    describe('Promise<> type assertions', () => {
        const booleanPromise: Promise<boolean> = Promise.resolve(true)

        it('should not have ts errors when typing to void', async () => {
            const expectToBeIsVoid: void = expect(booleanPromise).toBe(true)
            const expectAwaitToBeIsVoid: void = expect(await booleanPromise).toBe(true)
        })

        it('should not have ts errors when resolves and rejects is typed to Promise<void>', async () => {
            // TODO should we support resolves and rejects in standalone or with mocha?

            /// @ts-expect-error
            expect(booleanPromise).resolves.toBe(true)
            /// @ts-expect-error
            expect(booleanPromise).rejects.toBe(true)
        })

        it('should have ts errors when typing to Promise', async () => {
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid1: Promise<void> = expect(booleanPromise).toBe(true)
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid2: Promise<void> = expect(await booleanPromise).toBe(true)
        })

        // On standalone, resolves and rejects are not existing
        // it('should have ts errors when typing resolves and reject is typed to void', async () => {
        //     //@ts-expect-error
        //     const expectResolvesToBeIsVoid: void = expect(booleanPromise).resolves.toBe(true)
        //     //@ts-expect-error
        //     const expectRejectsToBeIsVoid: void = expect(booleanPromise).rejects.toBe(true)
        // })
    })

    describe('toBeElementsArrayOfSize', async () => {

        it('should not have ts errors when typing to Promise', async () => {
            const listItems = await chainableArray
            const expectPromise: Promise<void> = expect(listItems).toBeElementsArrayOfSize(5)
            const expectPromise1: Promise<void> = expect(listItems).toBeElementsArrayOfSize({ lte: 10 })
        })

        it('should have ts errors when typing to void', async () => {
            const listItems = await chainableArray
            // @ts-expect-error
            const expectPromise: void = expect(listItems).toBeElementsArrayOfSize(5)
            // @ts-expect-error
            const expectPromise1: void = expect(listItems).toBeElementsArrayOfSize({ lte: 10 })
        })
    })

    describe('Network Matchers', () => {
        const promiseNetworkMock = Promise.resolve(networkMock)

        it('should not have ts errors when typing to Promise', async () => {
            const expectPromise1: Promise<void> = expect(promiseNetworkMock).toBeRequested()
            const expectPromise2: Promise<void> = expect(promiseNetworkMock).toBeRequestedTimes(2) // await expect(mock).toBeRequestedTimes({ eq: 2 })
            const expectPromise3: Promise<void> = expect(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11

            const expectPromise4: Promise<void> = expect(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api/todo',          // [optional] string | function | custom matcher
                method: 'POST',                                 // [optional] string | array
                statusCode: 200,                                // [optional] number | array
                requestHeaders: { Authorization: 'foo' },       // [optional] object | function | custom matcher
                responseHeaders: { Authorization: 'bar' },      // [optional] object | function | custom matcher
                postData: { title: 'foo', description: 'bar' }, // [optional] object | function | custom matcher
                response: { success: true },                    // [optional] object | function | custom matcher
            })
        })

        it('should have ts errors when typing to void', async () => {
            // @ts-expect-error
            const expectPromise1: void = expect(mock).toBeRequested()
            // @ts-expect-error
            const expectPromise2: void = expect(mock).toBeRequestedTimes(2) // await expect(mock).toBeRequestedTimes({ eq: 2 })
            // @ts-expect-error
            const expectPromise3: void = expect(mock).toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11

            // @ts-expect-error
            const expectPromise4: void = expect(mock).toBeRequestedWith({
                url: 'http://localhost:8080/api/todo',          // [optional] string | function | custom matcher
                method: 'POST',                                 // [optional] string | array
                statusCode: 200,                                // [optional] number | array
                requestHeaders: { Authorization: 'foo' },       // [optional] object | function | custom matcher
                responseHeaders: { Authorization: 'bar' },      // [optional] object | function | custom matcher
                postData: { title: 'foo', description: 'bar' }, // [optional] object | function | custom matcher
                response: { success: true },                    // [optional] object | function | custom matcher
            })
        })
    })

    describe('Expect', () => {
        it('should have ts errors when using a non existing expect.function', async () => {
            // @ts-expect-error
            expect.unimplementedFunction()
        })

        it('should support stringContaining, anything', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const expectAny1: any = expect.stringContaining('WebdriverIO')

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const expectAny2: any = expect.anything()
        })

        describe('Soft Assertions', async () => {
            const expectString: string = 'awaited element.getText()'
            const expectPromise: Promise<string> = Promise.resolve(expectString)

            describe('expect.soft', () => {
                it('should not have ts error and not need to be awaited/be a promise if actual is non-promise type', async () => {
                    const expectWdioMatcher: WdioMatchers<void, string> = expect.soft(expectString)
                    const expectVoid: void = expect.soft(expectString).toBe('Test Page')
                })

                it('should not have ts error and need to be awaited/be a promise if actual is a promise type', async () => {
                    const expectWdioMatcher: WdioMatchers<Promise<void>, Promise<string>> = expect.soft(expectPromise)
                    const expectVoid: Promise<void> = expect.soft(expectPromise).toBe('Test Page')

                    await expect.soft(expectPromise).toBe('Test Page')
                })

                it('should have ts error when using await and actual is non-promise type', async () => {
                    // @ts-expect-error
                    const expectWdioMatcher: WdioMatchers<Promise<void>, string> = expect.soft(expectString)

                    // @ts-expect-error
                    const expectVoid: Promise<void> = expect.soft(expectString).toBe('Test Page')
                })

                it('should not have ts error and need to be awaited/be a promise if actual is a promise type', async () => {
                // @ts-expect-error
                    const expectWdioMatcher: WdioMatchers<void, Promise<string>> = expect.soft(expectPromise)
                    // @ts-expect-error
                    const expectVoid: void = expect.soft(expectPromise).toBe('Test Page')
                })

                it('should support chainable element', async () => {
                    const expectElement: WdioMatchers<void, WebdriverIO.Element> = expect.soft(element)
                    const expectElementChainable: WdioMatchers<void, typeof chainableElement> = expect.soft(chainableElement)

                    // @ts-expect-error
                    const expectElement2: WdioMatchers<Promise<void>, WebdriverIO.Element> = expect.soft(element)
                    // @ts-expect-error
                    const expectElementChainable2: WdioMatchers<Promise<void>, typeof chainableElement> = expect.soft(chainableElement)
                })

                it('should support chainable element with wdio Matchers', async () => {
                    const expectPromise1: Promise<void> = expect.soft(element).toBeDisplayed()
                    const expectPromise2: Promise<void> = expect.soft(chainableElement).toBeDisplayed()

                    // @ts-expect-error
                    const expectPromise3: void = expect.soft(element).toBeDisplayed()
                    // @ts-expect-error
                    const expectPromise4: void = expect.soft(chainableElement).toBeDisplayed()

                    await expect.soft(element).toBeDisplayed()
                    await expect.soft(chainableElement).toBeDisplayed()
                })

                describe('not', async () => {
                    it('should support not with chainable', async () => {
                        const expectPromise1: Promise<void> = expect.soft(element).not.toBeDisplayed()
                        const expectPromise2: Promise<void> = expect.soft(chainableElement).not.toBeDisplayed()

                        // @ts-expect-error
                        const expectPromise3: void = expect.soft(element).not.toBeDisplayed()
                        // @ts-expect-error
                        const expectPromise4: void = expect.soft(chainableElement).not.toBeDisplayed()

                        await expect.soft(element).not.toBeDisplayed()
                        await expect.soft(chainableElement).not.toBeDisplayed()
                    })

                    it('should support not with non-promise', async () => {
                        const expectVoid1: void = expect.soft(expectString).not.toBe('Test Page')

                        // @ts-expect-error
                        const expectVoid2: Promise<void> = expect.soft(expectString).not.toBe('Test Page')
                    })

                    it('should support not with promise', async () => {
                        const expectPromise1: Promise<void> = expect.soft(expectPromise).not.toBe('Test Page')

                        // @ts-expect-error
                        const expectPromise2: void = expect.soft(expectPromise).not.toBe('Test Page')

                        await expect.soft(expectPromise).not.toBe('Test Page')
                    })
                })
            })

            describe('expect.getSoftFailures', () => {
                it('should be of type `SoftFailure`', async () => {
                    const expectSoftFailure1: ExpectWebdriverIO.SoftFailure[] = expect.getSoftFailures()

                    // @ts-expect-error
                    const expectSoftFailure2: void = expect.getSoftFailures()
                })
            })

            describe('expect.assertSoftFailures', () => {
                it('should be of type void', async () => {
                    const expectVoid1: void = expect.assertSoftFailures()

                    // @ts-expect-error
                    const expectVoid2: Promise<void> = expect.assertSoftFailures()
                })
            })

            describe('expect.clearSoftFailures', () => {
                it('should be of type void', async () => {
                    const expectVoid1: void = expect.clearSoftFailures()

                    // @ts-expect-error
                    const expectVoid2: Promise<void> = expect.clearSoftFailures()
                })
            })
        })
    })
})
