import type { ChainablePromiseArray } from 'webdriverio'
import type { WdioElements, WdioMultiRemoteElementArray } from '../types.js'
import { isMultiRemoteElementArray, isStrictlyElementArray } from './elementsUtil.js'

/**
 * Refetch an `ElementArray` or a `MultiRemoteElementArray` from its parent (browser, element or `select()` subset).
 * Any other array (`Element[]`, `MultiRemoteElement[]`) keeps no reference to its parent and is returned as is.
 */
export const refetchElements = async <T extends WdioElements | WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray>(
    elements: T,
): Promise<T> => {
    if (elements
        && (isStrictlyElementArray(elements) || isMultiRemoteElementArray(elements))
        && elements.parent && elements.foundWith && elements.foundWith in elements.parent) {

        const parent = elements.parent
        const $$ = parent[elements.foundWith as keyof typeof parent] as Function
        return await $$.call(parent, elements.selector, ...elements.props)
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
        synchronizeElementArray(await awaitedSubject.getElements(), refetchedElements)
    }
}

export const synchronizeElementArray = (subject: WebdriverIO.ElementArray | WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray, refetchedElements: WebdriverIO.ElementArray | WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray) => {
    subject.length = refetchedElements.length
    for (let index = 0; index < refetchedElements.length; index++) {
        subject[index] = refetchedElements[index]
    }
}

/** Refetch and synchronize `subject` with the latest elements, returning it. */
export const refreshElementArray = async <T extends WebdriverIO.ElementArray | WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray>(subject: T): Promise<T> => {
    const refetchedElements = await refetchElements(subject)
    synchronizeElementArray(subject, refetchedElements)
    return subject
}
