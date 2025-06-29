declare namespace ExpectWebdriverIO {
    // TODO dprevost: This is not working probably because we need to redefine the asymmetric matchers in the ExpectWebdriverIO namespace so we use that namespace instead of the ExpectLib namespace.
    // But will that breaks the `declare module 'expect'` way?
    interface AsymmetricMatchers {
        toBeCustom(): void;
        toBeCustomPromise(chainableElement: ChainablePromiseElement): Promise<ExpectWebdriverIO.PartialMatcher<string>>;
    }
    interface Matchers<R, T> {
        toBeCustom(): R;
        toBeCustomPromise: T extends ChainablePromiseElement ? (expected?: string | ExpectWebdriverIO.PartialMatcher<string> | Promise<string | ExpectWebdriverIO.PartialMatcher<string>>) => Promise<R> : never;
    }
}