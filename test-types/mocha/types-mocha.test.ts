/* eslint-disable @typescript-eslint/no-unused-vars */
describe('type assertions', () => {

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
            const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
            // @ts-expect-error
            await expect(element).toHaveUrl('https://example.com')
        })

        it('should have ts errors when actual is an ChainableElement', async () => {
            const chainableElement = $('findMe')
            // @ts-expect-error
            await expect(chainableElement).toHaveUrl('https://example.com')
        })
    })

    describe('element type assertions', () => {
        const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
        const chainableElement = $('findMe')

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
            const booleanPromise: Promise<boolean> = Promise.resolve(true)

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
    })

    describe('boolean type assertions', () => {
        it('should not have ts errors when typing to void', async () => {
            // Expect no ts errors
            const expectToBeIsVoid: void = expect(true).toBe(true)
            const expectNotToBeIsVoid: void = expect(true).not.toBe(true)
        })

        it('should have ts errors when typing to Promise', async () => {
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = expect(true).toBe(true)
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = expect(true).not.toBe(true)
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
})
