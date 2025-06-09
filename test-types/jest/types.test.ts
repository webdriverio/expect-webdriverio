/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="@wdio/globals" />
/// <reference types="../../types/expect-webdriverio.d.ts" />
/// <reference types="../../types/standalone.d.ts" />

describe('type assertions', () => {
    const wdioExpect = ExpectWebdriverIO.expect

    describe('browser type assertions', () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        it('should not have ts errors and be able to await the promise', async () => {
            const browserExpectHaveUrlIsPromiseVoid: Promise<void> = wdioExpect(browser).toHaveUrl('https://example.com')
            await browserExpectHaveUrlIsPromiseVoid

            const browserExpectNotHaveUrlIsPromiseVoid: Promise<void> = wdioExpect(browser).not.toHaveUrl('https://example.com')
            await browserExpectNotHaveUrlIsPromiseVoid
        })

        it('should have ts errors and not need to await the promise', async () => {
            // @ts-expect-error
            const browserExpectHaveUrlIsVoid: void = wdioExpect(browser).toHaveUrl('https://example.com')
            // @ts-expect-error
            const browserExpectNotHaveUrlIsVoid: void = wdioExpect(browser).not.toHaveUrl('https://example.com')
        })
    })

    describe('element type assertions', () => {
        const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
        it('should not have ts errors and be able to await the promise', async () => {
            // expect no ts errors
            const expectIsPromiseVoid: Promise<void> = wdioExpect(element).toBeDisabled()
            await expectIsPromiseVoid

            const expectNotIsPromiseVoid: Promise<void> = wdioExpect(element).not.toBeDisabled()
            await expectNotIsPromiseVoid
        })

        it('should have ts errors when typing to void', async () => {
            // @ts-expect-error
            const expectToBeIsVoid: void = wdioExpect(element).toBeDisabled()
            // @ts-expect-error
            const expectNotToBeIsVoid: void = wdioExpect(element).not.toBeDisabled()
        })
    })

    describe('boolean type assertions', () => {
        it('should not have ts errors when typing to void', async () => {
            // Expect no ts errors
            const expectToBeIsVoid: void = wdioExpect(true).toBe(true)
            const expectNotToBeIsVoid: void = wdioExpect(true).not.toBe(true)
        })

        it('should have ts errors when typing to Promise', async () => {
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = wdioExpect(true).toBe(true)
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = wdioExpect(true).not.toBe(true)
        })
    })

    describe('string type assertions', () => {
        it('should not have ts errors when typing to void', async () => {
            // Expect no ts errors
            const expectToBeIsVoid: void = wdioExpect('test').toBe('test')
        })

        it('should have ts errors when typing to Promise', async () => {
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = wdioExpect('test').toBe('test')
        })
    })

    describe('Promise<boolean> type assertions', () => {
        const booleanPromise: Promise<boolean> = Promise.resolve(true)

        it('should not have ts errors when typing to void', async () => {
            const expectToBeIsVoid: void = wdioExpect(booleanPromise).toBe(true)
            const expectAwaitToBeIsVoid: void = wdioExpect(await booleanPromise).toBe(true)
        })

        it('should not have ts errors when resolves and rejects is typed to Promise<void>', async () => {
            // TODO the below needs to return Promise<void> but currently returns void
            const expectResolvesToBeIsVoid: Promise<void> = wdioExpect(booleanPromise).resolves.toBe(true)
            const expectRejectsToBeIsVoid: Promise<void> = wdioExpect(booleanPromise).rejects.toBe(true)
        })

        it('should have ts errors when typing to Promise', async () => {
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = wdioExpect(booleanPromise).toBe(true)
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = wdioExpect(await booleanPromise).toBe(true)
        })

        it('should have ts errors when typing resolves and reject is typed to void', async () => {
            // TODO the below needs to return Promise<void> but currently returns void
            //@ts-expect-error
            const expectResolvesToBeIsVoid: void = wdioExpect(booleanPromise).resolves.toBe(true)
            //@ts-expect-error
            const expectRejectsToBeIsVoid: void = wdioExpect(booleanPromise).rejects.toBe(true)
        })
    })
})
