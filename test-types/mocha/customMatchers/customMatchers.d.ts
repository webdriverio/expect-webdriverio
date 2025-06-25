// Name jest is required to augment the jest.Matchers interface
declare namespace ExpectWebdriverIO {
    interface AsymmetricMatchers {
        toBeCustom(): void;
    }
    interface Matchers<R, T> {
        toBeCustom(): R;
        toBeCustomPromise: T extends ChainablePromiseElement ? (expected?: string) => Promise<R> : never;
    }
}