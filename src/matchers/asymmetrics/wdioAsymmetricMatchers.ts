import { AsymmetricMatcher } from 'expect'
import { isAsymmetricMatcher, toArray } from '../../utils.js'

/**
 * Jest's expect.extend, when registering asymmetric matchers, use a CustomMatcher class to register them on the expect object, which gives no customization or hook at all.
 * Replacing the asymmetric matcher at runtime inside our matchers, given more flexibility and control over the behavior of the asymmetric matcher, especially when it comes to passing options to the asymmetric matcher.
 * @param expectedValue
 */
export const injectOptionIntoWdioAsymmetricMatchers = <T>(expectedValue: T, options: ExpectWebdriverIO.StringOptions | undefined) => {
    if (options ) {
        toArray(expectedValue).forEach((value) => {
            if (isAsymmetricMatcher(value) && 'setOptions' in value && typeof value.setOptions === 'function') {
                value.setOptions(options || {})
            }
        })
    }
}

export abstract class WdioAsymmetricMatchers<T> extends AsymmetricMatcher<T> {
    public abstract asymmetricMatch(actual: unknown): boolean

    // Required to show the asymmetric matcher in the failure message!
    public abstract toAsymmetricMatcher(): string

    // When paired with Jasmine! TODO dprevost to test this with Jasmine!
    public jasmineToString() {
        return this.toString()
    }

    // Not used by default, just a fallback!
    public toString() {
        return this.toAsymmetricMatcher()
    }
}
