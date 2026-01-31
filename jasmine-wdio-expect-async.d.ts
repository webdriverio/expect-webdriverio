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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- U is required to properly override Jasmine's AsyncMatchers
    interface AsyncMatchers<T, U> extends ExpectWebdriverIO.CustomMatchers<Promise<void>, T> {}
}

declare namespace ExpectWebdriverIO {

    // Should be the same as https://github.com/webdriverio/webdriverio/blob/ea0e3e00288abced4c739ff9e46c46977b7cdbd2/packages/wdio-jasmine-framework/src/index.ts#L21-L29
    interface JasmineAsymmetricMatchers extends Pick<ExpectWebdriverIO.AsymmetricMatchers, 'any' | 'anything' | 'arrayContaining' | 'objectContaining' | 'stringContaining' | 'stringMatching'> {}

    /**
     * Overrides the default WDIO expect specifically for Jasmine, since `expectAsync` is forced into `expect`, making all matchers fully asynchronous. This is not the case under Jest or Mocha.
     * Using `jasmine.AsyncMatchers` pull on WdioMatchers above but also allow to using Jasmine's built-in matchers and also `withContext` matcher.
     */
    interface JasmineExpect extends ExpectWebdriverIO.JasmineAsymmetricMatchers, ExpectLibInverse<ExpectWebdriverIO.JasmineAsymmetricMatchers> {
        /**
         * The `expect` function is used every time you want to test a value.
         * You will rarely call `expect` by itself.
         *
         * expect function declaration contains two generics:
         *  - T: the type of the actual value, e.g. any type, not just WebdriverIO.Browser or WebdriverIO.Element
         *  - R: the type of the return value, e.g. Promise<void> or void
         *
         * Note: The function must stay here in the namespace to overwrite correctly the expect function from the expect library.
         *
         * @param actual The value to apply matchers against.
         */
        <T = unknown>(actual: T): {
            withContext(message: string): jasmine.AsyncMatchers<T, U> & jasmine.Matchers<T>;
        } & jasmine.AsyncMatchers<T, void> & jasmine.Matchers<T>
    }
}

//// @ts-expect-error: IDE might flags this one but just does be concerned by it. This way the `tsc:root-types` can pass!
declare const expect: ExpectWebdriverIO.JasmineExpect
declare namespace NodeJS {
    interface Global {
        /**
         * Under `@wdio/jasmine-framework`, the global `expect` is overridden to use Jasmine's expectAsync.
         * It contains custom WebdriverIO matchers as well as Jasmine's async & sync matchers but not the basic Jest's expect library matchers.
         */
        expect: ExpectWebdriverIO.JasmineExpect
    }
}
