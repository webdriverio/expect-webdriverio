/// <reference types="./types/expect-webdriverio.d.ts"/>

/**
 * Augment the Jasmine namespace to match the behavior of `@wdio/jasmine-framework`.
 * Only custom WDIO matchers are available under `expectAsync`, as well as Jasmine's built-in matchers.
 * `expectAsync` is forced into the `expect` global ambient, making all Jasmine sync-matchers asynchronous.
 *
 * When using `@wdio/jasmine-framework`, specify `expect-webdriverio/jasmine-wdio-expect-async` in the tsconfig.json's types.
 */

declare namespace jasmine {

    /**
     * Async matchers for Jasmine to allow the typing of `expectAsync` with WebDriverIO matchers.
     * T is the type of the actual value
     * U is the type of the expected value
     * Both T,U must stay named as they are to override the default `AsyncMatchers` type from Jasmine.
     *
     * We force Matchers to return a `Promise<void>` since Jasmine's `expectAsync` expects a promise in all cases (different from Jest)
     */

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- U is required to properly override Jasmine's AsyncMatchers
    interface AsyncMatchers<T, U> extends ExpectWebdriverIO.Matchers<Promise<void>, T> {}

    // Needed to reference it below for the withContext method
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<T> {}
}

declare namespace ExpectWebdriverIO {

    // Should be the same as https://github.com/webdriverio/webdriverio/blob/ea0e3e00288abced4c739ff9e46c46977b7cdbd2/packages/wdio-jasmine-framework/src/index.ts#L21-L29
    interface JasmineAsymmetricMatchers extends Pick<ExpectWebdriverIO.AsymmetricMatchers, 'any' | 'anything' | 'arrayContaining' | 'objectContaining' | 'stringContaining' | 'stringMatching'> {}

    // Hack to convert all sync matchers to return Promise<void> since `wdio/jasmine-framework` forces `expect` to be async
    type JasmineSyncMatchers<T> = {
        [K in keyof jasmine.Matchers<T>]: K extends 'not'
            ? JasmineSyncMatchers<T>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            : jasmine.Matchers<T>[K] extends (...args: any) => any
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ? (...args: any[]) => Promise<void>
                : jasmine.Matchers<T>[K]
    }

    /**
     * Overrides the default WDIO expect specifically for Jasmine, since `expectAsync` is forced into `expect`, making all matchers fully asynchronous. This is not the case under Jest or Mocha.
     * Using `jasmine.AsyncMatchers` includes the WdioMatchers from above, but also allows using Jasmine's built-in matchers and the `withContext` matcher.
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
         * @param actual The value to apply matchers against.
         */
        <T = unknown>(actual: T): {
            withContext(message: string): jasmine.AsyncMatchers<T, Promise<void>> & JasmineSyncMatchers<T>;
        } & jasmine.AsyncMatchers<T, Promise<void>> & JasmineSyncMatchers<T>
    }
}

/**
 * Under `@wdio/jasmine-framework`, the global `expect` is overridden to use Jasmine's `expectAsync`.
 * It contains custom WebdriverIO matchers as well as Jasmine's built-in async & sync matchers but not the basic Jest's expect library matchers.
 */
// @ts-expect-error: IDE might flag this, but ignore it. This way the `tsc:root-types` can pass!
declare const expect: ExpectWebdriverIO.JasmineExpect
declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIO.JasmineExpect
    }
}
