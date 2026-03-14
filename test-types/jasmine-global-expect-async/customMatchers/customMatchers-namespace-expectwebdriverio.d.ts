/**
 * Custom matchers under the `ExpectWebdriverIO` namespace.
 * @see {@link https://webdriver.io/docs/custommatchers/#typescript-support}
 */
declare namespace ExpectWebdriverIO {
    interface AsymmetricMatchers {
        toBeCustom(): ExpectWebdriverIO.PartialMatcher<string>;
        toBeCustomPromise(chainableElement: ChainablePromiseElement): Promise<ExpectWebdriverIO.PartialMatcher<string>>;
    }
    interface Matchers<R, T> {
        toBeCustom(): R;
        toBeCustomPromise: T extends ChainablePromiseElement ? (expected?: string | ExpectWebdriverIO.PartialMatcher<string> | Promise<ExpectWebdriverIO.PartialMatcher<string>>) => Promise<void> : never;
    }
}