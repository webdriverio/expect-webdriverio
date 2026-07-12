import type { WdioElementOrArrayMaybePromise, WdioElements } from '../types.js'

/**
 * Wraps the expected value in an array if both the target element (`el`) and the `actual` value are arrays.
 *
 * @param element - The WebdriverIO element, element array, or unknown target being evaluated.
 * @param actual - The actual result or results array.
 * @param expected - The expected result to potentially wrap.
 * @returns An array containing the expected result if conditions are met, otherwise returns the expected result as-is.
 */
export const wrapExpectedWithArray = <T>(element: WebdriverIO.Element | WdioElements | unknown, actual: unknown, expected: T): T | T[] => {
    if (Array.isArray(element) && element.length > 1 && Array.isArray(actual)) {
        return [expected]
    }
    return expected
}

/**
 * Utility since Array.isArray() does not recognize WebdriverIO.ElementArray as a typed array, but it is an array-like object.
 */
export const isArray = (obj: unknown): obj is unknown[] | WebdriverIO.ElementArray => {
    return Array.isArray(obj)
}

export const isSelector = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element => {
    return !!obj
    && typeof obj === 'object'
    && 'selector' in obj
    && 'parent' in obj // commun with Element
}

export const isElementArray = (obj: unknown): obj is WebdriverIO.ElementArray => {
    return isSelector(obj)
    && 'foundWith' in obj
}

export const isStrictlyElementArray = (obj: unknown): obj is WebdriverIO.ElementArray => {
    return isElementArray(obj)
    && Array.isArray(obj)
    && 'getElements' in obj // specific to ElementArray
}

export const isElement = (obj: unknown): obj is WebdriverIO.Element => {
    // Note: elementId is only for found element
    return isSelector(obj)
    && !Array.isArray(obj)
    && 'getElement' in obj // specific to Element
}

export const isElementArrayLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] => {
    return !!obj && (isStrictlyElementArray(obj) || (Array.isArray(obj) && obj.length > 0 && obj.every(isElement)))
}

export const isElementOrArrayLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] | WebdriverIO.Element => {
    return !!obj && (isElement(obj) || isElementArrayLike(obj))
}

/**
 * Universally awaits and resolves WebdriverIO element(s) into a standardized object.
 *
 * Element resolution can be complex depending on the type received:
 * - Using `$()` or `$$()` returns a `ChainablePromiseElement` or `ChainablePromiseArray`. These need to be awaited.
 *   - Even though methods like `.getElement()` can be called statically, at runtime `'getElement'` / `'getElements'` does not exist on the chainable promise itself.
 * - Using `await $()` resolves to a `WebdriverIO.Element` or `WebdriverIO.ElementArray`, meaning `'getElement'` or `'getElements'` can be safely checked and evaluated at runtime.
 * - Native promises are also fully supported and properly awaited, including those returned by methods like:
 *   - `$().getElement()` which evaluates to `Promise<WebdriverIO.Element>`
 *   - `$$().getElements()` which evaluates to `Promise<WebdriverIO.ElementArray>`
 *   - `$$().filter()` which evaluates to `Promise<WebdriverIO.Element[]>`
 * - Directly passing a `WebdriverIO.Element` or `WebdriverIO.ElementArray` requires no awaiting, and runtime methods work immediately.
 *
 * @param received - The target to resolve. Can be a single WebdriverIO element, an array of elements, a promise evaluating to elements, or an undefined/primitive value.
 * @returns A promise resolving to an object detailing the state of the element(s):
 *  - `selector`: The resolved WebdriverIO element or array of elements.
 *  - `element`: The resolved single `WebdriverIO.Element` (if a single element was passed).
 *  - `elements`: The resolved array of elements (if an array or ElementArray was passed).
 *  - `isEmptyElements`: `true` if the resolved array of elements has a length of 0.
 *  - `other`: Contains the original value if it was a primitive, `undefined`, or not a recognized element/array.
 */
export const awaitElementOrArray = async(
    received: WdioElementOrArrayMaybePromise | PromiseLike<WebdriverIO.Element> | undefined
): Promise<{ selector?: WdioElements | WebdriverIO.Element, elements?: WdioElements, element?: WebdriverIO.Element, other?: unknown, isEmptyElements?: boolean }> => {
    if (!received || typeof received !== 'object') {
        return { other: received }
    }

    let awaitedElements = received

    // For non-awaited `$()` or `$$()`, so ChainablePromiseElement | ChainablePromiseArray.
    // Extend also to other valid non-awaited case like `$().getElement()`, `$$().getElements()` or `$$().filter()`.
    if (awaitedElements instanceof Promise) {
        awaitedElements = await awaitedElements
    }

    if (!isElementOrArrayLike(awaitedElements)) {
        return { other: awaitedElements }
    }

    // for `await $()` or `WebdriverIO.Element`
    if ('getElement' in awaitedElements) {
        const element = await awaitedElements.getElement()
        return { selector: element, element }
    }
    // for `await $$()` or `WebdriverIO.ElementArray` but not `WebdriverIO.Element[]`
    if ('getElements' in awaitedElements) {
        const elements = await awaitedElements.getElements()
        return { selector: elements, elements, isEmptyElements: elements.length === 0 }
    }

    // for `WebdriverIO.Element[]`
    return { selector: awaitedElements, elements: awaitedElements, isEmptyElements: awaitedElements.length === 0 }
}
