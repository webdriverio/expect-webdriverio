import { DEFAULT_OPTIONS } from '../constants.js'
import type { WdioElements } from '../types.js'
import { isStrictlyElementArray } from './elementsUtil.js'

/**
 * Refetch elements array or return when elements is not of type WebdriverIO.ElementArray
 * @param elements WebdriverIO.ElementArray | WebdriverIO.Element[]
 */
export const refetchElements = async (
    elements: WdioElements,
    wait = DEFAULT_OPTIONS.wait,
    full = false
): Promise<WdioElements> => {
    if (elements && wait > 0 && (elements.length === 0 || full) && isStrictlyElementArray(elements)) {
        const browser = elements.parent
        const $$ = browser[elements.foundWith as keyof typeof browser] as Function
        return await $$.call(browser, elements.selector, ...elements.props)
    }
    return elements
}
