// TODO dprevost should we review this to have the wdio namespace or maybe the expect namespace?
// Name jest is required to augment the jest.Matchers interface
declare namespace jest {
    interface AsymmetricMatchers {
        toBeCustom(): void;
    }
    interface Matchers<R, T> {
        toBeCustom(): R;
        toBeCustomPromise: T extends ChainablePromiseElement ? (expected?: object) => Promise<R> : never;
    }
}