/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="@wdio/globals" />
/// <reference types="../../types/expect-webdriverio.d.ts" />
/// <reference types="../../types/standalone.d.ts" />

import { describe, it } from 'node:test'

describe('type assertions', () => {
    const wdioExpect = ExpectWebdriverIO.expect

    describe('browser type assertions', () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        it('should not have ts errors and be able to await the promise', async () => {
            const browserExpectHaveUrlIsPromiseVoid: Promise<void> = wdioExpect(browser).toHaveUrl('https://example.com')
            await browserExpectHaveUrlIsPromiseVoid
        })

        it('should have ts errors and not need to await the promise', async () => {
            // @ts-expect-error
            const browserExpectHaveUrlIsVoid: void = wdioExpect(browser).toHaveUrl('https://example.com')
        })
    })

    describe('element type assertions', () => {
        const element: WebdriverIO.Element = {} as unknown as WebdriverIO.Element
        it('should not have ts errors and be able to await the promise', async () => {
            // expect no ts errors
            const expectToBeIsNotPromiseVoid: Promise<void> = wdioExpect(element).toBeDisabled()
            await expectToBeIsNotPromiseVoid
        })

        it('should have ts errors when typing to void', async () => {
            // @ts-expect-error
            const expectToBeIsVoid: void = wdioExpect(element).toBeDisabled()
        })
    })

    describe('boolean type assertions', () => {
        it('should not have ts errors when typing to void', async () => {
            // Expect no ts errors
            const expectToBeIsVoid: void = wdioExpect(true).toBe(true)
        })

        it('should have ts errors when typing to Promise', async () => {
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = wdioExpect(true).toBe(true)
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
            const expectResolvesToBeIsVoid: void = wdioExpect(booleanPromise).resolves.toBe(true)
            const expectRejectsToBeIsVoid: void = wdioExpect(booleanPromise).rejects.toBe(true)

            await wdioExpect(booleanPromise).resolves.toBe(true)
            await wdioExpect(booleanPromise).rejects.toBe(true)
        })

        it('should have ts errors when typing to Promise', async () => {
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = wdioExpect(booleanPromise).toBe(true)
            //@ts-expect-error
            const expectToBeIsNotPromiseVoid: Promise<void> = wdioExpect(await booleanPromise).toBe(true)
            //@ts-expect-error
            const expectResolvesToBeIsVoid: Promise<void> = wdioExpect(booleanPromise).resolves.toBe(true)
            //@ts-expect-error
            const expectRejectsToBeIsVoid: Promise<void> = wdioExpect(booleanPromise).rejects.toBe(true)
        })
    })
})
