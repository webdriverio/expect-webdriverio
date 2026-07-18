import type { WdioElementOrArrayMaybePromise, WdioElements, MaybeArray } from '../types.js'
import { awaitElementOrArray, isElement } from './elementsUtil.js'

/**
 * Ensures a condition passes for one or more elements.
 *
 * Resolves the elements and applies the appropriate strategy:
 * - Single element: Uses `singleElementCompareStrategy` (fallback to `multipleElementsCompareStrategy`).
 * - Multiple elements: Uses `multipleElementsCompareStrategy` (fallback to `singleElementCompareStrategy` for each).
 *
 * Returns failure if elements are invalid or empty.
 *
 * @param elements The element or array of elements.
 * @param singleElementCompareStrategy Strategy for a single element.
 * @param multipleElementsCompareStrategy Strategy for the element(s).
 * @param options Optional configuration options.
 */
export async function executeCommand<T>(
    nonAwaitedElements: WdioElementOrArrayMaybePromise | undefined,
    singleElementCompareStrategy?: (awaitedElement: WebdriverIO.Element) => Promise<
        { result: boolean; value?: T }
    >,
    multipleElementsCompareStrategy?: (awaitedElements: WebdriverIO.Element | WdioElements) => Promise<
        { result: boolean; value?: T }[]
    >
): Promise<{ elementOrArray: WdioElements | WebdriverIO.Element | undefined; success: boolean; valueOrArray: T | undefined | Array<T | undefined>, results: boolean[] }> {
    const { elements, element, other } = await awaitElementOrArray(nonAwaitedElements)
    if (!elements && !element) {
        return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- one day move up the unknown type
            elementOrArray: other as any,
            success: false,
            valueOrArray: undefined,
            results: []
        }
    } else if (elements?.length === 0) {
        return {
            elementOrArray: elements,
            success: false,
            valueOrArray: undefined,
            results: []
        }
    }
    if (!singleElementCompareStrategy && !multipleElementsCompareStrategy) { throw new Error('No condition or customMultipleElementCompareStrategy provided to executeCommand') }

    const elementOrArray = element ? element : elements ? elements : undefined

    /* v8 ignore next -- @preserve -- should be unreachable due to checks above */
    if (!elementOrArray) {
        throw new Error('No elements to process in executeCommand')
    }

    let results
    if (singleElementCompareStrategy && element) {
        results = [await singleElementCompareStrategy(element)]
    } else if (multipleElementsCompareStrategy) {
        results = await multipleElementsCompareStrategy(elementOrArray)
    } /* else if (singleElementCompareStrategy && elements) {
        results = await map(elements, (el: WebdriverIO.Element) => singleElementCompareStrategy(el))
    }*/ else  {
        /* v8 ignore next -- @preserve -- To please tsc but never reached due to checks above */
        throw new Error('Unable to process executeCommand with the provided parameters')
    }

    return {
        elementOrArray: elementOrArray,
        success: results.length > 0 && results.every((res) => res.result === true),
        results: results.map(({ result }) => (result)),
        valueOrArray: element && results.length === 1 ? results[0].value : results.map(({  value }) => value),
    }
}

export type StrategyType = 'LegacyMultipleElements' | 'NewMultipleElements'
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
 * @param strategy the strategy type to use (defaults to 'NewMultipleElements')
 * @param configuration configuration options for the strategy
 * @returns An object containing the subject, success status, actual values, and results of the comparison
 */
