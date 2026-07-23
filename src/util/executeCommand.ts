import type { WdioElementOrArrayMaybePromise, MaybeArray } from '../types.js'
import { awaitElementOrArray, isElement } from './elementsUtil.js'

export type StrategyType = 'LegacyLooseMultipleElements' | 'NewStrictMultipleElements'
export type CompareResult<T> = { result: boolean; value: T }
export type StrategyResult<T> = {
    subject: WebdriverIO.Element | WebdriverIO.ElementArray | WebdriverIO.Element[] | unknown;
    success: boolean;
    actual: MaybeArray<T> | undefined;
}

/**
 * Fetch element(s) and route them to the appropriate comparison strategy.
 * Acts as a router to dispatch the elements to either the legacy or new comparison strategy.
 *
 * @param unresolvedElements awaited or non-awaited element(s) to be resolved and compared
 * @param singleElementCompare compare a single element with expected value(s)
 * @param isNot indicates if the assertion is inverted (e.g., using `.not`)
 * @param strategy the strategy type to use (defaults to 'NewStrictMultipleElements')
 * @param configuration configuration options for the strategy
 * @returns An object containing the subject, success status, actual values, and results of the comparison
 */
export async function executeCommandWithStrategy<Actual, Expected>( {
    unresolvedElements,
    expectedValues,
    singleElementCompare,
    isNot,
    strategy = 'NewStrictMultipleElements',
    strictConfiguration = { allowEmptyElements: false, allowArrayWithSingleElement: false }
} :{
    unresolvedElements: WdioElementOrArrayMaybePromise | unknown
    expectedValues: MaybeArray<Expected> | unknown
    singleElementCompare: (awaitedElement: WebdriverIO.Element, expectedValues: MaybeArray<Expected>, index?: number) => Promise<CompareResult<Actual>>
    isNot: boolean
    strategy?: StrategyType,
    strictConfiguration?: { allowEmptyElements?: boolean, allowArrayWithSingleElement?: boolean }
}
): Promise<StrategyResult<Actual>> {
    if (strategy === 'LegacyLooseMultipleElements') {
        return legacyMultipleElementResultsStrategy(unresolvedElements, expectedValues, singleElementCompare, isNot)
    }

    // Default new strategy for single & multiple element results, which is more consistent and less ambigious than the legacy strategy.
    return multipleElementResultsStrategy(unresolvedElements, expectedValues, singleElementCompare, isNot, strictConfiguration)
}

/**
 * Legacy multiple element comparison strategy.
 *
 * Previous multi-element compare mechanism that started with `toHaveText` matcher.
 * Flaws:
 * - If there is no element or an empty array, it returns success with `.not` even though there are no elements' value to compare against.
 * - When asserting with `.not` to not have a given text, if at least one element does not have the text, it returns success even though other elements may have the text.
 *
 * @deprecated The above behavior can be confusing, yielding ambiguous results.
 * Kept for backward compatibility, to not be breaking but still be able to rollout the below new strategy.
 */
export const legacyMultipleElementResultsStrategy = async <Expected, Actual>(
    unresolvedElements: WdioElementOrArrayMaybePromise | unknown,
    expectedValues: MaybeArray<Expected> | undefined,
    singleElementCompare: (awaitedElement: WebdriverIO.Element, expectedValues: MaybeArray<Expected> | undefined, index?: number) => Promise<CompareResult<Actual>>,
    _isNot?: boolean,

): Promise<StrategyResult<Actual>> => {
    const { selector, other, isEmptyElements } = await awaitElementOrArray(unresolvedElements)
    const subject = selector ?? other
    if (!selector || isEmptyElements) {
        return {
            subject: subject,
            success: false,
            actual: undefined,
        }
    }

    if (isElement(selector)) {
        const compareResult = await singleElementCompare(selector, expectedValues)
        return {
            subject,
            success: compareResult.result,
            actual: compareResult.value,
        }
    }

    const settled = await Promise.allSettled(
        // Former `toHaveText` mechanism was to pass all the expected values (when an array) to each element and not an index-based expected value like the new strategy. This is kept for backward compatibility with the legacy strategy.
        Array.from(selector).map((element: WebdriverIO.Element, index: number) => singleElementCompare(element, expectedValues, index))
    )
    // Re-throw the first rejection so waitUntil surfaces the real error message
    const firstRejection = settled.find((r): r is PromiseRejectedResult => r.status === 'rejected')
    if (firstRejection) {
        throw firstRejection.reason
    }
    const results = settled.map((r) => (r as PromiseFulfilledResult<CompareResult<Actual>>).value)

    return {
        subject,
        success: results.length > 0 && results.every((res) => res.result === true),
        actual: results.length === 1 ? results[0].value : results.map(({ value }) => value),
    }
}

