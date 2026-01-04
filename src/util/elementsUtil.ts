import type { WdioElementOrArrayMaybePromise, WdioElements, WdioElementsMaybePromise } from '../types'

/**
 * if el is an array of elements and actual value is an array
 * wrap expected value with array
 * @param el element
 * @param actual actual result or results array
 * @param expected expected result
 */
export const wrapExpectedWithArray = (el: WebdriverIO.Element | WdioElements | undefined, actual: unknown, expected: unknown) => {
    if (Array.isArray(el) && Array.isArray(actual) && !Array.isArray(expected)) {
        expected = Array(actual.length).fill(expected)
    }
    return expected
}

export const isStrictlyElementArray = (obj: unknown): obj is WebdriverIO.ElementArray => {
    return !!obj && typeof obj === 'object'
    && Array.isArray(obj)
    && 'selector' in obj
    && 'foundWith' in obj // Element does not have foundWith property
    && 'parent' in obj // commun with Element
    && 'getElements' in obj // specific to ElementArray
}

export const isElement = (obj: unknown): obj is WebdriverIO.Element => {
    // Note elementId is only for found element
    return !!obj && typeof obj === 'object'
    && !Array.isArray(obj)
    && 'selector' in obj
    && 'parent' in obj
    && 'getElement' in obj // specific to Element
}

export const isElementArrayLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] => {
    return !!obj && isStrictlyElementArray(obj) || (Array.isArray(obj) && obj.every(isElement))
}

export const isElementOrArrayLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] | WebdriverIO.Element => {
    return !!obj && isElement(obj) || isElementArrayLike(obj)
}

export const isElementOrNotEmptyElementArray = (obj: unknown): obj is WebdriverIO.Element | WdioElements => {
    return !!obj && isElement(obj) || (isElementArrayLike(obj) && obj.length > 0)
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
export const awaitElementOrArray = async(received: WdioElementOrArrayMaybePromise | undefined): Promise<{ elements?: WdioElements, element?: WebdriverIO.Element, other?: unknown }> => {
    let awaitedElements = received
    // For non-awaited `$()` or `$$()`, so ChainablePromiseElement | ChainablePromiseArray.
    // At some extend it also process non-awaited `$().getElement()`, `$$().getElements()` or `$$().filter()`, but typings does not allow it
    if (awaitedElements instanceof Promise) {
        awaitedElements = await awaitedElements
    }

    if (!isElementOrArrayLike(awaitedElements)) {
        return { other: awaitedElements }
    }

    // for `await $()` or `WebdriverIO.Element`
    if ('getElement' in awaitedElements) {
        return { element: await awaitedElements.getElement() }
    }
    // for `await $$()` or `WebdriverIO.ElementArray` but not `WebdriverIO.Element[]`
    if ('getElements' in awaitedElements) {
        return { elements: await awaitedElements.getElements() }
    }

    // for `WebdriverIO.Element[]`
    return { elements: awaitedElements }
}

export const awaitElementArray = async(received: WdioElementsMaybePromise | undefined): Promise<{ elements?: WdioElements, other?: unknown }> => {
    let awaitedElements = received
    // For non-awaited `$$()`, so ChainablePromiseElement | ChainablePromiseArray.
    // At some extend it also process non-awaited `$$().getElements()` or `$$().filter()` (e.g. Promise<WebdriverIO.Element[]>), but typings does not allow it
    if (awaitedElements instanceof Promise) {
        awaitedElements = await awaitedElements
    }

    if (!isElementArrayLike(awaitedElements)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { other: awaitedElements as any }
    }

    // for `await $$()` or `WebdriverIO.ElementArray` but not `WebdriverIO.Element[]`
    if ('getElements' in awaitedElements) {
        return { elements: await awaitedElements.getElements() }
    }

    // for `WebdriverIO.Element[]` or any other object
    return { elements: awaitedElements }
}

export const map = <T>(
    elements: WebdriverIO.ElementArray | WebdriverIO.Element[],
    command: (element: WebdriverIO.Element, index: number)  => Promise<T>
): Promise<T[]> => {
    const results: Promise<T>[] = []
    elements.forEach((element, index) => {
        results.push(command(element, index))
    })
    return Promise.all(results)
}

