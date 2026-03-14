import 'expect'

/**
 * Custom matchers under the `expect` module.
 * @see {@link https://jestjs.io/docs/expect#expectextendmatchers}
 */
declare module 'expect' {
    interface AsymmetricMatchers {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toBeWithinRange(floor: number, ceiling: number): any
        toHaveSimpleCustomProperty(string: string): string
        toHaveCustomProperty(element: ChainablePromiseElement | WebdriverIO.Element): Promise<ExpectWebdriverIO.PartialMatcher<string>>
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R, T> {
        // Custom matchers in Jasmine need to return a Promise, potential breaking change to document
        toBeWithinRange(floor: number, ceiling: number): Promise<void>
        toHaveSimpleCustomProperty(string: string | ExpectWebdriverIO.PartialMatcher<string>): Promise<void>
        toHaveCustomProperty:
        // Useful to typecheck the custom matcher so it is only used on elements
        T extends ChainablePromiseElement | WebdriverIO.Element ?
            (test: string | ExpectWebdriverIO.PartialMatcher<string> |
            // Needed for the custom asymmetric matcher defined above to be typed correctly
            Promise<ExpectWebdriverIO.PartialMatcher<string>>)
            // Using `never` blocks the call on non-element types
            => Promise<void> : never;
    }
}