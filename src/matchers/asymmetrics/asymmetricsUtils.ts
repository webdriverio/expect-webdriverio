import { AsymmetricMatcher } from 'expect'
import { isAsymmetricMatcher, toArray } from '../../utils.js'

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
