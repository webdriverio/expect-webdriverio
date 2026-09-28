import deepEql from 'deep-eql'
import type { ParsedCSSValue } from 'webdriverio'

import { expect } from 'expect'

import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, MultiRemoteValuesWithArray, WdioMatcherContext } from './types.js'
import { wrapExpectedWithArray } from './util/elementsUtil.js'
import type { CompareResult } from './util/executeCommand.js'
import { executeCommandWithStrategy } from './util/executeCommand.js'
import { enhanceError, enhanceErrorBe } from './util/formatMessage.js'
import { waitUntil } from './util/waitUntil.js'
import { isOneOfMatcher } from './matchers/asymmetrics/oneOf.js'

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

/** Identify collection subset matchers by their public Jest/Jasmine display protocol. */
export function isArrayContainingMatcher(expected: unknown): expected is AsymmetricMatcher<unknown[]> {
    if (!isAsymmetricMatcher(expected) || typeof expected.asymmetricMatch !== 'function') {
        return false
    }
    if (typeof expected.toString === 'function' && /^Array(Not)?Containing$/.test(expected.toString())) {
        return true
    }
    if ('jasmineToString' in expected && typeof expected.jasmineToString === 'function') {
        // Jasmine's formatter accepts a pretty-printer argument; its contents are irrelevant here.
        const description = expected.jasmineToString(() => '')
        return description === '<jasmine.arrayContaining()>'
    }
    return false
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
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    command: (el: WebdriverIO.Element) => Promise<boolean>,
    options: ExpectWebdriverIO.CommandOptions = {}
): ExpectWebdriverIO.AsyncAssertionResult {
    // Every `toBe*` matcher sets `expectation` before it calls this function
    const { isNot, verb = 'be', expectation = '', allowEmptyElements = false } = this

    const { success: pass, actual, subject, context: { isSome = false } = {} } = await waitUntil(
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

    // TODO dprevost fix typing?
    const message = enhanceErrorBe(subject, actual as boolean[] | boolean | MultiRemoteValuesWithArray<boolean> | undefined, { ...this, verb, expectation, isSome }, options)

    return {
        pass,
        message: () => message,
    }
}

export const compareTextOrOneOf = (
    actualText: string,
    expectedText: MaybeArrayOrOneOf<string | RegExp | WdioAsymmetricMatcher<string> | JasmineAsymmetricMatcher<string>> | undefined,
    options: ExpectWebdriverIO.StringOptions
): CompareResult<string> => {
    // An array is an index-based expected value of `$$()`, never one value
    if (expectedText === undefined || Array.isArray(expectedText)) {
        return { actual: actualText, success: false }
    }

    if (isOneOfMatcher(expectedText)) {
        return { success: expectedText.asymmetricMatch(actualText), actual: actualText }
    }

    const compareResults = compareText(actualText, expectedText, options)
    // Failure messages show the actual text as is, not trimmed, lowercased or replaced by the string options
    return { ...compareResults, actual: actualText }
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

    if (atIndex !== undefined) {
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

        // e.g. per-instance styles passed as a plain object instead of `expect.multiRemote()`: a mismatch, not a crash
        if (typeof expectedVal !== 'string') {
            actual[key] = css.value
            success = false
            continue
        }

        if (trim) {
            actualVal = actualVal.trim()
            expectedVal = expectedVal.trim()
        }
        if (ignoreCase) {
            actualVal = actualVal.toLowerCase()
            expectedVal = expectedVal.toLowerCase()
        }

        /**
         * every property must match - accumulate with `&&` so an earlier mismatch cannot be
         * overwritten by a later property that happens to match
         */
        let matches: boolean
        if (containing) {
            matches = actualVal.includes(expectedVal)
            actual[key] = actualVal
        } else if (atStart) {
            matches = actualVal.startsWith(expectedVal)
            actual[key] = actualVal
        } else if (atEnd) {
            matches = actualVal.endsWith(expectedVal)
            actual[key] = actualVal
        } else if (atIndex !== undefined) {
            matches = actualVal.substring(atIndex, actualVal.length).startsWith(expectedVal)
            actual[key] = actualVal
        } else if (replace){
            const replacedActual = replaceActual(replace, actualVal)
            matches = replacedActual === expectedVal
            actual[key] = replacedActual
        } else {
            matches = actualVal === expectedVal
            actual[key] = css.value
        }
        success = success && matches
    }

    return {
        actual,
        success,
    }
}

export {
    enhanceError,
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

export const toArray = <T>(value: T | T[] | undefined): T[] => value === undefined ? [] : Array.isArray(value) ? value : [value]
