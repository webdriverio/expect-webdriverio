import 'expect'

/**
 * Custom matchers under the `expect` module.
 *
 * LIMITATION: This augmentation get apply only on `expect.soft(...)`.
 * It does NOT affect the global `expect(...)` in Jest which uses `namespace jest`.
 *
 * For universal support, prefer augmenting `ExpectWebdriverIO` namespace.
 *
 * @see {@link https://jestjs.io/docs/expect#expectextendmatchers}
 */
declare module 'expect' {
    interface AsymmetricMatchers {
        toBeWithinRangeExpect(floor: number, ceiling: number): void
        toHaveSimpleCustomPropertyExpect(string: string): string
        toHaveCustomPropertyExpect(element: ChainablePromiseElement | WebdriverIO.Element): Promise<ExpectWebdriverIO.PartialMatcher<string>>
    }

    interface Matchers<R, T> {
        toBeWithinRangeExpect(floor: number, ceiling: number): R
        toHaveSimpleCustomPropertyExpect(string: string | ExpectWebdriverIO.PartialMatcher<string>): Promise<R>
        toHaveCustomPropertyExpect:
        // Useful to typecheck the custom matcher so it is only used on elements
        T extends ChainablePromiseElement | WebdriverIO.Element ?
            (test: string | ExpectWebdriverIO.PartialMatcher<string> |
            // Needed for the custom asymmetric matcher defined above to be typed correctly
            Promise<ExpectWebdriverIO.PartialMatcher<string>>)
            // Using `never` blocks the call on non-element types
            => Promise<R> : never;
    }
}
