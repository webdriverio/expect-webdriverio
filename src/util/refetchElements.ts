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
        // Fallback when WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY is disabled. If array is not empty we have a selector! To remove once env Flag is removed.
        const selector = elements.find((element) => !!element.selector)?.selector
        if (selector) {
            warnMultiRemoteRefetchFallbackOnce()
            // Without injected globals there is nothing to refetch from, so keep comparing the current elements.
            if (typeof multiRemoteBrowser === 'undefined') {
                return elements
            }
            return await multiRemoteBrowser.$$(selector) as T
        }
    }
    return elements
}

let hasWarnedMultiRemoteRefetchFallback = false
/**
 * A plain `MultiRemoteElement[]` keeps no reference to its parent (browser, element or `select()` subset), so the
 * best we can do is to re-query the selector from the global `multiRemoteBrowser`, which can target the wrong scope.
 */
const warnMultiRemoteRefetchFallbackOnce = () => {
    if (hasWarnedMultiRemoteRefetchFallback) {
        return
    }
    hasWarnedMultiRemoteRefetchFallback = true
    console.warn('expect-webdriverio: refetching multi-remote elements between retries is best effort: they are re-queried from the global `multiRemoteBrowser`, ignoring any parent element or `select()` scope. Set `WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY=true` for reliable retries.')
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

/**
 * Refetch and synchronize `subject` with the latest elements, returning them.
 * Best-effort fallback exception: a plain `MultiRemoteElement[]` only knows its selector through its elements, so when
 * the refetch is empty it is not synchronized (else it could never be refetched again) and the empty result is returned.
 */
export const refreshElementArray = async <T extends WebdriverIO.ElementArray | WebdriverIO.MultiRemoteElement[]>(subject: T): Promise<T> => {
    const refetchedElements = await refetchElements(subject)
    if (refetchedElements.length === 0 && isMultiRemoteElements(subject)) {
        return refetchedElements
    }
    synchronizeElementArray(subject, refetchedElements)
    return subject
}
