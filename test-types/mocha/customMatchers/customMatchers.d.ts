declare namespace ExpectWebdriverIO {
    interface AsymmetricMatchers {
        toBeCustom(): void;
    }
    interface Matchers<R, T> {
        toBeCustom(): R;
        toBeCustomPromise: T extends ChainablePromiseElement ? (expected?: string | ExpectWebdriverIO.PartialMatcher<string>) => Promise<R> : never;
    }
}