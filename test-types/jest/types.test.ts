/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="../../jest.d.ts" />

describe('type assertions', () => {

    describe('browser type assertions', () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        it('should not have ts errors and be able to await the promise', async () => {
            const browserExpectHaveUrlIsPromiseVoid: Promise<void> = expect(browser).toHaveUrl('https://example.com')
            await browserExpectHaveUrlIsPromiseVoid

            const browserExpectNotHaveUrlIsPromiseVoid: Promise<void> = expect(browser).not.toHaveUrl('https://example.com')
            await browserExpectNotHaveUrlIsPromiseVoid
        })

        it('should have ts errors and not need to await the promise', async () => {
            // @ts-expect-error
            const browserExpectHaveUrlIsVoid: void = expect(browser).toHaveUrl('https://example.com')
            // @ts-expect-error
            const browserExpectNotHaveUrlIsVoid: void = expect(browser).not.toHaveUrl('https://example.com')
        })
    })

    describe('element type assertions', () => {
        const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
        it('should not have ts errors and be able to await the promise', async () => {
            // expect no ts errors
            const expectIsPromiseVoid: Promise<void> = expect(element).toBeDisabled()
            await expectIsPromiseVoid

            const expectNotIsPromiseVoid: Promise<void> = expect(element).not.toBeDisabled()
            await expectNotIsPromiseVoid
        })

        it('should have ts errors when typing to void', async () => {
            // @ts-expect-error
            const expectToBeIsVoid: void = expect(element).toBeDisabled()
            // @ts-expect-error
            const expectNotToBeIsVoid: void = expect(element).not.toBeDisabled()
        })

        it('toHaveUrl should not work on element', async () => {
            // @ts-expect-error
            await expect(element).toHaveUrl('https://example.com')
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

    describe('Promise<boolean> type assertions', () => {
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
            // TODO the below needs to return Promise<void> but currently returns void
            //@ts-expect-error
            const expectResolvesToBeIsVoid: void = expect(booleanPromise).resolves.toBe(true)
            //@ts-expect-error
            const expectRejectsToBeIsVoid: void = expect(booleanPromise).rejects.toBe(true)
        })
    })

    describe('Wdio async toMatchSnapshot', () => {
        const booleanPromise: Promise<boolean> = Promise.resolve(true)

        it('should not have ts errors when typing to void', async () => {
            const expectToBeIsPromise: Promise<void> = expect($('.findme')).toMatchSnapshot()
        })

        it('should not have ts errors when typing to void', async () => {
            //@ts-expect-error
            const expectNotToBeVoid: void = expect($('.findme')).toMatchSnapshot()
        })
    })

})
