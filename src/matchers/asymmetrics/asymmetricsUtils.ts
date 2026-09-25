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
        // Multi-remote per-instance values, e.g. `{ chrome: expect.oneOf(...), firefox: [expect.oneOf(...)] }`
        if (isPlainObject(expectedValue)) {
            return Object.fromEntries(Object.entries(expectedValue).map(([key, value]) => [key, buildWdioAsymmetricMatchersWithOptions(value, options)])) as T
        }
        return buildOneAsymmetricMatcherWithOptions(expectedValue, options)
    }
    return expectedValue
}

/** Only rebuild plain objects: class instances (e.g. `Date`) and asymmetric matchers must be kept as is */
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    if (typeof value !== 'object' || value === null || isAsymmetricMatcher(value)) {
        return false
    }
    const prototype = Object.getPrototypeOf(value)
    return prototype === Object.prototype || prototype === null
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
