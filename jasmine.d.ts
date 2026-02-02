/// <reference types="./types/expect-webdriverio.d.ts"/>

/**
 * Augment the Jasmine namespace to include the WDIO custom async matchers only.
 * When using the vanilla Jasmine Library, use `jasmine.addAsyncMatchers(matchers)` and specify `expect-webdriverio/jasmine` in the tsconfig.json's types.
 */

declare namespace jasmine {

    /**
     * Async matchers for Jasmine to allow the typing of `expectAsync` with WebDriverIO custom matchers.
     * T is the type of the actual value
     * U is the type of the expected value
     * Both T,U must stay named as they are to override the default `AsyncMatchers` type from Jasmine.
     *
     * We force Matchers to return a `Promise<void>` since under Jasmine's `expectAsync` everything is a promise.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface AsyncMatchers<T, U> extends ExpectWebdriverIO.CustomMatchers<Promise<void>, T> {}
}
