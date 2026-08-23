import deepEql from 'deep-eql'
import type { ParsedCSSValue } from 'webdriverio'

import { expect } from 'expect'

import type { MaybeSomeWdioElementOrArrayMaybePromise } from './types.js'
import { wrapExpectedWithArray } from './util/elementsUtil.js'
import type { CompareResult } from './util/executeCommand.js'
import { executeCommandWithStrategy } from './util/executeCommand.js'
import { enhanceError, enhanceErrorBe } from './util/formatMessage.js'
import { waitUntil } from './util/waitUntil.js'
import { DEFAULT_FEATURE_FLAGS } from './constants.js'
import { isOneOfMatcher, OneOfMatcher } from './matchers/asymmetrics/oneOf.js'

export function isJasmineStringAsymmetricMatcher<T>(expected: unknown): expected is JasmineAsymmetricMatcher<T> {
    return isAsymmetricMatcher(expected) && !('toAsymmetricMatcher' in expected) && 'jasmineToString' in expected && typeof expected.jasmineToString === 'function'
}

export function isAsymmetricMatcher<T>(expected: unknown): expected is WdioAsymmetricMatcher<T> | JasmineAsymmetricMatcher<T> | ExpectWebdriverIO.PartialMatcherAnything {
    return (
        typeof expected === 'object' &&
        !!expected &&
        'asymmetricMatch' in expected &&
        !!expected.asymmetricMatch
    )
}

export function isStringContainingMatcherLike(expected: unknown): expected is WdioAsymmetricMatcher<string> | JasmineStringAsymmetricMatcher<string> {
    return !!expected && expected.constructor.name === 'StringContaining'
}

/**
 * Detect `not.stringContaining` matcher. Jasmine does not have an inverse stringContaining matcher.
 */
export function isInversedStringContainingMatcher(expected: unknown): expected is WdioAsymmetricMatcher<string> {
    return isStringContainingMatcherLike(expected) && (expected as WdioAsymmetricMatcher<string>).inverse === true
}

export function isStringMatchingMatcherLike(expected: unknown): expected is WdioAsymmetricMatcher<string | RegExp> | JasmineStringMatchingAsymmetricMatcher<string | RegExp> {
    return !!expected && expected.constructor.name === 'StringMatching'
}

/**
 * Detect `not.stringMatching` matcher. Jasmine does not have an inverse stringMatching matcher.
 */
export function isInversedStringMatchingMatcher(expected: unknown): expected is WdioAsymmetricMatcher<string | RegExp> {
    return isStringMatchingMatcherLike(expected) && (expected as WdioAsymmetricMatcher<string | RegExp>).inverse === true
}

export function getStringAsymmetricMatcherValue(
    expected: WdioAsymmetricMatcher<string> | JasmineStringAsymmetricMatcher<string>
): string | RegExp {
    if ('expected' in expected) {
        return expected.expected // Jasmine string containing asymmetric matcher
    } else if ('regexp' in expected) {
        return expected.regexp // Jasmine string matching asymmetric matcher
    } else if ('sample' in expected) {
        return expected.sample // WdioAsymmetricMatcher
    }
    throw new Error(`Could not extract value from asymmetric matcher: ${expected}. Please report this issue to the expect-webdriverio maintainers.`)
}

export function getAsymmetricMatcherValue<T>(
    expected: AsymmetricMatcher<T> | ExpectWebdriverIO.PartialMatcherAnything | JasmineAsymmetricMatcher<T>
): string | RegExp | T | undefined {
    if ('expected' in expected) {
        return expected.expected // Jasmine string containing asymmetric matcher
    } else if ('expectedObject' in expected) {
        return expected.expectedObject // Jasmine any asymmetric matcher
    } else if ('regexp' in expected) {
        return expected.regexp // Jasmine string matching asymmetric matcher
    } else if ('sample' in expected) {
        return expected.sample // WdioAsymmetricMatcher
    }

    // Jasmine anything, truthy, falsy, empty, notEmpty asymmetric matchers do not have a sample or expected value. So cannot throw an error here. Return undefined to indicate that there is no value to extract.
    return undefined
}

