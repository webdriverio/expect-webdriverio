/**
 * Custom matchers under the `ExpectWebdriverIO` namespace.
 *
 * RECOMMENDED: This augmentation works universally.
 * It is supported by both the global `expect` in Jest/Jasmine AND `expect.soft`.
 *
 * @see {@link https://webdriver.io/docs/custommatchers/#typescript-support}
 */
declare namespace ExpectWebdriverIO {
    interface AsymmetricMatchers {
        toBeCustomWdio(): ExpectWebdriverIO.PartialMatcher<string>;
        toBeCustomPromiseWdio(chainableElement: ChainablePromiseElement): Promise<ExpectWebdriverIO.PartialMatcher<string>>;
    }
    interface Matchers<R, T> {
        toBeCustomWdio(): R;
        toBeCustomPromiseWdio: T extends ChainablePromiseElement ? (expected?: string | ExpectWebdriverIO.PartialMatcher<string> | Promise<ExpectWebdriverIO.PartialMatcher<string>>) => Promise<R> : never;
    }
}
