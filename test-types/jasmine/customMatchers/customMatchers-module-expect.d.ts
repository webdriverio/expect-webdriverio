import 'expect'

/**
 * Custom matchers under the `expect` module.
 * @see {@link https://jestjs.io/docs/expect#expectextendmatchers}
 */
declare module 'expect' {
    interface AsymmetricMatchers {
        toBeWithinRange(floor: number, ceiling: number): void
        toHaveSimpleCustomProperty(string: string): string
        toHaveCustomProperty(element: ChainablePromiseElement | WebdriverIO.Element): Promise<ExpectWebdriverIO.PartialMatcher<string>>
    }

    interface Matchers<R, T> {
        toBeWithinRange(floor: number, ceiling: number): R
        toHaveSimpleCustomProperty(string: string | ExpectWebdriverIO.PartialMatcher<string>): R
        toHaveCustomProperty:
        // Useful to typecheck the custom matcher so it is only used on elements
        T extends ChainablePromiseElement | WebdriverIO.Element ?
            (test: string | ExpectWebdriverIO.PartialMatcher<string> |
            // Needed for the custom asymmetric matcher defined above to be typed correctly
            Promise<ExpectWebdriverIO.PartialMatcher<string>>)
            // Using `never` blocks the call on non-element types
            => R : never;
    }
}