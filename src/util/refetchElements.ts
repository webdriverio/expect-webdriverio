import { DEFAULT_OPTIONS } from '../constants.js'
import type { WdioElements } from '../types.js'
import { isElementArray } from './elementsUtil.js'

/**
 * Refetch elements array or return when elements is not of type WebdriverIO.ElementArray
 * @param elements WebdriverIO.ElementArray | WebdriverIO.Element[]
 */
export const refetchElements = async (
    elements: WdioElements,
    wait = DEFAULT_OPTIONS.wait,
    full = false
): Promise<WdioElements> => {
    if (elements && wait > 0 && (elements.length === 0 || full) && isElementArray(elements) && elements.parent && elements.foundWith && elements.foundWith in elements.parent) {
        const fetchFunction = elements.parent[elements.foundWith as keyof typeof elements.parent] as Function
        elements = await fetchFunction(elements.selector, ...elements.props)
    }
    return elements
}
