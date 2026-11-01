import type { ChainablePromiseArray } from 'webdriverio'
import type { WdioElements } from '../types.js'
import { isMultiRemoteElementArray, isStrictlyElementArray } from './elementsUtil.js'

/**
 * Refetch elements array or return when elements is not of type WebdriverIO.ElementArray or a `MultiRemoteElementArray`
 * @param elements WebdriverIO.ElementArray | WebdriverIO.Element[] | MultiRemoteElementArray
 */
export const refetchElements = async <T extends WdioElements | WebdriverIO.MultiRemoteElementArray>(
    elements: T,
): Promise<T> => {
    if (elements && (isStrictlyElementArray(elements) || isMultiRemoteElementArray(elements))) {
        // WebdriverIO v10 exposes the real provenance of a derived list through
        // refetch(). Replaying the public selector metadata here would discard
        // filter()/filterSeries()/slice() and could introduce unrelated elements.
        const replay = (elements as T & { refetch?: () => Promise<T> }).refetch
        if (typeof replay === 'function') {
            return await replay.call(elements)
        }

        // Compatibility with older WebdriverIO versions whose original query
        // lists do not yet have the public refetch() API (including v9).
        if (elements.parent && elements.foundWith && elements.foundWith in elements.parent) {
            const browser = elements.parent
            const $ = browser[elements.foundWith as keyof typeof browser] as Function
            return await $.call(browser, elements.selector, ...elements.props)
        }
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

export const synchronizeElementArray = <T extends WebdriverIO.ElementArray | WebdriverIO.MultiRemoteElementArray>(subject: T, refetchedElements: T) => {
    subject.length = refetchedElements.length
    for (let index = 0; index < refetchedElements.length; index++) {
        subject[index] = refetchedElements[index]
    }
}

/**
 * Refetch and synchronize `subject` with the latest elements, returning them.
 */
export const refreshElementArray = async <T extends WebdriverIO.ElementArray | WebdriverIO.MultiRemoteElementArray>(subject: T): Promise<T> => {
    const refetchedElements = await refetchElements(subject)
    synchronizeElementArray(subject, refetchedElements)
    return subject
}
