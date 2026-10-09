import { AsymmetricMatcher } from 'expect'
import { isAsymmetricMatcher } from '../../util/asymmetricMatcherUtil.js'
import { assertOnePositionOption } from '../../util/compareText.js'
import type { StringOptions } from '../../publicTypes/options.js'

/**
 * Build asymmetric matchers with options for WebdriverIO.
 * Requires new instance of asymmetric matcher to not have multiple assertions mutating the same instance with different options.
 */
export const buildWdioAsymmetricMatchersWithOptions = <T>(expectedValue: T, options: StringOptions | undefined): T => {
    if (options) {
        // Each string matcher applies its options here first: a wrong use throws before any element is read
        assertOnePositionOption(options)
        return withOptions(expectedValue, options, new WeakMap()) as T
    }
    return expectedValue
}

/**
 * Apply the options in the values of `$$()` (e.g. the styles of `toHaveStyle([{ display: expect.oneOf('block') }])`) and
 * in per-instance values (e.g. `{ chrome: expect.oneOf(...), firefox: [expect.oneOf(...)] }`). `built` keeps the copy of
 * each array and object: a value that refers back to itself, e.g. an object property, keeps its shape for `equals()`.
 */
const withOptions = (expectedValue: unknown, options: StringOptions, built: WeakMap<object, unknown>): unknown => {
    if (!Array.isArray(expectedValue) && !isPlainObject(expectedValue)) {
        return buildOneAsymmetricMatcherWithOptions(expectedValue, options)
    }
    if (built.has(expectedValue)) {
        return built.get(expectedValue)
    }
    if (Array.isArray(expectedValue)) {
        const copy: unknown[] = []
        built.set(expectedValue, copy)
        copy.push(...expectedValue.map((value) => withOptions(value, options, built)))
        return copy
    }
    const copy: Record<string, unknown> = {}
    built.set(expectedValue, copy)
    for (const [key, value] of Object.entries(expectedValue)) {
        copy[key] = withOptions(value, options, built)
    }
    return copy
}

/** Only rebuild plain objects: class instances (e.g. `Date`) and asymmetric matchers must be kept as is */
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    if (typeof value !== 'object' || value === null || isAsymmetricMatcher(value)) {
        return false
    }
    const prototype = Object.getPrototypeOf(value)
    return prototype === Object.prototype || prototype === null
}

const buildOneAsymmetricMatcherWithOptions = <T>(expectedValue: T, options: StringOptions | undefined): T => {
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
