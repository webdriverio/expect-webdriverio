import type { WdioElementOrArrayMaybePromise, WdioElements } from '../types'
import { awaitElements, isAnyKindOfElementArray, map } from './elementsUtil'

/**
 * Ensures that the specified condition passes for every element in an array of elements or a single element.
 *
 * First we await the elements to ensure all awaited or non-awaited cases are covered
 * Secondly we call the compare strategy with the resolved elements, so that it can be called upwards as the matcher see fits
 * If the elements are invalid (e.g. undefined/null or object), we return with success: false to gracefully report a failure
 *
 * Only one strategy is required, both can be provided if single vs multiple element handling is needed.
 *
 * If singleElementCompareStrategy is provided and there is only one element, we execute it.
 * If mutipleElementCompareStrategy is provided and there are multiple elements, we execute it.
 * If only singleElementCompareStrategy is provided and there are multiple elements, we execute it for each element.
 *
 * @param elements The element or array of elements
 * @param singleElementCompareStrategy - The condition function to be executed on a single element or for each element if multiple elements are provided and no multiple strategy is provided
 * @param mutipleElementsCompareStrategy - The condition function to be executed on the element(s).
 * @param options - Optional configuration options
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
    const { elements: awaitedElements, isSingleElement, isElementLikeType } = await awaitElements(nonAwaitedElements)
    if (!awaitedElements || awaitedElements.length === 0 || !isElementLikeType) {
        return {
            elementOrArray: awaitedElements,
            success: false,
            valueOrArray: undefined,
            results: []
        }
    }
    if (!singleElementCompareStrategy && !mutipleElementsCompareStrategy) { throw new Error('No condition or customMultipleElementCompareStrategy provided to executeCommand') }

    let results
    if (singleElementCompareStrategy && isSingleElement) {
        results = [await singleElementCompareStrategy(awaitedElements[0])]
    } else if (mutipleElementsCompareStrategy) {
        results = await mutipleElementsCompareStrategy(isSingleElement ? awaitedElements[0] : awaitedElements)
    } else if (singleElementCompareStrategy) {
        results = await map(awaitedElements, (el: WebdriverIO.Element) => singleElementCompareStrategy(el))
    } else  {
        throw new Error('Unable to process executeCommand with the provided parameters')
    }

    return {
        elementOrArray: isSingleElement && awaitedElements?.length === 1 ? awaitedElements[0] : awaitedElements,
        success: results.length > 0 && results.every((res) => res.result === true),
        results: results.map(({ result }) => (result)),
        valueOrArray: isSingleElement && results.length === 1 ? results[0].value : results.map(({ value }) => value),
    }
}

/**
 * Default iteration strategy to compare multiple elements in an strict way.
 * If the elements is an array, we compare each element against the expected value(s)
 *  When expected value is an array, we compare each element against the corresponding expected value of the same index
 *  When expected value is a single value, we compare each element against the same expected value
 *
 * If the elements is a single element, we compare it against the expected value
 *  When the expected value is an array, we return a failure as we cannot compare a single element against multiple expected values
 *  When the expected value is a single value, we compare the element against that value
 *
 * Comparaing element(s) to any expceted value of an array is not supported and will return a failure
 *
 * TODO dprevost: What to do if elements array is empty?
 *
 * @param elements The element or array of elements
 * @param expectedValues The expected value or array of expected values
 * @param condition - The condition function to be executed on the element(s).
 */
export async function defaultMultipleElementsIterationStrategy<Expected, Value>(
    elements: WebdriverIO.Element | WdioElements,
    expectedValues: MaybeArray<Expected>,
    condition: (awaitedElement: WebdriverIO.Element, expectedValue: Expected) => Promise<
        { result: boolean; value?: Value }
    >
): Promise<{ result: boolean; value?: Value | string }[]> {
    if (isAnyKindOfElementArray(elements)) {
        if (Array.isArray(expectedValues)) {
            if (elements.length !== expectedValues.length) {
                return [{ result: false, value: `Expected array length ${elements.length}, received ${expectedValues.length}` }]
            }
            return await map(elements, (el: WebdriverIO.Element, index: number) => condition(el, expectedValues[index]))
        }
        return await map(elements, (el: WebdriverIO.Element) => condition(el, expectedValues))

    } else if (Array.isArray(expectedValues)) {
        // TODO: improve typing here (no casting)
        return [{ result: false, value: 'Expected value cannot be an array' }]
    }
    return [await condition(elements, expectedValues)]
}
