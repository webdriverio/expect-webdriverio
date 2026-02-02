/**
 * Custom matchers under the `ExpectWebdriverIO` namespace.
 * @see {@link https://webdriver.io/docs/custommatchers/#typescript-support}
 */
declare namespace jasmine {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface AsyncMatchers<T, U> {
        toBeCustom(): Promise<void>;
        toBeCustomPromise: T extends ChainablePromiseElement ? (expected?: string | ExpectWebdriverIO.PartialMatcher<string> | Promise<ExpectWebdriverIO.PartialMatcher<string>>) => Promise<void> : never;
    }
}