async function executeCommandBe(
    received: MaybeSomeWdioElementOrArrayMaybePromise,
    command: (el: WebdriverIO.Element) => Promise<boolean>,
    options: ExpectWebdriverIO.CommandOptions = {}
): ExpectWebdriverIO.AsyncAssertionResult {
    const { isNot, verb = 'be', allowEmptyElements = false } = this

    const { success: pass, actual, subject, context: { isSome } = {} } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy({
                unresolvedElements: received,
                expectedValues: true,
                singleElementCompare: async (element) => {
                    const result = await command(element)
                    return { success: result, actual: result }
                },
                context: { isNot, iteration },
                strictConfiguration: { allowEmptyElements },

            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceErrorBe(subject, actual, { ...this, verb, isSome }, options)

    return {
        pass,
        message: () => message,
    }
}

/**
 * @deprecated not longer used in v6.0.0, replaced by `NumberMatcher.match()`. To remove in v8.0.0
 * @see src/util/numberOptionsUtil.ts#NumberMatcher.match
 */
/* v8 ignore next */
const compareNumbers = (actual: number, options: ExpectWebdriverIO.NumberOptions = {}): boolean => {
    // Equals case
    if (typeof options.eq === 'number') {
        return actual === options.eq
    }

    // Greater than or equal AND less than or equal case
    if (typeof options.gte === 'number' && typeof options.lte === 'number') {
        return actual >= options.gte && actual <= options.lte
    }

    // Greater than or equal case
    if (typeof options.gte === 'number') {
        return actual >= options.gte
    }

    // Less than or equal case
    if (typeof options.lte === 'number') {
        return actual <= options.lte
    }

    return false
}

export const compareTextOrArray = (
    actualText: string,
    expectedTexts: MaybeArrayOrOneOf<string | RegExp | WdioAsymmetricMatcher<string> | JasmineAsymmetricMatcher<string>> | undefined,
    options: ExpectWebdriverIO.StringOptions
): CompareResult<string> => {
    if (expectedTexts === undefined) {
        return { actual: actualText, success: false }
    }

    /**
     * @deprecated path
     * Since the strict-index based matching, comparing array is deprecated and will be removed in v8.0.0.
     * Instead the `expect.oneOf()` asymmetric matcher should be used to compare against multiple expected values.
     */
    if (Array.isArray(expectedTexts)) {
        if (expectedTexts.some((expected): expected is OneOfMatcher => isOneOfMatcher(expected))) {
            throw new Error('OneOf is not supported in array under legacy behavior. Please enable `useToHaveTextStrictMultiElementsCompareStrategy` feature flag to use the new strict index based matching strategy with `expect.oneOf()`.')
        } else {
            console.warn('Array of expected values is deprecated. Please use `expect.oneOf()` asymmetric matcher to compare against multiple expected values. This will be removed in v8.0.0.')
            // TODO one day consolidate typing and internal of oneOf so we do not need the below casting!
            expectedTexts = new OneOfMatcher(...expectedTexts as Array<string | RegExp | AsymmetricMatcher<string>>).withOptions(options)
        }
    }

    if (isOneOfMatcher(expectedTexts)) {
        return { success: expectedTexts.asymmetricMatch(actualText), actual: actualText }
    }

    // TODO one day consolidate typing and internal of oneOf so we do not need the below casting!
    const compareResults = compareText(actualText, expectedTexts as string | RegExp, options)

    return { success: compareResults.success, actual: actualText }

}

// TODO one day turn this into at least a asymetrics class to better report in failure messages the string case we are in (containing, atStart, atEnd, atIndex, etc) and the expected value(s)
export const compareText = (
    actual: string,
    expected: string | RegExp | WdioAsymmetricMatcher<string> | JasmineAsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything | null | undefined,
    {
        ignoreCase = false,
        trim = true,
        containing = false,
        atStart = false,
        atEnd = false,
        atIndex,
        replace,
    }: ExpectWebdriverIO.StringOptions
): CompareResult<string> => {
    if (typeof actual !== 'string' || expected === null || expected === undefined) {
        return {
            actual,
            success: false,
        }
    }

    if (trim) {
        actual = actual.trim()
    }
    if (Array.isArray(replace)) {
        actual = replaceActual(replace, actual)
    }

    // a RegExp expected value (bare or wrapped in stringMatching) expresses case-insensitivity via
    // its own `i` flag (added below), so `actual` is left in its original case for it - lowercasing
    // first can corrupt characters with special casing (e.g. Turkish İ expands to two code points
    // via toLowerCase()), silently breaking otherwise-correct matches.
    if (ignoreCase) {
        if (typeof expected === 'string') {
            actual = actual.toLowerCase()
            expected = expected.toLowerCase()
        } else if (expected instanceof RegExp) {
            expected = withIgnoreCaseFlag(expected)
        } else if (isStringContainingMatcherLike(expected)) {
            actual = actual.toLowerCase()
            const sample = getStringAsymmetricMatcherValue(expected).toString().toLocaleLowerCase()
            expected = (isInversedStringContainingMatcher(expected)
                ? expect.not.stringContaining(sample)
                : expect.stringContaining(sample)) as WdioAsymmetricMatcher<string>
        } else if (isStringMatchingMatcherLike(expected)) {
            // stringMatching's sample is regex source regardless of whether it was given as a
            // string or a RegExp instance, so lowercasing it as if it were literal text would
            // corrupt regex escapes (e.g. `\D` -> `\d` flips "non-digit" to "digit"). Build/extend
            // a RegExp and add the `i` flag instead - `actual` stays in its original case, same as
            // the bare RegExp branch above.
            const sample = getStringAsymmetricMatcherValue(expected as WdioAsymmetricMatcher<string> | JasmineStringAsymmetricMatcher<string>)
            const caseInsensitiveSample = withIgnoreCaseFlag(sample instanceof RegExp ? sample : new RegExp(sample))
            expected = (isInversedStringMatchingMatcher(expected)
                ? expect.not.stringMatching(caseInsensitiveSample)
                : expect.stringMatching(caseInsensitiveSample)) as WdioAsymmetricMatcher<string>
        } else {
            actual = actual.toLowerCase()
        }
    }

    if (isAsymmetricMatcher(expected)) {
        const result = expected.asymmetricMatch(actual)
        return {
            actual,
            success: result
        }
    }

    if (expected instanceof RegExp) {
        return {
            actual,
            success: !!actual.match(expected),
        }
    }
    if (containing) {
        return {
            actual,
            success: actual.includes(expected),
        }
    }

    if (atStart) {
        return {
            actual,
            success: actual.startsWith(expected),
        }
    }

    if (atEnd) {
        return {
            actual,
            success: actual.endsWith(expected),
        }
    }

    if (atIndex) {
        return {
            actual,
            success: actual.substring(atIndex, actual.length).startsWith(expected),
        }
    }

    return {
        actual,
        success: actual === expected,
    }
}

/**
 * Compare actual text with array of expected texts in a non-strict way
 * if the actual text matches with any of the expected texts, it returns true
 *
 * @param actual
 * @param expectedArray
 * @param param2
 * @returns
 */
export const compareTextWithArray = (
    actual: string,
    expectedArray: Array<string | RegExp | AsymmetricMatcher<string>>,
    {
        ignoreCase = false,
        trim = false, // TODO for single element we trim by default, but for array we don't trim by default. To review in v6.0.0 and make it consistent for both single and array of elements
        containing = false,
        atStart = false,
        atEnd = false,
        atIndex,
        replace,
    }: ExpectWebdriverIO.StringOptions
): CompareResult<string> => {
    if (typeof actual !== 'string') {
        return {
            actual,
            success: false,
        }
    }

    if (trim) {
        actual = actual.trim()
    }
    if (Array.isArray(replace)) {
        actual = replaceActual(replace, actual)
    }

    // Entries that carry their own RegExp - a bare RegExp, or one wrapped in stringMatching - carry
    // their own case-insensitivity via the `i` flag (added below), so they are matched against
    // `actualOriginalCase` instead of the lowercased `actual` - lowercasing it first can corrupt
    // characters with special casing (e.g. Turkish İ), silently breaking otherwise-valid matches.
    const actualOriginalCase = actual
    if (ignoreCase) {
        actual = actual.toLowerCase()
        expectedArray = expectedArray.map((item) => {
            if (typeof item === 'string') {
                return item.toLowerCase()
            }
            if (item instanceof RegExp) {
                return withIgnoreCaseFlag(item)
            }
            if (isStringContainingMatcherLike(item)) {
                const sample = getStringAsymmetricMatcherValue(item).toString().toLocaleLowerCase()
                return (isInversedStringContainingMatcher(item)
                    ? expect.not.stringContaining(sample)
                    : expect.stringContaining(sample)) as WdioAsymmetricMatcher<string>
            }
            if (isStringMatchingMatcherLike(item)) {
                // see the equivalent branch in compareText for why the sample is turned into a
                // RegExp rather than lowercased as literal text
                const sample = getStringAsymmetricMatcherValue(item as WdioAsymmetricMatcher<string> | JasmineStringAsymmetricMatcher<string>)
                const caseInsensitiveSample = withIgnoreCaseFlag(sample instanceof RegExp ? sample : new RegExp(sample))
                return (isInversedStringMatchingMatcher(item)
                    ? expect.not.stringMatching(caseInsensitiveSample)
                    : expect.stringMatching(caseInsensitiveSample)) as WdioAsymmetricMatcher<string>
            }
            return item
        })
    }

    const hasFoundTextInArray = expectedArray.some((expected) => {
        if (expected instanceof RegExp) {
            return !!actualOriginalCase.match(expected)
        }
        if (isStringMatchingMatcherLike(expected) && getStringAsymmetricMatcherValue(expected as WdioAsymmetricMatcher<string> | JasmineStringAsymmetricMatcher<string>) instanceof RegExp) {
            return expected.asymmetricMatch(actualOriginalCase)
        }
        if (isAsymmetricMatcher(expected)) {
            return expected.asymmetricMatch(actual)
        }
        if (containing) {
            return actual.includes(expected)
        }
        if (atStart) {
            return actual.startsWith(expected)
        }
        if (atEnd) {
            return actual.endsWith(expected)
        }
        if (atIndex) {
            return actual.substring(atIndex, actual.length).startsWith(expected)
        }
        return actual === expected
    })
    return {
        actual: actualOriginalCase,
        success: hasFoundTextInArray,
    }
}

export const compareObject = <T>(actual: T, expected: unknown): CompareResult<T> => {
    if (typeof actual !== 'object' || Array.isArray(actual)) {
        return {
            actual,
            success: false,
        }
    }

    return {
        actual,
        success: deepEql(actual, expected),
    }
}

export const compareStyle = async (
    actualEl: WebdriverIO.Element,
    style: { [key: string]: string },
    {
        ignoreCase = false,
        trim = true,
        containing = false,
        atStart = false,
        atEnd = false,
        atIndex,
        replace,
    }: ExpectWebdriverIO.StringOptions
): Promise<CompareResult<Record<string, string | undefined>>> => {
    let success = true
    const actual: Record<string, string | undefined> = {}

    for (const key in style) {
        const css: ParsedCSSValue = await actualEl.getCSSProperty(key)

        let actualVal: string = String(css.value || '')
        let expectedVal: string = style[key]

        if (trim) {
            actualVal = actualVal.trim()
            expectedVal = expectedVal.trim()
        }
        if (ignoreCase) {
            actualVal = actualVal.toLowerCase()
            expectedVal = expectedVal.toLowerCase()
        }

        if (containing) {
            success = actualVal.includes(expectedVal)
            actual[key] = actualVal
        } else if (atStart) {
            success = actualVal.startsWith(expectedVal)
            actual[key] = actualVal
        } else if (atEnd) {
            success = actualVal.endsWith(expectedVal)
            actual[key] = actualVal
        } else if (atIndex) {
            success = actualVal.substring(atIndex, actualVal.length).startsWith(expectedVal)
            actual[key] = actualVal
        } else if (replace){
            const replacedActual = replaceActual(replace, actualVal)
            success = replacedActual === expectedVal
            actual[key] = replacedActual
        } else {
            success = success && actualVal === expectedVal
            actual[key] = css.value
        }
    }

    return {
        actual,
        success,
    }
}

export {
    compareNumbers, enhanceError,
    executeCommandBe, waitUntil, wrapExpectedWithArray
}

/**
 * Return an equivalent RegExp carrying the `i` (ignore case) flag.
 *
 * The actual value being compared is generally left untouched when it's matched against a RegExp
 * (see the callers), since a RegExp pattern can't be lowercased without corrupting it (character
 * classes, escapes, etc.) - the case-insensitivity has to be expressed on the pattern itself.
 *
 * Always returns a clone, even when `i` is already set, so matching never mutates a `lastIndex`
 * the caller still holds a reference to. The clone's `lastIndex` is copied from the source - for a
 * sticky (`y`) pattern this is the position the match is anchored to, and `String.prototype.match`
 * honors it, so losing it (it would otherwise reset to 0 on the new instance) silently changes
 * where the match is attempted.
 */
function withIgnoreCaseFlag(expected: RegExp): RegExp {
    const cloned = expected.ignoreCase
        ? new RegExp(expected.source, expected.flags)
        : new RegExp(expected.source, `${expected.flags}i`)
    cloned.lastIndex = expected.lastIndex
    return cloned
}

function replaceActual(
    replace: [string | RegExp, string | Function] | Array<[string | RegExp, string | Function]>,
    actual: string
) {
    const hasMultipleReplacers = (replace as [string | RegExp, string | Function][]).every((r) =>
        Array.isArray(r)
    )
    const replacers = hasMultipleReplacers
        ? (replace as [string | RegExp, string | Function][])
        : [replace as [string | RegExp, string | Function]]

    if (replacers.some((r) => Array.isArray(r) && r.length !== 2)) {
        throw new Error('Replacers need to have a searchValue and a replaceValue')
    }

    for (const replacer of replacers) {
        const [searchValue, replaceValue] = replacer
        actual = actual.replace(searchValue, replaceValue as string)
    }

    return actual
}

export const getFeatureFlagValue = ({ featureFlags }: ExpectWebdriverIO.StringOptions, featureFlag: keyof ExpectWebdriverIO.FeatureFlags): boolean => {
    const providedFeatureFlagValue = featureFlags?.[featureFlag]
    if (providedFeatureFlagValue !== undefined) {
        return providedFeatureFlagValue
    }
    return DEFAULT_FEATURE_FLAGS[featureFlag] ?? false
}

export const toArray = <T>(value: T | T[] | undefined): T[] => value === undefined ? [] : Array.isArray(value) ? value : [value]
