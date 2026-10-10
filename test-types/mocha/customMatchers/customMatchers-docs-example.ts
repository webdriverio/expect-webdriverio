/**
 * The TypeScript example of `docs/CustomMatchers.md`, as is: keep both in sync.
 */
declare global {
    namespace ExpectWebdriverIO {
        interface Matchers<R, T> {
            // A matcher for any value
            toBeWithinRange(floor: number, ceiling: number): R
            // An async matcher for elements only: `never` blocks it on other values
            toHaveDataState: T extends ChainablePromiseElement | WebdriverIO.Element
                ? (state: string | ExpectWebdriverIO.PartialMatcher<string>, options?: ExpectWebdriverIO.CommandOptions) => Promise<R>
                : never
        }

        interface AsymmetricMatchers {
            // The asymmetric form: `expect.toBeWithinRange(1, 10)`
            toBeWithinRange(floor: number, ceiling: number): ExpectWebdriverIO.PartialMatcher<number>
        }
    }
}

export {}
