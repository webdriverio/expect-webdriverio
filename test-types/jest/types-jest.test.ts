/* eslint-disable @typescript-eslint/no-unused-vars */

describe('type assertions', async () => {
    const chainableElement: ChainablePromiseElement = $('findMe')
    const chainableArray: ChainablePromiseArray = $$('ul>li')
    const element: WebdriverIO.Element = await chainableElement?.getElement()
    // TODO dprevost: Need more test with this type?
    // const ElementArray: WebdriverIO.ElementArray = await chainableArray?.getElements()

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
                expectPromiseVoid = expect(browser).toHaveUrl(expect.any(String))
                expectPromiseVoid = expect(browser).toHaveUrl(expect.anything())
                // TODO add more asymmetric matchers

                // @ts-expect-error
                expectVoid = expect(browser).toHaveUrl('https://example.com')
                // @ts-expect-error
                expectVoid = expect(browser).not.toHaveUrl('https://example.com')
                // @ts-expect-error
                expectVoid = expect(browser).toHaveUrl(expect.stringContaining('WebdriverIO'))
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
    })

    describe('element', () => {

        describe('toBeDisabled', () => {
            it('should be supported correctly', async () => {
                // Element
                expectPromiseVoid = expect(element).toBeDisabled()
                expectPromiseVoid = expect(element).not.toBeDisabled()

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

                expectPromiseVoid = expect(element).not.toHaveText('text')

                // @ts-expect-error
                expectVoid = expect(element).toHaveText('text')
                // @ts-expect-error
                await expect(element).toHaveText(6)

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

        describe('toMatchSnapshot', () => {

            it('should be supported correctly', async () => {
                expectPromiseVoid = expect(element).toMatchSnapshot()
                expectPromiseVoid = expect(element).toMatchSnapshot('test label')
                expectPromiseVoid = expect(element).not.toMatchSnapshot('test label')

                expectPromiseVoid = expect(chainableElement).toMatchSnapshot()
                expectPromiseVoid = expect(chainableElement).toMatchSnapshot('test label')
                expectPromiseVoid = expect(chainableElement).not.toMatchSnapshot('test label')

                //@ts-expect-error
                expectVoid = expect(element).toMatchSnapshot()
                //@ts-expect-error
                expectVoid = expect(element).not.toMatchSnapshot()
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
                expectPromiseVoid = expect(element).toMatchInlineSnapshot()
                expectPromiseVoid = expect(element).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = expect(element).toMatchInlineSnapshot('test snapshot', 'test label')

                expectPromiseVoid = expect(chainableElement).toMatchInlineSnapshot()
                expectPromiseVoid = expect(chainableElement).toMatchInlineSnapshot('test snapshot')
                expectPromiseVoid = expect(chainableElement).toMatchInlineSnapshot('test snapshot', 'test label')

                //@ts-expect-error
                expectVoid = expect(element).toMatchInlineSnapshot()
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

    describe('toBe', () => {

        it('should expect void type when actual is a boolean', async () => {
            expectVoid = expect(true).toBe(true)
            expectVoid = expect(true).not.toBe(true)

            //@ts-expect-error
            expectPromiseVoid = expect(true).toBe(true)
            //@ts-expect-error
            expectPromiseVoid = expect(true).not.toBe(true)
        })

        it('should not expect Promise when actual is a chainable since toBe is not supported', async () => {
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

    describe('Jest original Matchers', () => {
        const propertyMatchers: Partial<{}> = {}
        const snapshotName: string = 'test-snapshot'
        describe('toMatchSnapshot', () => {

            it('should have original jest Matcher still works', async () => {
                expectVoid = expect(element).toMatchSnapshot(propertyMatchers)
                expectVoid = expect(element).toMatchSnapshot(propertyMatchers, snapshotName)
                expectVoid = expect(element).toMatchInlineSnapshot(propertyMatchers)
                expectVoid = expect(element).toMatchInlineSnapshot(propertyMatchers, snapshotName)

                expectVoid = expect(element).not.toMatchSnapshot(propertyMatchers)
                expectVoid = expect(element).not.toMatchSnapshot(propertyMatchers, snapshotName)
                expectVoid = expect(element).not.toMatchInlineSnapshot(propertyMatchers)
                expectVoid = expect(element).not.toMatchInlineSnapshot(propertyMatchers, snapshotName)

                // @ts-expect-error
                expectPromiseVoid = expect(element).toMatchSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = expect(element).toMatchSnapshot(propertyMatchers, snapshotName)
                // @ts-expect-error
                expectPromiseVoid = expect(element).toMatchInlineSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = expect(element).toMatchInlineSnapshot(propertyMatchers, snapshotName)
                // @ts-expect-error
                expectPromiseVoid = expect(element).not.toMatchSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = expect(element).not.toMatchSnapshot(propertyMatchers, snapshotName)
                // @ts-expect-error
                expectPromiseVoid = expect(element).not.toMatchInlineSnapshot(propertyMatchers)
                // @ts-expect-error
                expectPromiseVoid = expect(element).not.toMatchInlineSnapshot(propertyMatchers, snapshotName)
            })
        })
    })

    describe('Promise type assertions', () => {
        const booleanPromise: Promise<boolean> = Promise.resolve(true)

        it('should expect a Promise of type', async () => {
            const expectPromiseBoolean1: jest.JestMatchers<Promise<boolean>> = expect(booleanPromise)
            const expectPromiseBoolean2: jest.Matchers<void, Promise<boolean>> = expect(booleanPromise).not

            // @ts-expect-error
            const expectPromiseBoolean3: jest.JestMatchers<boolean> = expect(booleanPromise)
            //// @ts-expect-error
            // const expectPromiseBoolean4: jest.Matchers<void, boolean> = expect(booleanPromise).not
        })

        it('should work with resolves & rejects correctly', async () => {
            expectPromiseVoid = expect(booleanPromise).resolves.toBe(true)
            expectPromiseVoid = expect(booleanPromise).rejects.toBe(true)

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
        const promiseNetworkMock = browser.mock('**/api/todo*')

        it('should not have ts errors when typing to Promise', async () => {
            expectPromiseVoid = expect(promiseNetworkMock).toBeRequested()
            expectPromiseVoid = expect(promiseNetworkMock).toBeRequestedTimes(2) // await expect(mock).toBeRequestedTimes({ eq: 2 })
            expectPromiseVoid = expect(promiseNetworkMock).toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11

            expectPromiseVoid = expect(promiseNetworkMock).not.toBeRequested()
            expectPromiseVoid = expect(promiseNetworkMock).not.toBeRequestedTimes(2) // await expect(mock).toBeRequestedTimes({ eq: 2 })
            expectPromiseVoid = expect(promiseNetworkMock).not.toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11

            expectPromiseVoid = expect(promiseNetworkMock).toBeRequestedWith({
                url: 'http://localhost:8080/api/todo',          // [optional] string | function | custom matcher
                method: 'POST',                                 // [optional] string | array
                statusCode: 200,                                // [optional] number | array
                requestHeaders: { Authorization: 'foo' },       // [optional] object | function | custom matcher
                responseHeaders: { Authorization: 'bar' },      // [optional] object | function | custom matcher
                postData: { title: 'foo', description: 'bar' }, // [optional] object | function | custom matcher
                response: { success: true },                    // [optional] object | function | custom matcher
            })

            expectPromiseVoid = expect(promiseNetworkMock).toBeRequestedWith(expect.objectContaining({
                response: { success: true },                    // [optional] object | function | custom matcher
            }))
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
                url: 'http://localhost:8080/api/todo',          // [optional] string | function | custom matcher
                method: 'POST',                                 // [optional] string | array
                statusCode: 200,                                // [optional] number | array
                requestHeaders: { Authorization: 'foo' },       // [optional] object | function | custom matcher
                responseHeaders: { Authorization: 'bar' },      // [optional] object | function | custom matcher
                postData: { title: 'foo', description: 'bar' }, // [optional] object | function | custom matcher
                response: { success: true },                    // [optional] object | function | custom matcher
            })

            // @ts-expect-error
            expectVoid = expect(promiseNetworkMock).toBeRequestedWith(expect.objectContaining({
                response: { success: true },                    // [optional] object | function | custom matcher
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
            expect.arrayContaining(['WebdriverIO', 'Test'])
            expect.objectContaining({ name: 'WebdriverIO' })

            expect.anything()
            expect.any(Function)
            expect.any(Number)
            expect.any(Boolean)
            expect.any(String)
            expect.any(Symbol)
            expect.any(Date)
            expect.any(Error)

            expect.not.stringContaining('WebdriverIO')
            expect.not.arrayContaining(['WebdriverIO', 'Test'])
            expect.not.objectContaining({ name: 'WebdriverIO' })

            expect.not.anything()
            expect.not.any(Function)
            expect.not.any(Number)
            expect.not.any(Boolean)
            expect.not.any(String)
            expect.not.any(Symbol)
            expect.not.any(Date)
            expect.not.any(Error)
        })

        describe('Soft Assertions', async () => {
            const actualString: string = await $('h1').getText()
            const actualPromiseString: Promise<string> = $('h1').getText()

            describe('expect.soft', () => {
                it('should not need to be awaited/be a promise if actual is non-promise type', async () => {
                    const expectWdioMatcher1: WdioMatchers<void, string> = expect.soft(actualString)
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
                    const expectWdioMatcher1: jest.MatcherAndInverse<Promise<void>, Promise<string>> = expect.soft(actualPromiseString)
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
                    const expectElement: WdioMatchers<void, WebdriverIO.Element> = expect.soft(element)
                    const expectElementChainable: WdioMatchers<void, typeof chainableElement> = expect.soft(chainableElement)

                    // @ts-expect-error
                    const expectElement2: WdioMatchers<Promise<void>, WebdriverIO.Element> = expect.soft(element)
                    // @ts-expect-error
                    const expectElementChainable2: WdioMatchers<Promise<void>, typeof chainableElement> = expect.soft(chainableElement)
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
})
