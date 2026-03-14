declare namespace jest {
    /**
     * Custom matchers under the `jest` namespace.
     *
     * LIMITATION: This augmentation only works for the global `expect(...)` in the Jest environment.
     * It does NOT support `expect.soft(...)` which uses the standalone `expect` types.
     *
     * For universal support, prefer augmenting `ExpectWebdriverIO` namespace.
     */
    interface Expect {
        toBeWithinRangeJest(floor: number, ceiling: number): void
        toHaveSimpleCustomPropertyJest(string: string): string
        toHaveCustomPropertyJest(element: ChainablePromiseElement | WebdriverIO.Element): Promise<ExpectWebdriverIO.PartialMatcher<string>>
    }

    interface InverseAsymmetricMatchers {
        toBeWithinRangeJest(floor: number, ceiling: number): void
        toHaveSimpleCustomPropertyJest(string: string): string
        toHaveCustomPropertyJest(element: ChainablePromiseElement | WebdriverIO.Element): Promise<ExpectWebdriverIO.PartialMatcher<string>>
    }

    interface Matchers<R, T> {
        toBeWithinRangeJest(floor: number, ceiling: number): R
        toHaveSimpleCustomPropertyJest(string: string | ExpectWebdriverIO.PartialMatcher<string>): Promise<R>
        toHaveCustomPropertyJest:
        // Useful to typecheck the custom matcher so it is only used on elements
        T extends ChainablePromiseElement | WebdriverIO.Element ?
            (test: string | ExpectWebdriverIO.PartialMatcher<string> |
                // Needed for the custom asymmetric matcher defined above to be typed correctly
                Promise<ExpectWebdriverIO.PartialMatcher<string>>)
            // Using `never` blocks the call on non-element types
            => Promise<R> : never;
    }
}
