import type { WdioElements } from '../types.js'
import { isDefined } from './objectUtils.js'

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

/**
 * Check if the object is an ElementArray or ChainablePromiseArray
 */
export const isElementArrayOrChainable = (obj: unknown): obj is WebdriverIO.ElementArray | ChainablePromiseArray => {
    return (
        Array.isArray(obj)
        && 'selector' in obj && isDefined(obj.selector)
        && 'parent' in obj && isDefined(obj.parent)
        && 'foundWith' in obj && isDefined(obj.foundWith) // Element does not have foundWith property
        // Cannot check getElements since this is only on successful awaited ElementArray
    )
}

/**
 * Check if the object is strictly a successful awaited ElementArray
 */
export const isStrictlyAwaitedElementArray = (obj: unknown): obj is WebdriverIO.ElementArray => {
    return (
        isElementArrayOrChainable(obj)
        && 'getElements' in obj && isDefined(obj.getElements) // specific to successful awaited ElementArray
    )
}

export const isElement = (obj: unknown): obj is WebdriverIO.Element => {
    // Note elementId is only for found element
    return (
        !!obj && typeof obj === 'object'
        && !Array.isArray(obj)
        && 'selector' in obj && isDefined(obj.selector)
        && 'parent' in obj && isDefined(obj.parent)
        && 'getElement' in obj && isDefined(obj.getElement) // specific to successful awaited Element
    )
}

/**
 * Check if possibly an array of elements like, empty array counts as a valid ElementArray
 */
export const isElementArrayLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] => {
    return !!obj && (isElementArrayOrChainable(obj) || (Array.isArray(obj) && obj.every(isElement)))
}

export const isElementOrArrayLike = (obj: unknown): obj is WebdriverIO.ElementArray | WebdriverIO.Element[] | WebdriverIO.Element => {
    return !!obj && (isElement(obj) || isElementArrayLike(obj))
}

export const isElementOrNotEmptyElementArray = (obj: unknown): obj is WebdriverIO.Element | WdioElements => {
    return !!obj && (isElement(obj) || (isElementArrayLike(obj) && obj.length > 0))
}
