import 'expect'

declare module 'expect' {
    interface AsymmetricMatchers {
        toBeWithinRange(floor: number, ceiling: number): void
        toHaveSimpleCustomProperty(string: string): string
        toHaveCustomProperty(element: ChainablePromiseElement | WebdriverIO.Element): Promise<string>
    }

    interface Matchers<R, T> {
        toBeWithinRange(floor: number, ceiling: number): R
        toHaveSimpleCustomProperty(string: string | ExpectWebdriverIO.PartialMatcher<string>): Promise<R>
        toHaveCustomProperty:
        // Required to typecheck the custom matcher so it is only used on elements
        T extends ChainablePromiseElement | WebdriverIO.Element ?
            (test: string | ExpectWebdriverIO.PartialMatcher<string> |
            // Needed for the custom asymmetric matcher defined above to be typed correctly
            Promise<string>)
            // Never blocks the call on non-element types
            => Promise<R> : never;
    }
}