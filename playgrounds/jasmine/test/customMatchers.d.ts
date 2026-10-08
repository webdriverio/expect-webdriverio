/**
 * The custom matchers of `test/specs/globalImport/custom-matchers.test.ts`, under the `ExpectWebdriverIO` namespace.
 * With Jasmine, they are async matchers, so `await` them.
 * @see {@link https://webdriver.io/docs/custommatchers/#typescript-support}
 */
declare namespace ExpectWebdriverIO {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R, T> {
        toBeEven(): Promise<void>
        toHaveTitleLength(length: number): Promise<void>
    }
}
