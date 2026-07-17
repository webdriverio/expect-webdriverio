import type { WdioElementOrArrayMaybePromise, WdioElements, MaybeArray } from '../types.js'
import { awaitElementOrArray, isElement } from './elementsUtil.js'

/**
 * Ensures that the specified condition passes for a given element or every element in an array of elements
 * @param el The element or array of elements
 * @param condition - The condition function to be executed on the element(s).
 * @param options - Optional configuration options
 * @param params - Additional parameters
 */
export async function executeCommand(
    el: WebdriverIO.Element | WdioElements,
    condition: (el: WebdriverIO.Element | WdioElements, ...params: unknown[]) => Promise<{
        result: boolean;
        value?: unknown;
    }>,
    options: ExpectWebdriverIO.DefaultOptions = {},
    params: unknown[] = []
): Promise<{ el: WebdriverIO.Element | WdioElements; success: boolean; values: unknown; }> {
    const result = await condition(el, ...params, options)
    return {
        el,
        success: result.result === true,
        values: result.value
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
 * Fetch element(s) and execute the compare strategy for each element, returning the results.
 * if there is no element or empty element array, it will return a failure result.
 * if there is a single element, it will return the result of the compare strategy for that element.
 * if there is an array of elements, it will return the result of the compare strategy for each element.
 *
 * For a successful result, all elements must pass the compare strategy.
 * For a failure result, at least one element must fail the compare strategy.
 *
 * For `.not` assertions, since success need to be inverted for successful result, so if at least one element fails the compare strategy, it will return a successful result.
 * The above can be is confusing, yeilding ambigious results, so behavior in this case need to be reviewed and improved in the future.
 *
 * @param unresolvedElements awaited or non-awaited element(s) to be resolved and compared
 * @param singleElementCompare compare a single element with expected value(s)
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
