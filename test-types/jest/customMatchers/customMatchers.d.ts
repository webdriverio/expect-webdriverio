declare namespace ExpectWebdriverIO {

    // TODO dprevost: ensure we still allow custom asymmetric matchers
    interface AsymmetricMatchers {
        toBeCustom(): void;
    }
    interface Matchers<R, T> {
        toBeCustom(): R;
        toBeCustomPromise: T extends ChainablePromiseElement ? (expected?: string) => Promise<R> : never;
    }
}