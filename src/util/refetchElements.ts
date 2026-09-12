import type { ChainablePromiseArray } from 'webdriverio'
import type { WdioElements } from '../types.js'
import { isMultiRemoteElementArray, isMultiRemoteElements, isStrictlyElementArray } from './elementsUtil.js'

/**
 * Refetch elements array or return when elements is not of type WebdriverIO.ElementArray or WebdriverIO.MultiRemoteElement[]
 * For MultiRemote elements refetch it needs WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = 'true' which return a fake "MultiRemoteElementArray" at runtime.
 * @param elements WebdriverIO.ElementArray | WebdriverIO.Element[] | WebdriverIO.MultiRemoteElement[]
 */
export const refetchElements = async <T extends WdioElements | WebdriverIO.MultiRemoteElement[]>(
    elements: T,
): Promise<T> => {
    if (elements
        && (isStrictlyElementArray(elements) || isMultiRemoteElementArray(elements))
        && elements.parent && elements.foundWith && elements.foundWith in elements.parent) {

        const browser = elements.parent
        const $$ = browser[elements.foundWith as keyof typeof browser] as Function
        return await $$.call(browser, elements.selector, ...elements.props)
    } else if (isMultiRemoteElements(elements)) {
        // Fallback if WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY need to be disabled. If array is not empty we have a selector! To remove once env Flag is removed.
        const selector = elements.find((element) => !!element.selector)?.selector
        if (selector) {
            return await multiRemoteBrowser.$$(selector) as T
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

export const synchronizeElementArray = (subject: WebdriverIO.ElementArray | WebdriverIO.MultiRemoteElement[], refetchedElements: WebdriverIO.ElementArray | WebdriverIO.MultiRemoteElement[]) => {
    subject.length = refetchedElements.length
    for (let index = 0; index < refetchedElements.length; index++) {
        subject[index] = refetchedElements[index]
    }
}

export const refreshElementArray = async (subject: WebdriverIO.ElementArray | WebdriverIO.MultiRemoteElement[]) => {
    const refetchedElements = await refetchElements(subject)
    synchronizeElementArray(subject, refetchedElements)
}