/**
 * Modern multiple element comparison strategy.
 *
 * Handles element arrays consistently:
 * - By default, if there is no element or an empty array, it returns a failure result.
 * - For a standard successful result, all elements must pass the compare strategy.
 * - For `.not` assertions, it ensures that all elements fail the compare strategy to pass.
 *
 * In rare cases (e.g., matchers using `isExisting`), the strategy can be configured via
 * `allowEmptyElements` to let an empty element set pass the assertion instead of failing.
 */
export const multipleElementResultsStrategy = async <Actual, Expected>(
    unresolvedElements: WdioElementOrArrayMaybePromise | unknown,
    expectedValues: MaybeArray<Expected> | undefined,
    singleElementCompare: (awaitedElement: WebdriverIO.Element, expectedValues: MaybeArray<Expected> | undefined, index?: number) => Promise<CompareResult<Actual>>,
    isNot: boolean,
    { allowEmptyElements = false, allowArrayWithSingleElement = false } = {}
): Promise<StrategyResult<Actual>> => {
    const { selector, other, isEmptyElements } = await awaitElementOrArray(unresolvedElements)
    const subject = selector ?? other

    if (!selector || isEmptyElements) {
        return {
            subject: subject,
            // For the new strategy, beside toExist, empty elements even with `.not` is considered a failure since there are no elements to compare against.
            success: isNot ? !allowEmptyElements : false,
            actual: undefined,
        }
    }

    if (isElement(selector)) {
        let forceFailure = false
        if (!allowArrayWithSingleElement && Array.isArray(expectedValues)) {
            // When arrays are not supported pass undefined instead and force a failure result below
            expectedValues = undefined // Force failure when we do not support array with single element, to avoid confusion with the new strategy.
            forceFailure = true
        }
        const compareResult = await singleElementCompare(selector, expectedValues)
        return {
            subject,
            success: forceFailure ? false : compareResult.result,
            actual: compareResult.value,
        }
    }

    const settled = await Promise.allSettled(
        Array.from(selector).map(async (element: WebdriverIO.Element, index: number) => {
            // For the new strategy, each element is compared against its index-based corresponding expected value (if it's an array) or the single expected value.
            let indexedExpectedValue = Array.isArray(expectedValues) ? expectedValues[index] : expectedValues

            let forceFailure = false
            // The new strategy does not support passing an array of expected values for an index-based element comparison.
            if (Array.isArray(indexedExpectedValue)) {
                indexedExpectedValue = undefined // Force failure when we do not support array with single element, to avoid confusion with the new strategy.
                forceFailure = true
            } else if (Array.isArray(expectedValues) && expectedValues.length !== selector.length && index >= expectedValues.length) {
                // Ensure we fails when expected vs number of elements do not match, mostly since some matchers asserting existence might pass when passing undefined expected value to fake a failure.
                forceFailure = true
            }

            const compareResult = await singleElementCompare(element, indexedExpectedValue, index)
            return forceFailure ? { result: false, value: compareResult.value } : compareResult
        })
    )

    // Re-throw the first rejection so waitUntil surfaces the real error message
    const firstRejection = settled.find((r): r is PromiseRejectedResult => r.status === 'rejected')
    if (firstRejection) {
        throw firstRejection.reason
    }
    const results = settled.map((r) => (r as PromiseFulfilledResult<CompareResult<Actual>>).value)

    // Fill with undefined element's actual value when having less elements than expected values.
    if (Array.isArray(expectedValues) && expectedValues.length > selector.length) {
        const missingValues = Array(expectedValues.length - selector.length).fill(undefined)
        results.push(...missingValues.map((value) => ({ result: false, value })))
    }

    let forceFailure = false
    if (Array.isArray(expectedValues) && expectedValues.length !== selector.length) {
        forceFailure = true
    }

    const isNotEmpty = results.length > 0

    // Success if all elements pass the compare strategy, or when using `.not`, if all elements fail the compare strategy.
    // If there are no elements, it is considered a failure in both case with and without `.not`, as there are no elements to compare against.
    return {
        subject,
        success: isNot ? !(!forceFailure && isNotEmpty && isAllFalse(results)) : (!forceFailure && isNotEmpty && isAllTrue(results)),
        actual: results.map(({ value }) => value)
    }
}

const isAllTrue = (results: CompareResult<unknown>[]): boolean => results.every((res) => res.result === true)
const isAllFalse = (results: CompareResult<unknown>[]): boolean => results.every((res) => res.result === false)
