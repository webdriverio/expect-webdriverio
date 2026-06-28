import type { WdioElements } from '../types'

/**
 * if el is an array of elements and actual value is an array
 * wrap expected value with array
 * @param el element
 * @param actual actual result or results array
 * @param expected expected result
 */
export const wrapExpectedWithArray = (el: WebdriverIO.Element | WebdriverIO.ElementArray, actual: unknown, expected: unknown) => {
    if (Array.isArray(el) && el.length > 1 && Array.isArray(actual)) {
        expected = [expected]
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
    return (!!obj && isStrictlyElementArray(obj)) || (Array.isArray(obj) && obj.length > 0 && obj.every(isElement))
}

export const isElementOrArrayLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] | WebdriverIO.Element => {
    return !!obj && isElement(obj) || isElementArrayLike(obj)
}

export const isElementOrNotEmptyElementArray = (obj: unknown): obj is WebdriverIO.Element | WdioElements => {
    return !!obj && isElement(obj) || (isElementArrayLike(obj) && obj.length > 0)
}