export async function executeCommandWithStrategy<T>( {
    unresolvedElements,
    singleElementCompare,
    isNot,
    strategy = 'NewMultipleElements',
    configuration = { allowEmptyElements: false }
} :{
    unresolvedElements: WdioElementOrArrayMaybePromise | unknown
    singleElementCompare: (awaitedElement: WebdriverIO.Element, index?: number) => Promise<CompareResult<T>>
    isNot: boolean
    strategy?: StrategyType,
    configuration?: { allowEmptyElements?: boolean }
}
): Promise<StrategyResult<T>> {
    if (strategy === 'LegacyMultipleElements') {
        return legacyMultipleElementResultsStrategy(unresolvedElements, singleElementCompare, isNot)
    }

    // Default new strategy for single & multiple element results, which is more consistent and less ambigious than the legacy strategy.
    return multipleElementResultsStrategy(unresolvedElements, singleElementCompare, isNot, configuration)
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
export const legacyMultipleElementResultsStrategy = async <T>(
    unresolvedElements: WdioElementOrArrayMaybePromise | unknown,
    singleElementCompare: (awaitedElement: WebdriverIO.Element, index?: number) => Promise<CompareResult<T>>,
    _isNot?: boolean

): Promise<StrategyResult<T>> => {
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
        const compareResult = await singleElementCompare(selector)
        return {
            subject,
            success: compareResult.result,
            actual: compareResult.value,
        }
    }

    const settled = await Promise.allSettled(
        Array.from(selector).map((el: WebdriverIO.Element, index: number) => singleElementCompare(el, index))
    )
    // Re-throw the first rejection so waitUntil surfaces the real error message
    const firstRejection = settled.find((r): r is PromiseRejectedResult => r.status === 'rejected')
    if (firstRejection) {
        throw firstRejection.reason
    }
    const results = settled.map((r) => (r as PromiseFulfilledResult<CompareResult<T>>).value)

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
export const multipleElementResultsStrategy = async <T>(
    unresolvedElements: WdioElementOrArrayMaybePromise | unknown,
    singleElementCompare: (awaitedElement: WebdriverIO.Element, index?: number) => Promise<CompareResult<T>>,
    isNot: boolean,
    { allowEmptyElements = false } = {}
): Promise<StrategyResult<T>> => {
    const { selector, other, isEmptyElements } = await awaitElementOrArray(unresolvedElements)
    const subject = selector ?? other
    if (!selector || isEmptyElements) {
        return {
            subject: subject,
            success: isNot ? !allowEmptyElements : false,
            actual: undefined,
        }
    }

    if (isElement(selector)) {
        const compareResult = await singleElementCompare(selector)
        return {
            subject,
            success: compareResult.result,
            actual: compareResult.value,
        }
    }

    const settled = await Promise.allSettled(
        Array.from(selector).map((el: WebdriverIO.Element, index: number) => singleElementCompare(el, index))
    )

    // Re-throw the first rejection so waitUntil surfaces the real error message
    const firstRejection = settled.find((r): r is PromiseRejectedResult => r.status === 'rejected')
    if (firstRejection) {
        throw firstRejection.reason
    }
    const results = settled.map((r) => (r as PromiseFulfilledResult<CompareResult<T>>).value)

    const isNotEmpty = results.length > 0

    // Success if all elements pass the compare strategy, or when using `.not`, if all elements fail the compare strategy.
    // If there are no elements, it is considered a failure in both case with and without `.not`, as there are no elements to compare against.
    return {
        subject,
        success: isNot ? !(isNotEmpty && isAllFalse(results)) : (isNotEmpty && isAllTrue(results)),
        actual: results.map(({ value }) => value)
    }
}

const isAllTrue = (results: CompareResult<unknown>[]): boolean => results.every((res) => res.result === true)
const isAllFalse = (results: CompareResult<unknown>[]): boolean => results.every((res) => res.result === false)

/**
 * Default strategy for iterating over multiple elements.
 *
 * - If `elements` is an array:
 *   - Compares each element against the corresponding value in `expectedValues` (if it's an array).
 *   - Compares each element against `expectedValues` (if it's a single value).
 * - If `elements` is a single element:
 *   - Compares against `expectedValues` (must be a single value).
 *
 * Fails if array lengths mismatch or if a single element is compared against an array.
 *
 * @param elements The element or array of elements.
 * @param expectedValues The expected value or array of expected values.
 * @param condition The condition to execute on each element.
 * @param options Optional configuration options.
 */
export async function defaultMultipleElementsIterationStrategy<Expected, Value>(
    elements: WebdriverIO.Element | WdioElements,
    expectedValues: MaybeArray<Expected>,
    condition: (awaitedElement: WebdriverIO.Element, expectedValue: Expected) => Promise<
        { result: boolean; value?: Value }
    >,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { supportArrayForSingleElement = false } =  {}
): Promise<{ result: boolean; value?: Value | string }[]> {
    // if (isElementArrayLike(elements)) {
    //     if (Array.isArray(expectedValues)) {
    //         if (elements.length !== expectedValues.length) {
    //             return [{ result: false, value: `Received array length ${elements.length}, expected ${expectedValues.length}` }]
    //         }
    //         return await map(elements, (el: WebdriverIO.Element, index: number) => condition(el, expectedValues[index]))
    //     }
    //     return await map(elements, (el: WebdriverIO.Element) => condition(el, expectedValues))

    // } else if ( Array.isArray(expectedValues)) {
    //     if (!supportArrayForSingleElement) {
    //         return [{ result: false, value: 'Expected value cannot be an array' }]
    //     }

    //     // Case where a single element's value can be an array compared to an expected value array and not multiple expected values
    //     return [await condition(elements, expectedValues as Expected)]
    // }
    // return [await condition(elements, expectedValues)]
    return []
}
