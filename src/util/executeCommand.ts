import type { WdioElementOrArrayMaybePromise, WdioElements } from '../types'
import { awaitElementOrArray, isElementArrayLike, map } from './elementsUtil'

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
    mutipleElementsCompareStrategy?: (awaitedElements: WebdriverIO.Element | WdioElements) => Promise<
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
    if (!singleElementCompareStrategy && !mutipleElementsCompareStrategy) { throw new Error('No condition or customMultipleElementCompareStrategy provided to executeCommand') }

    const elementOrArray = element ? element : elements ? elements : undefined

    /* v8 ignore next -- @preserve -- should be unreachable due to checks above */
    if (!elementOrArray) {
        throw new Error('No elements to process in executeCommand')
    }

    let results
    if (singleElementCompareStrategy && element) {
        results = [await singleElementCompareStrategy(element)]
    } else if (mutipleElementsCompareStrategy) {
        results = await mutipleElementsCompareStrategy(elementOrArray)
    } else if (singleElementCompareStrategy && elements) {
        results = await map(elements, (el: WebdriverIO.Element) => singleElementCompareStrategy(el))
    } else  {
        /* v8 ignore next -- @preserve -- To please tsc but never reached due to checks above */
        throw new Error('Unable to process executeCommand with the provided parameters')
    }

    return {
        elementOrArray: elementOrArray,
        success: results.length > 0 && results.every((res) => res.result === true),
        results: results.map(({ result }) => (result)),
        valueOrArray: element && results.length === 1 ? results[0].value : results.map(({ value }) => value),
    }
}

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
    { supportArrayForSingleElement = false } =  {}
): Promise<{ result: boolean; value?: Value | string }[]> {
    if (isElementArrayLike(elements)) {
        if (Array.isArray(expectedValues)) {
            if (elements.length !== expectedValues.length) {
                return [{ result: false, value: `Received array length ${elements.length}, expected ${expectedValues.length}` }]
            }
            return await map(elements, (el: WebdriverIO.Element, index: number) => condition(el, expectedValues[index]))
        }
        return await map(elements, (el: WebdriverIO.Element) => condition(el, expectedValues))

    } else if ( Array.isArray(expectedValues)) {
        if (!supportArrayForSingleElement) {
            return [{ result: false, value: 'Expected value cannot be an array' }]
        }

        // Case where a single element's value can be an array compared to an expected value array and not multiple expected values
        return [await condition(elements, expectedValues as Expected)]
    }
    return [await condition(elements, expectedValues)]
}
