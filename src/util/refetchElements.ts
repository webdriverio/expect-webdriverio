import { DEFAULT_OPTIONS } from '../constants.js'
import type { WdioElements } from '../types.js'
import { isStrictlyElementArray } from './elementsUtil.js'

/**
 * Refetch elements array or return when elements is not of type WebdriverIO.ElementArray
 * @param elements WebdriverIO.ElementArray | WebdriverIO.Element[]
 */
export const refetchElements = async <T extends WdioElements>(
    elements: T,
    wait = DEFAULT_OPTIONS.wait,
    full = false
): Promise<T> => {
    if (elements && wait > 0
        && (elements.length === 0 || full)
        && isStrictlyElementArray(elements)
        && elements.parent && elements.foundWith && elements.foundWith in elements.parent) {

        const browser = elements.parent
        const $$ = browser[elements.foundWith as keyof typeof browser] as Function
        return await $$.call(browser, elements.selector, ...elements.props)
    }
    return elements
}

export const replaceElements = (subject: WebdriverIO.ElementArray, refetchedElements: WebdriverIO.ElementArray): WebdriverIO.ElementArray => {
    if (Array.isArray(subject) && refetchedElements && refetchedElements.length > 0) {
        for (let index = 0; index < refetchedElements.length; index++) {
            subject[index] = refetchedElements[index]
        }
    }
    return subject
}

export const refreshElements = async (subject: WebdriverIO.ElementArray, wait = DEFAULT_OPTIONS.wait, full = false): Promise<WebdriverIO.ElementArray> => {
    const refetchedElements = await refetchElements(subject, wait, full)
    return replaceElements(subject, refetchedElements)
}
