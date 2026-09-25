import type { StringOptions } from 'expect-webdriverio'
import { equals } from '../../jasmineUtils.js'
import { hasSameInstanceNames, isMultiRemoteValues, MULTI_REMOTE_MATCHER_SYMBOL } from '../../util/multiRemoteUtils.js'
import { buildWdioAsymmetricMatchersWithOptions, WdioAsymmetricMatchers } from './asymmetricsUtils.js'

/**
 * `expect.multiRemote()` holds one expected value per multi-remote instance, e.g. `{ chrome: 'A', firefox: 'B' }`.
 *
 * Multi-remote matchers unwrap it to compare each instance against its own expected value. It is the explicit form of
 * a plain per-instance object, and the only one for matchers whose expected value is itself an object (e.g. `toHaveStyle`).
 * As an asymmetric matcher, it matches an object with exactly the same instance names whose values match.
 */
export class MultiRemoteMatcher<T = unknown> extends WdioAsymmetricMatchers<MultiRemoteValues<T>> {
    readonly [MULTI_REMOTE_MATCHER_SYMBOL] = true

    constructor(sample: MultiRemoteValues<T>) {
        if (!isMultiRemoteValues(sample)) {
            throw new TypeError(`expect.multiRemote() expects an object with one expected value per multi-remote instance, e.g. { chrome: 'A', firefox: 'B' }. Received: ${String(sample)}`)
        }
        super(sample)
    }

    /** The expected value of each instance */
    public get values(): MultiRemoteValues<T> {
        return this.sample
    }

    public asymmetricMatch(actual: unknown): boolean {
        return isMultiRemoteValues(actual)
            && hasSameInstanceNames(actual, Object.keys(this.sample))
            && Object.entries(this.sample).every(([instance, expected]) => equals(actual[instance], expected))
    }

    /** Forward the matcher's string options to the per-instance values (e.g. nested `expect.oneOf()`) */
    public withOptions(options: StringOptions): MultiRemoteMatcher<T> {
        return new MultiRemoteMatcher(buildWdioAsymmetricMatchersWithOptions({ ...this.sample }, options))
    }

    public toAsymmetricMatcher(): string {
        const values = Object.entries(this.sample).map(([instance, expected]) => `${instance}: ${formatValue(expected)}`)
        return `multiRemote<${values.join(', ')}>`
    }
}

const formatValue = (value: unknown): string => {
    if (value && typeof value === 'object' && 'toAsymmetricMatcher' in value && typeof value.toAsymmetricMatcher === 'function') {
        return value.toAsymmetricMatcher()
    }
    return value instanceof RegExp ? value.toString() : JSON.stringify(value) ?? String(value)
}

export function multiRemote<T>(values: MultiRemoteValues<T>): MultiRemoteMatcher<T> {
    return new MultiRemoteMatcher(values)
}
