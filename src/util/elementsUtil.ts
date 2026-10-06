import { isArrayContainingMatcher } from '../utils.js'
import { hasMultiRemoteFlag } from './multiRemoteUtils.js'
import { getWdioKind, isChainable } from './wdioKind.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElements, WdioElementsMaybePromise, WdioMultiRemoteElementArray, WdioMultiRemoteElements } from '../types.js'

/**
 * Wraps the expected value in an array if both the target element (`el`) and the `actual` value are arrays.
 *
 * @param element - The WebdriverIO element, element array, or unknown target being evaluated.
 * @param actual - The actual result or results array.
 * @param expected - The expected result to potentially wrap.
 * @returns An array containing the expected result if conditions are met, otherwise returns the expected result as-is.
 */
export const wrapExpectedWithArray = (elements: WebdriverIO.Element | WdioElements | unknown, actual: unknown, expected: unknown) => {
    if (Array.isArray(elements) && Array.isArray(actual) && !Array.isArray(expected) && !isArrayContainingMatcher(expected)) {
        expected = Array(actual.length).fill(expected)
    }
    return expected
}

export const fillSingleExpectedForElementArray = (subject: WebdriverIO.Element | WdioElements | unknown, value: unknown): unknown[] | unknown => {
    if (isElementArrayLike(subject) && !Array.isArray(value) && !isArrayContainingMatcher(value)) {
        // When subject has no elements, we should at least represent one for proper failure message!
        const fillerlength = subject.length > 0 ? subject.length : 1
        return Array(fillerlength).fill(value)
    }
    return value
}

/**
 * Make isArray typing recognize WebdriverIO.ElementArray since it already works fine at runtime.
 */
export const isArray = (obj: unknown): obj is unknown[] | WebdriverIO.ElementArray => {
    return Array.isArray(obj)
}

/**
 * A `$$()` list, awaited or not: in WebdriverIO v10, a not-awaited `$$()` is the list itself, not a Promise.
 */
export const isStrictlyElementArray = (obj: unknown): obj is WebdriverIO.ElementArray => {
    return getWdioKind(obj) === 'element-array'
    // A chained `$('a').$$('b')` or a custom `$$` command before `await` is a Promise with the same brand
    && Array.isArray(obj)
    && !isMultiRemote(obj)
}

/**
 * A loaded element: an awaited `$()`, an item of an awaited `$$()`, or the result of `getElement()`.
 * A not-awaited `$()` has the same brand, but it is a Promise of the element (`wdio.chainable`).
 */
export const isElement = (obj: unknown): obj is WebdriverIO.Element => {
    return getWdioKind(obj) === 'element'
    && !isChainable(obj)
    && !isMultiRemote(obj)
}

/**
 * ElementArray or Element[]
 * Warning: empty array is considered as Element[] and will return true.
 *
 */
export const isElementArrayLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] => {
    // Using Array.prototype to bypass the asynchronous iterators of a `MultiRemoteElementArray` (its `every` returns a truthy Promise)
    return !!obj && (isStrictlyElementArray(obj) || (Array.isArray(obj) && Array.prototype.every.call(obj, isElement)))
}

/**
 * Element[]
 * Warning: empty array is considered as Element[] and will return true.
 */
export const isArrayOfElement = (obj: unknown): obj is WebdriverIO.Element[] => {
    return Array.isArray(obj) && !isMultiRemote(obj) && Array.prototype.every.call(obj, isElement)
}

/**
 * Element, ElementArray or Element[]
 * Warning: empty array is considered as Element[] and will return true.
 */
export const isElementOrArrayLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] | WebdriverIO.Element | WdioMultiRemoteElements => {
    return !!obj && (isElement(obj) || isElementArrayLike(obj))
}

/**
 * Element, ElementArray, Element[] or MultiRemoteElement
 * Warning: empty array is considered as Element[] and will return true.
 */
export const isElementOrArrayOrMultiRemoteElementLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] | WebdriverIO.Element | WdioMultiRemoteElements => {
    return !!obj && (isElement(obj) || isElementArrayLike(obj) || isMultiRemoteElementLike(obj))
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
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements | PromiseLike<WebdriverIO.Element> | WdioMultiRemoteElements | unknown
): Promise<{ selector?: WdioElements | WebdriverIO.Element | WebdriverIO.MultiRemoteElement | WdioMultiRemoteElementArray, elements?: WdioElements | WdioMultiRemoteElementArray, element?: WebdriverIO.Element, other?: unknown, isEmptyElements?: boolean, multiRemoteSelector?: WebdriverIO.MultiRemoteElement }> => {
    if (!received || typeof received !== 'object') {
        return { other: received }
    }

    // Simpler to always `await` than to check for a Promise or a `then`: `await` gives back a value that is not a thenable.
    // In WebdriverIO v10, a not-awaited `$()` is a Promise, but a not-awaited `$$()` is a list with `then` and a `length` that is
    // a Promise until it is loaded. `$().getElement()`, `$$().getElements()` and `$$().filter()` are Promises too.
    const awaitedElements = await received

    if (!isElementOrArrayOrMultiRemoteElementLike(awaitedElements)) {
        return { other: awaitedElements }
    }

    // for `WebdriverIO.MultiRemoteElement` (Multi-Remote single element): resolved directly by `$()` at
    // runtime as a plain object (no `getElement()`/chainable wrapper unlike a regular single element).
    if (isMultiRemoteElement(awaitedElements)) {
        return { selector: awaitedElements, multiRemoteSelector: awaitedElements }
    }

    // for `await $()` or `WebdriverIO.Element`
    if (isElement(awaitedElements)) {
        const element = await (awaitedElements as WebdriverIO.Element).getElement()
        return { selector: element, element }
    }
    // for `$$()`, awaited or not, or `WebdriverIO.ElementArray` but not `WebdriverIO.Element[]`
    if (isStrictlyElementArray(awaitedElements)) {
        const elements = await awaitedElements.getElements()
        return { selector: elements, elements, isEmptyElements: elements.length === 0 }
    }

    // for `WebdriverIO.Element[]`
    return { selector: awaitedElements, elements: awaitedElements, isEmptyElements: awaitedElements.length === 0 }
}

export const awaitElementArray = async(received: WdioElementsMaybePromise | undefined): Promise<{ elements?: WdioElements, other?: unknown }> => {
    // Simpler to always `await` than to check for a Promise or a `then`: `await` gives back a value that is not a thenable.
    // In WebdriverIO v10, a not-awaited `$$()` is a list with `then` and a `length` that is a Promise until it is loaded.
    // It also processes a not-awaited `$$().getElements()` or `$$().filter()` (a Promise), but the types do not allow it.
    const awaitedElements = await received

    if (!isElementArrayLike(awaitedElements)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { other: awaitedElements as any }
    }

    // for `$$()`, awaited or not, or `WebdriverIO.ElementArray` but not `WebdriverIO.Element[]`
    if (isStrictlyElementArray(awaitedElements)) {
        return { elements: await awaitedElements.getElements() }
    }

    // for `WebdriverIO.Element[]` or any other object
    return { elements: awaitedElements }
}

const isMultiRemote = (obj: unknown): obj is WebdriverIO.MultiRemoteElement | WdioMultiRemoteElementArray => {
    return hasMultiRemoteFlag(obj)
}

/**
 * An awaited multi-remote `$()`, or an item of a multi-remote `$$()`. It has no `parent`.
 */
export const isMultiRemoteElement = (obj: unknown): obj is WebdriverIO.MultiRemoteElement => {
    return getWdioKind(obj) === 'element' && !isChainable(obj) && isMultiRemote(obj)
}

/**
 * The `MultiRemoteElementArray` of a multi-remote `$$()`, which knows its parent, its selector and its instances.
 */
export const isMultiRemoteElementArray = (obj: unknown): obj is WdioMultiRemoteElementArray => {
    return getWdioKind(obj) === 'element-array' && isMultiRemote(obj)
}

/**
 * Checks if the object is like a MultiRemoteElement, array or not.
 */
export const isMultiRemoteElementLike = (obj: unknown): obj is WdioMultiRemoteElements => {
    return isMultiRemoteElement(obj) || isMultiRemoteElementArray(obj)
}
