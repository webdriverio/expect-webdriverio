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

/** Brand of `expect.multiRemote()`, through the global symbol registry to be recognized across module instances */
export const MULTI_REMOTE_MATCHER_SYMBOL = Symbol.for('expect-webdriverio.multiRemote')

/** Whether the value is an `expect.multiRemote()` matcher, holding one expected value per instance in its `sample` */
export const isMultiRemoteMatcher = (value: unknown): value is { sample: MultiRemoteValues<unknown> } => {
    return !!value && typeof value === 'object' && (value as Record<symbol, unknown>)[MULTI_REMOTE_MATCHER_SYMBOL] === true
}

/**
 * The expected values per multi-remote instance, or `undefined` for a single expected value shared by every instance.
 * - `expect.multiRemote({ chrome: ..., firefox: ... })` always holds per-instance values.
 * - A plain object is the per-instance shorthand, except for matchers whose expected value can itself be a plain object
 *   (e.g. `toHaveStyle`, `toHaveSize`): for them it is always a literal, and `expect.multiRemote()` must be used.
 * Instance names are not used to tell them apart, so unknown or misspelled ones are caught by `hasSameInstanceNames`.
 */
export const getPerInstanceValues = (value: unknown, { allowObjectExpectedValue = false } = {}): MultiRemoteValues<unknown> | undefined => {
    if (isMultiRemoteMatcher(value)) {
        return value.sample
    }
    return !allowObjectExpectedValue && isMultiRemoteValues(value) ? value : undefined
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

/** Whether the injected global `browser` is a regular (non multi-remote) browser, i.e. not a multi-remote session */
export const isGlobalBrowserSingleRemote = (): boolean => {
    try {
        return typeof browser !== 'undefined' && isBrowser(browser) && !browser.isMultiremote
    } catch {
        return false
    }
}

export const isBrowser = (obj: unknown): obj is WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser => {
    // The `@wdio/globals` proxies bind every function they return, `constructor` included, so its name is prefixed with `bound `
    const name = (obj as { constructor?: { name?: string } } | undefined)?.constructor?.name?.replace(/^bound /, '')
    return name === 'Browser' || !!name?.endsWith('MultiRemoteDriver')
}
