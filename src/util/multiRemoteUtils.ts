import { isAsymmetricMatcher } from '../utils.js'

export const isMultiRemoteValues = (value: unknown, existingInstanceNames?: string[]): value is MultiRemoteValues<unknown> =>  {
    if (value && typeof value === 'object' && !Array.isArray(value) && !isAsymmetricMatcher(value) && !(value instanceof RegExp) && Object.keys(value).length > 0) {
        if (existingInstanceNames) {
            return existingInstanceNames?.some(name => Object.keys(value).includes(name))
        }
        return true
    }
    return false
}

/** Strict multi-remote check: the per-instance expected values must name exactly the instances, no more, no less. */
export const hasSameInstanceNames = (expected: MultiRemoteValues<unknown>, instances: string[]): boolean => {
    const names = Object.keys(expected)
    return names.length === instances.length && instances.every((name) => names.includes(name))
}

/**
 * Whether the expected value holds one value per multi-remote instance.
 * By default any plain object is per-instance values since no literal expected value can be a plain object, so unknown
 * or misspelled instance names are caught by `hasSameInstanceNames`. For matchers whose expected value can itself be a
 * plain object (e.g. `toHaveStyle`, `toHaveSize`), at least one key must be an instance name to be per-instance values.
 */
export const isPerInstanceValues = (value: unknown, instances: string[], { allowObjectExpectedValue = false } = {}): value is MultiRemoteValues<unknown> => {
    return isMultiRemoteValues(value, allowObjectExpectedValue ? instances : undefined)
}

/**
 * Splits a multi-remote `$$()` result back into each instance's own elements.
 * WebdriverIO zips the per-instance results by index, so when instances find a different number of elements the
 * trailing wrappers hold no element for the instances that found fewer (and `getInstance` then throws).
 */
export const getElementsPerInstance = (multiRemoteElements: WebdriverIO.MultiRemoteElement[] | ArrayLike<WebdriverIO.MultiRemoteElement>, instances: string[]): MultiRemoteValues<WebdriverIO.Element[]> => {
    return Object.fromEntries(instances.map((name) => {
        const elements: WebdriverIO.Element[] = []
        // Plain loop to bypass the asynchronous iterators of `MultiRemoteElementArray`
        for (let index = 0; index < multiRemoteElements.length; index++) {
            const element = getInstanceOrUndefined(multiRemoteElements[index], name)
            if (element) {
                elements.push(element)
            }
        }
        return [name, elements]
    }))
}

const getInstanceOrUndefined = (element: WebdriverIO.MultiRemoteElement, name: string): WebdriverIO.Element | undefined => {
    try {
        return element.getInstance(name) || undefined
    } catch {
        return undefined
    }
}

/**
 * Best effort: the instance names of the global `multiRemoteBrowser` injected by the testrunner, ignoring any `select()` subset.
 * `undefined` without injected globals, or when the `@wdio/globals` proxy has no registered browser (it then throws).
 */
export const getGlobalMultiRemoteInstanceNames = (): string[] | undefined => {
    try {
        const instances = typeof multiRemoteBrowser === 'undefined' ? undefined : multiRemoteBrowser.instances
        return Array.isArray(instances) ? instances : undefined
    } catch {
        return undefined
    }
}

export const isBrowser = (obj: unknown): obj is WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser => {
    // The `@wdio/globals` proxies bind every function they return, `constructor` included, so its name is prefixed with `bound `
    const name = (obj as { constructor?: { name?: string } } | undefined)?.constructor?.name?.replace(/^bound /, '')
    return name === 'Browser' || !!name?.endsWith('MultiRemoteDriver')
}
