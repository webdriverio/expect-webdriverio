/* eslint-disable @typescript-eslint/no-unused-vars */
describe('type assertions', () => {
    const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
    const chainableElement = $('findMe')
    const chainableArray = $$('ul>li')

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
            // Expect no ts errors
            const expectToBeIsVoid: void = expect(true).toBe(true)
            const expectNotToBeIsVoid: void = expect(true).not.toBe(true)
        })

        it('should have ts errors when typing to Promise when actual is boolean', async () => {
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = expect(true).toBe(true)
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = expect(true).not.toBe(true)
        })

        it('should not have ts errors when typing to void when actual is an awaited element or chainable', async () => {
            const isClickableElement = await element.isClickable()
            const expectPromiseVoid1: void = expect(isClickableElement).toBe(true)

            const isClickableChainable: boolean = await chainableElement.isClickable()
            const expectPromiseVoid2: void = expect(isClickableChainable).toBe(true)
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
            // TODO the below needs to return Promise<void> but currently returns void
            const expectResolvesToBeIsVoid: Promise<void> = expect(booleanPromise).resolves.toBe(true)
            const expectRejectsToBeIsVoid: Promise<void> = expect(booleanPromise).rejects.toBe(true)
        })

        it('should have ts errors when typing to Promise', async () => {
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = expect(booleanPromise).toBe(true)
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = expect(await booleanPromise).toBe(true)
        })

        it('should have ts errors when typing resolves and reject is typed to void', async () => {
            //@ts-expect-error
            const expectResolvesToBeIsVoid: void = expect(booleanPromise).resolves.toBe(true)
            //@ts-expect-error
            const expectRejectsToBeIsVoid: void = expect(booleanPromise).rejects.toBe(true)
        })
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
        const mock = browser.mock('**/api/todo*')

        it('should not have ts errors when typing to Promise', async () => {
            const expectPromise1: Promise<void> = expect(mock).toBeRequested()
            const expectPromise2: Promise<void> = expect(mock).toBeRequestedTimes(2) // await expect(mock).toBeRequestedTimes({ eq: 2 })
            const expectPromise3: Promise<void> = expect(mock).toBeRequestedTimes({ gte: 5, lte: 10 }) // request called at least 5 times but less than 11

            const expectPromise4: Promise<void> = expect(mock).toBeRequestedWith({
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

    // describe('Soft Assertions', () => {

    //     it('should not have ts errors when used with chainable', async () => {

    //         const expectString: string = await $('h1').getText()
    //         const expectVoid: void = expect.soft(expectString).toEqual('Basketball Shoes')
    //         // await expect.soft(await $('#price').getText()).toMatch(/€\d+/)

    //         // Regular assertions still throw immediately
    //         // await expect(await $('.add-to-cart').isClickable()).toBe(true)
    //     })
    // })
})
