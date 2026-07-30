import { AsymmetricMatcher } from 'expect'
import { isAsymmetricMatcher } from '../../utils.js'

/**
 * Build asymmetric matchers with options for WebdriverIO.
 * Requires new instance of asymmetric matcher to not have multiple assertions mutating the same instance with different options.
 */
export const buildWdioAsymmetricMatchersWithOptions = <T>(expectedValue: T, options: ExpectWebdriverIO.StringOptions | undefined): T => {
    if (options) {
        if (Array.isArray(expectedValue)) {
            return expectedValue.map((value) => buildOneAsymmetricMatcherWithOptions(value, options)) as unknown as T
        }
        return buildOneAsymmetricMatcherWithOptions(expectedValue, options)
    }
    return expectedValue
}

const buildOneAsymmetricMatcherWithOptions = <T>(expectedValue: T, options: ExpectWebdriverIO.StringOptions | undefined): T => {
    if (options) {
        if (isAsymmetricMatcher(expectedValue) && 'withOptions' in expectedValue && typeof expectedValue.withOptions === 'function') {
            return expectedValue.withOptions(options)
        }
    }
    return expectedValue
}

export abstract class WdioAsymmetricMatchers<T> extends AsymmetricMatcher<T> {
    public abstract asymmetricMatch(actual: unknown): boolean

    // Required to show the asymmetric matcher in the failure message!
    public abstract toAsymmetricMatcher(): string

    // Not used by default, just a fallback!
    public toString() {
        return this.toAsymmetricMatcher()
    }
}
