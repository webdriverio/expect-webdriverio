/// <reference types="./types/expect-webdriverio.d.ts"/>

declare namespace jasmine {

    /**
     * Async matchers for Jasmine to allow the typing of `expectAsync` with WebDriverIO matchers.
     * T is the type of the actual value
     * U is the type of the expected value
     * Both T,U must stay named as they are to override the default `AsyncMatchers` type from Jasmine.
     *
     * We force Matchers to return a `Promise<void>` since Jasmine's `expectAsync` expects a promise in all cases (different from Jest)
     * With Jasmine, only custom matchers are available under `expectAsync`, and not the one from Jest `expect` Library.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface AsyncMatchers<T, U> extends ExpectWebdriverIO.CustomMatchers<Promise<void>, T> {}
}
