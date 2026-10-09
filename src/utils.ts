import deepEql from 'deep-eql'
import type { ParsedCSSValue } from 'webdriverio'

import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, MultiRemoteValuesWithArray, WdioMatcherContext } from './types.js'
import { wrapExpectedWithArray } from './util/elementsUtil.js'
import type { CompareResult } from './util/executeCommand.js'
import { executeCommandWithStrategy } from './util/executeCommand.js'
import { enhanceError, enhanceErrorBe } from './util/formatMessage.js'
import { waitUntil } from './util/waitUntil.js'
import { isOneOfMatcher } from './matchers/asymmetrics/oneOf.js'
import { compareText } from './util/compareText.js'

// The public `utils` export keeps the helpers that moved to leaf modules, to remove the circular imports
export {
    getAsymmetricMatcherValue, getStringAsymmetricMatcherValue, isArrayContainingMatcher, isAsymmetricMatcher,
    isInversedStringContainingMatcher, isInversedStringMatchingMatcher, isJasmineStringAsymmetricMatcher,
    isStringContainingMatcherLike, isStringMatchingMatcherLike,
} from './util/asymmetricMatcherUtil.js'
import type { AsyncAssertionResult, CommandOptions, StringOptions } from './publicTypes/options.js'
export { compareText } from './util/compareText.js'
export { toArray } from './util/arrayUtil.js'

async function executeCommandBe(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    command: (el: WebdriverIO.Element) => Promise<boolean>,
    options: CommandOptions = {}
): AsyncAssertionResult {
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
    options: StringOptions
): CompareResult<string> => {
    // An array is an index-based expected value of `$$()`, never one value
    if (expectedText === undefined || Array.isArray(expectedText)) {
        return { actual: actualText, success: false }
    }

    if (isOneOfMatcher(expectedText)) {
        return { success: expectedText.asymmetricMatch(actualText), actual: actualText }
    }

    const compareResults = compareText(actualText, expectedText, options)
    // Failure messages show the actual text as is, not trimmed, lowercased or replaced by the string options, and the compared value apart
    return { success: compareResults.success, actual: actualText, compared: compareResults.actual }
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

/** One CSS value of `toHaveStyle`: a string value, as in `toHaveText` */
type StyleValue = MaybeOneOf<string | RegExp | WdioAsymmetricMatcher<string> | JasmineAsymmetricMatcher<string>>

/**
 * Each CSS value is compared as a string value, as in `toHaveText`: the string options, a RegExp, an asymmetric matcher
 * or `expect.oneOf()`. The actual values stay as is, and the compared values and the verdict of each property are apart.
 */
export const compareStyle = async (
    actualEl: WebdriverIO.Element,
    style: { [key: string]: StyleValue },
    options: StringOptions
): Promise<CompareResult<Record<string, unknown>>> => {
    const actual: Record<string, unknown> = {}
    const compared: Record<string, unknown> = {}
    const verdict: Record<string, boolean> = {}

    for (const key in style) {
        const { value }: ParsedCSSValue = await actualEl.getCSSProperty(key)
        const result = compareTextOrOneOf(String(value ?? ''), style[key], options)

        actual[key] = value
        compared[key] = result.compared
        verdict[key] = result.success
    }

    return { success: Object.values(verdict).every(Boolean), actual, compared, verdict }
}

export {
    enhanceError,
    executeCommandBe, waitUntil, wrapExpectedWithArray
}
