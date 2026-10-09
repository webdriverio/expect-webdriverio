import { stringify } from 'jest-matcher-utils'
import { WdioAsymmetricMatchers } from '../matchers/asymmetrics/asymmetricsUtils.js'
import { isOneOfMatcher } from '../matchers/asymmetrics/oneOf.js'
import { isAsymmetricMatcher, isListMatcher } from './asymmetricMatcherUtil.js'
import { isMultiRemoteMatcher } from './multiRemoteUtils.js'
import { isTrimmedByOptions, stringOptionsName } from './stringOptionsName.js'
import type { StringOptions } from '../publicTypes/options.js'

type ExpectedLeaf = string | RegExp | AsymmetricMatcher<unknown> | JasmineAsymmetricMatcher<unknown>

/**
 * An expected value in a failure message, with the string options and the verdict of the matcher for its element or
 * instance. It is only for the message: the matcher compared before, with its own comparison (each class, `asString`...).
 * - `toAsymmetricMatcher()` prints the value with the non-default string options, e.g. `ignoringCase<"Foo">`, or as before
 *   with the default options only (`"Foo"`).
 * - `asymmetricMatch()` gives the verdict and never compares again, so Jest's diff shows an element that passed as no
 *   difference, and a sticky or global RegExp is not tested a second time.
 */
export class StringOptionsMatcher extends WdioAsymmetricMatchers<ExpectedLeaf> {
    /** `actual`: the actual value of the element or instance, to name `trimmed` only when the default `trim` changed it */
    constructor(sample: ExpectedLeaf, private readonly options: StringOptions, private readonly verdict: boolean, private readonly actual?: unknown) {
        super(sample)
    }

    public asymmetricMatch(): boolean {
        return this.verdict
    }

    public toAsymmetricMatcher(): string {
        const { sample, options, actual } = this
        const trimmed = isTrimmedByOptions(actual, options)
        if (typeof sample === 'string') {
            const name = stringOptionsName(options, { trimmed })
            return name ? `${name}<${stringify(sample)}>` : stringify(sample)
        }
        if (sample instanceof RegExp) {
            // `ignoreCase` is the `i` flag of the RegExp
            const regExp = options.ignoreCase && !sample.ignoreCase ? new RegExp(sample.source, `${sample.flags}i`) : sample
            const name = stringOptionsName(options, { forRegExp: true, trimmed })
            return name ? `${name}<${regExp}>` : `${regExp}`
        }
        // An asymmetric matcher is printed as without the verdict: `expect.oneOf()` prints its own options
        if (isOneOfMatcher(sample)) {
            return sample.toAsymmetricMatcher(isTrimmedByOptions(actual, sample.options))
        }
        if ('jasmineToString' in sample && typeof sample.jasmineToString === 'function') {
            return sample.jasmineToString(stringify)
        }
        return stringify(sample)
    }
}

/** A string, a RegExp, or an asymmetric matcher for one value (not for a list, nor the per-instance values) */
const isExpectedLeaf = (value: unknown): value is ExpectedLeaf =>
    typeof value === 'string' || value instanceof RegExp
    || (isAsymmetricMatcher(value) && !isListMatcher(value) && !isMultiRemoteMatcher(value) && !(value instanceof StringOptionsMatcher))

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype

/**
 * The expected value of a failure message, where each string, RegExp or asymmetric matcher gets the string options and
 * the verdict of its element or instance. `verdict` has the shape of the actual value: a boolean for one element or
 * browser, an array for `$$()`, and per-instance values for multi-remote. Without a verdict (e.g. a structural failure),
 * the expected value does not change, except when there is no actual value (`noElementVerdict()`).
 */
export const withStringOptions = (expected: unknown, verdict: unknown, options: StringOptions | undefined, actual?: unknown): unknown =>
    // One string value stays a string: Jest's string diff shows what changed, and `enhanceError()` names the options in the label
    typeof verdict === 'boolean' && typeof expected === 'string' ? expected : wrapLeaves(expected, verdict ?? noElementVerdict(expected, actual), options, actual)

/**
 * No verdict and no actual value, e.g. an empty `$$()`: no element matched. Each expected value still gets the string
 * options in the message, as for a `$$()` with elements.
 */
const noElementVerdict = (expected: unknown, actual: unknown): unknown =>
    actual === undefined && Array.isArray(expected) ? expected.map(() => false) : undefined

const wrapLeaves = (expected: unknown, verdict: unknown, options: StringOptions | undefined, actual: unknown): unknown => {
    if (typeof verdict === 'boolean') {
        return isExpectedLeaf(expected) ? new StringOptionsMatcher(expected, options ?? {}, verdict, actual) : expected
    }
    if (Array.isArray(verdict) && Array.isArray(expected)) {
        return expected.map((value, index) => wrapLeaves(value, verdict[index], options, Array.isArray(actual) ? actual[index] : undefined))
    }
    if (isPlainObject(verdict) && isPlainObject(expected)) {
        return Object.fromEntries(Object.entries(expected).map(([name, value]) => [name, wrapLeaves(value, verdict[name], options, isPlainObject(actual) ? actual[name] : undefined)]))
    }
    return expected
}
