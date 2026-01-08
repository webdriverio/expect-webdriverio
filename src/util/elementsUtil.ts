import type { WdioElementOrArrayMaybePromise, WdioElements } from '../types'

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

export const isElementArray = (obj: unknown): obj is WebdriverIO.ElementArray => {
    return obj !== null && typeof obj === 'object' && 'selector' in obj && 'foundWith' in obj && 'parent' in obj
}

export const isAnyKindOfElementArray = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] => {
    return Array.isArray(obj) || isElementArray(obj)
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
export const awaitElements = async(received: WdioElementOrArrayMaybePromise | undefined): Promise<{ elements: WdioElements | undefined, isSingleElement?: boolean, isElementLikeType: boolean }> => {
    // For non-awaited `$()` or `$$()`, so ChainablePromiseElement | ChainablePromiseArray.
    // At some extend it also process non-awaited `$().getElement()`, `$$().getElements()` or `$$().filter()`, but typings does not allow it
    if (received instanceof Promise) {
        received = await received
    }

    if (!received || (typeof received !== 'object')) {
        return { elements: received, isElementLikeType: false }
    }

    // for `await $()` or `WebdriverIO.Element`
    if ('getElement' in received) {
        return { elements: [await received.getElement()], isSingleElement: true, isElementLikeType: true }
    }
    // for `await $$()` or `WebdriverIO.ElementArray` but not `WebdriverIO.Element[]`
    if ('getElements' in received) {
        return { elements: await received.getElements(), isSingleElement: false, isElementLikeType: true }
    }

    // for `WebdriverIO.Element[]` or any other object
    return { elements: received, isSingleElement: false, isElementLikeType: Array.isArray(received) && received.every(el => 'getElement' in el) }
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

