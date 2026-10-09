import deepEql from 'deep-eql'
import type { ParsedCSSValue } from 'webdriverio'

import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, MultiRemoteValuesWithArray, WdioMatcherContext } from './types.js'
import { wrapExpectedWithArray } from './util/elementsUtil.js'
import type { CompareResult } from './util/executeCommand.js'
import { executeCommandWithStrategy } from './util/executeCommand.js'
import { enhanceError, enhanceErrorBe } from './util/formatMessage.js'
import { waitUntil } from './util/waitUntil.js'
import { isOneOfMatcher } from './matchers/asymmetrics/oneOf.js'
import { compareText, replaceActual } from './util/compareText.js'

// The public `utils` export keeps the helpers that moved to leaf modules, to remove the circular imports
export {
    getAsymmetricMatcherValue, getStringAsymmetricMatcherValue, isArrayContainingMatcher, isAsymmetricMatcher,
    isInversedStringContainingMatcher, isInversedStringMatchingMatcher, isJasmineStringAsymmetricMatcher,
    isStringContainingMatcherLike, isStringMatchingMatcherLike,
} from './util/asymmetricMatcherUtil.js'
export { compareText } from './util/compareText.js'
export { toArray } from './util/arrayUtil.js'

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
