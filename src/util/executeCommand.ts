import type { WdioElementOrArrayMaybePromise, WdioElements } from '../types.js'
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

export type StrategyResult<T> = { result: boolean; value: T }

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
    singleElementCompare: singleElementCompare,
} :{
    unresolvedElements: WdioElementOrArrayMaybePromise | unknown
    singleElementCompare: (awaitedElement: WebdriverIO.Element, index?: number) => Promise<StrategyResult<T>>
}
): Promise<{ subject: WebdriverIO.Element| WebdriverIO.ElementArray | WebdriverIO.Element[] | unknown;
    success: boolean;
    actual: MaybeArray<T> | undefined;
}> {
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
        const strategyResult = await singleElementCompare(selector)
        return {
            subject,
            success: strategyResult.result,
            actual: strategyResult.value,
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
    const results = settled.map((r) => (r as PromiseFulfilledResult<StrategyResult<T>>).value)

    return {
        subject,
        success: results.length > 0 && results.every((res) => res.result === true),
        actual: results.map(({ value }) => value),
    }
}

