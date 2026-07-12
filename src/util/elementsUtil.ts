import type { WdioElementOrArrayMaybePromise, WdioElements } from '../types.js'

/**
 * if el is an array of elements and actual value is an array
 * wrap expected value with array
 * @param el element
 * @param actual actual result or results array
 * @param expected expected result
 */
export const wrapExpectedWithArray = <T>(el: WebdriverIO.Element | WdioElements | unknown, actual: unknown, expected: T): T | T[] => {
    if (Array.isArray(el) && el.length > 1 && Array.isArray(actual)) {
        return [expected]
    }
    return expected
}

/**
 * Utility since Array.isArray() does not regonize WebdriverIO.ElementArray as a a typed array, but it is an array-like object.
 */
export const isArray = (obj: unknown): obj is unknown[] | WebdriverIO.ElementArray => {
    return Array.isArray(obj)
}

export const isElementArray = (obj: unknown): obj is WebdriverIO.ElementArray => {
    return obj !== null && typeof obj === 'object' && 'selector' in obj && 'foundWith' in obj && 'parent' in obj
}

export const isSelector = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element => {
    return !!obj && typeof obj === 'object'
    && 'selector' in obj
    && 'parent' in obj // commun with Element
}

export const isStrictlyElementArray = (obj: unknown): obj is WebdriverIO.ElementArray => {
    return isSelector(obj)
    && Array.isArray(obj)
    && 'foundWith' in obj // Element does not have foundWith property
    && 'getElements' in obj // specific to ElementArray
}

export const isElement = (obj: unknown): obj is WebdriverIO.Element => {
    // Note elementId is only for found element
    return isSelector(obj)
    && !Array.isArray(obj)
    && 'getElement' in obj // specific to Element
}

export const isElementArrayLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] => {
    return (!!obj && isStrictlyElementArray(obj)) || (Array.isArray(obj) && obj.length > 0 && obj.every(isElement))
}

export const isElementOrArrayLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] | WebdriverIO.Element => {
    return !!obj && (isElement(obj) || isElementArrayLike(obj))
}

/**
 * Universaly await element(s) since depending on the type received, it can become complex.
 *
 * Using `$()` or `$$()` return a promise as `ChainablePromiseElement/Array` that needs to be awaited and even if chainable.getElement()/getElements() can be done statically, at runtime `'getElement/getElements` in chainable` is false.
 * Using `await $()` still return a `ChainablePromiseElement` but underneath it's a `WebdriverIO.Element/ElementArray` and thus `'getElement/getElements' in element` is true and can be checked and done.
 * With `$$().filter()`, it returns a `Promise<WebdriverIO.Element[]>` that also needs to be awaited.
 * When passing directly a `WebdriverIO.Element` or `WebdriverIO.ElementArray`, no need to await anything and getElement or getElements can be used on it and runtime also works too.
 *
 * @param received
 * @returns
 */
export const awaitElementOrArray = async(
    received: WdioElementOrArrayMaybePromise | PromiseLike<WebdriverIO.Element> | undefined
): Promise<{ selector?: WdioElements | WebdriverIO.Element, elements?: WdioElements, element?: WebdriverIO.Element, other?: unknown }> => {
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
        return { selector: elements, elements }
    }

    // for `WebdriverIO.Element[]`
    return { selector: awaitedElements, elements: awaitedElements }
}
