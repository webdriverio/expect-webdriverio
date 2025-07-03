/// <reference types="./types/expect-webdriverio.d.ts"/>

/**
 * Utility type that wraps non-Promise types in a Promise for Jasmine async matchers.
 * If U is already a Promise, PromiseLike, or Chainable, return U as-is.
 * Otherwise, wrap U in a Promise<U>.
 */
type EnsurePromise<U> = U extends Promise<unknown> | PromiseLike<unknown> | WdioPromiseLike<unknown> ? U : Promise<U>

declare namespace jasmine {

    /**
     * Async matchers for Jasmine to allow the typing of `expectAsync` with WebDriverIO matchers.
     * T is the type of the actual value
     * U is the type of the expected value, which will be wrapped in a Promise if it's not already one
     * Both T,U must stay named as they are to override the default `AsyncMatchers` type from Jasmine.
     */
    interface AsyncMatchers<T, U extends Promise<void> | void> extends ExpectWebdriverIO.Matchers<EnsurePromise<U>, T> {}
}