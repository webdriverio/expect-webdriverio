import type { ChainablePromiseArray } from 'webdriverio'
import type { WdioElements } from '../types.js'
import { isStrictlyElementArray } from './elementsUtil.js'

/**
 * Refetch elements array or return when elements is not of type WebdriverIO.ElementArray
 * @param elements WebdriverIO.ElementArray | WebdriverIO.Element[]
 */
export const refetchElements = async <T extends WdioElements>(
    elements: T,
): Promise<T> => {
    if (elements
        && isStrictlyElementArray(elements)
        && elements.parent && elements.foundWith && elements.foundWith in elements.parent) {

        const browser = elements.parent
        const $$ = browser[elements.foundWith as keyof typeof browser] as Function
        return await $$.call(browser, elements.selector, ...elements.props)
    }
    return elements
}

export const syncronizeElements = async (subject: WebdriverIO.ElementArray | ChainablePromiseArray | Promise<unknown>, refetchedElements: WebdriverIO.ElementArray) => {
    if (subject instanceof Promise) {
        await syncronizeChainableElementArray(subject, refetchedElements)
    } else if (isStrictlyElementArray(subject)) {
        synchronizeElementArray(subject, refetchedElements)
    }
}

export const syncronizeChainableElementArray = async (subject: ChainablePromiseArray | Promise<unknown>, refetchedElements: WebdriverIO.ElementArray) => {
    const awaitedSubject = await subject
    if (isStrictlyElementArray(awaitedSubject) && refetchedElements) {
        await synchronizeElementArray(await awaitedSubject.getElements(), refetchedElements)
    }
}

export const synchronizeElementArray = (subject: WebdriverIO.ElementArray, refetchedElements: WebdriverIO.ElementArray) => {
    subject.length = refetchedElements.length
    for (let index = 0; index < refetchedElements.length; index++) {
        subject[index] = refetchedElements[index]
    }
}

export const refreshElementArray = async (subject: WebdriverIO.ElementArray) => {
    const refetchedElements = await refetchElements(subject)
    synchronizeElementArray(subject, refetchedElements)
}
