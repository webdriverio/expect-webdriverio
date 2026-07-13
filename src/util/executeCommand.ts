import type { WdioElementOrArrayMaybePromise, WdioElements } from '../types.js'
import { awaitElementOrArray, isElement, map } from './elementsUtil.js'

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
 * Fetch element(s) and execute a the compare strategy for each element, returning the results.
 * if there is no element or empty element array, it will return a failure result.
 *
 *
 * @param unresolvedElements awaited or non-awaited element(s) to be resolved and compared
 * @param singleElementCompareStrategy Strategy to compare a single elemrnt with expected value(s)
 * @returns An object containing the subject, success status, actual values, and results of the comparison
 */
export async function executeCommandWithStrategy<T>( {
    unresolvedElements,
    singleElementCompare: singleElementCompareStrategy,
} :{
    unresolvedElements: WdioElementOrArrayMaybePromise | unknown
    singleElementCompare: (awaitedElement: WebdriverIO.Element, index?: number) => Promise<StrategyResult<T>>
}
): Promise<{ subject: WebdriverIO.Element| WebdriverIO.ElementArray | WebdriverIO.Element[] | unknown;
    success: boolean;
    actual: MaybeArray<T> | undefined;
    results: boolean[]
}> {
    const { selector, other, isEmptyElements } = await awaitElementOrArray(unresolvedElements)
    const subject = selector ?? other
    if (!selector || isEmptyElements) {
        return {
            subject: subject,
            success: false,
            actual: undefined,
            results: []
        }
    }

    if (isElement(selector)) {
        const strategyResult = await singleElementCompareStrategy(selector)
        return {
            subject,
            success: strategyResult.result,
            actual: strategyResult.value,
            results: [strategyResult.result]
        }
    }
    const results = await map(selector, (el: WebdriverIO.Element, index: number) => singleElementCompareStrategy(el, index))

    return {
        subject,
        success: results.length > 0 && results.every((res) => res.result === true),
        results: results.map(({ result }) => (result)),
        actual: results.map(({ value }) => value),
    }
}
