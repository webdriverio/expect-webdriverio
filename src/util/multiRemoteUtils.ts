import { isAsymmetricMatcher } from '../utils.js'
import type { WdioMultiRemoteMock } from '../types.js'

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

/** A `WebdriverIO.Mock`, recognized by its log of `calls` */
export const isMock = (obj: unknown): obj is WebdriverIO.Mock => {
    return typeof obj === 'object' && obj !== null && Array.isArray((obj as { calls?: unknown }).calls)
}

/** The mocks returned by a multi-remote `mock()`, one per instance, or any other non-empty array of mocks */
export const isMockArray = (obj: unknown): obj is WebdriverIO.Mock[] => {
    return Array.isArray(obj) && obj.length > 0 && obj.every(isMock)
}

/** A WebdriverIO v10 multi-remote `mock()`: a `MultiRemoteMock`, which is not an array and has no `calls` */
export const isMultiRemoteMock = (obj: unknown): obj is WdioMultiRemoteMock => {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj) && hasMultiRemoteFlag(obj)
        && Array.isArray((obj as { instances?: unknown }).instances)
        && typeof (obj as { getInstance?: unknown }).getInstance === 'function'
}

/** The instance names of the mocks taken from a `MultiRemoteMock`, which knows them, also after `select()` */
// TODO(#2255) WebdriverIO v9: without the v9 array of mocks, `awaitMocks()` can return the names with the mocks, remove this map
const multiRemoteMockInstanceNames = new WeakMap<WebdriverIO.Mock[], string[]>()

/**
 * The received mock(s) of a network matcher, awaiting an unawaited `mock()`, multi-remote or not.
 * A `MultiRemoteMock` gives its mocks, one per instance.
 * An empty array is rejected: there is no mock to assert on, and every mock of none would vacuously pass.
 */
export const awaitMocks = async <T>(received: T | Promise<WebdriverIO.Mock[] | WdioMultiRemoteMock>): Promise<Exclude<T, WdioMultiRemoteMock> | WebdriverIO.Mock[]> => {
    const awaited = received instanceof Promise ? await received : received
    if (isMultiRemoteMock(awaited)) {
        const multiRemoteMocks = awaited.instances.map((name) => awaited.getInstance(name))
        multiRemoteMockInstanceNames.set(multiRemoteMocks, [...awaited.instances])
        return multiRemoteMocks
    }
    const mocks = awaited as Exclude<T, WdioMultiRemoteMock> | WebdriverIO.Mock[]
    if (Array.isArray(mocks) && mocks.length === 0) {
        throw new Error('Expected a mock or a non-empty array of mocks, received an empty array')
    }
    return mocks
}

/**
 * The name of each mock's instance, or `mocks[index]` when unknown.
 *
 * A WebdriverIO v10 `MultiRemoteMock` names its mocks. A WebdriverIO v9 multi-remote `mock()` returns one mock per
 * instance, in `multiRemoteBrowser.instances` order: the global instance names are used when they are as many as the mocks.
 * Limitation (v9): mocks from `select()` naming every instance but in another order are named in the global order.
 */
export const getMockInstanceNames = (mocks: WebdriverIO.Mock[]): { names: string[], isNamedByInstance: boolean } => {
    const multiRemoteMockNames = multiRemoteMockInstanceNames.get(mocks)
    if (multiRemoteMockNames) {
        return { names: multiRemoteMockNames, isNamedByInstance: true }
    }
    // TODO(#2255) WebdriverIO v9: remove the names from the global instances, only the v9 array of mocks needs them
    const instances = getGlobalMultiRemoteInstanceNames()
    if (instances && instances.length === mocks.length) {
        return { names: instances, isNamedByInstance: true }
    }
    return { names: mocks.map((_, index) => `mocks[${index}]`), isNamedByInstance: false }
}

/** Whether the injected global `browser` is a regular (non multi-remote) browser, i.e. not a multi-remote session */
export const isGlobalBrowserSingleRemote = (): boolean => {
    try {
        return typeof browser !== 'undefined' && isBrowser(browser) && !hasMultiRemoteFlag(browser)
    } catch {
        return false
    }
}

/**
 * WebdriverIO v10 renamed `isMultiremote` to `isMultiRemote`: read both, so one release supports v9 and v10.
 * Reads the properties without `in`: the `@wdio/globals` browser is a Proxy of a class with only a `get` trap.
 */
export const hasMultiRemoteFlag = (obj: unknown): boolean => {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
        return false
    }
    const { isMultiRemote, isMultiremote } = obj as { isMultiRemote?: unknown, isMultiremote?: unknown }
    return isMultiRemote === true || isMultiremote === true
}

export const isMultiRemoteBrowser = (browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser): browser is WebdriverIO.MultiRemoteBrowser =>
    hasMultiRemoteFlag(browser)

export const isBrowser = (obj: unknown): obj is WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser => {
    // The `@wdio/globals` proxies bind every function they return, `constructor` included, so its name is prefixed with `bound `
    const name = (obj as { constructor?: { name?: string } } | undefined)?.constructor?.name?.replace(/^bound /, '')
    return name === 'Browser' || !!name?.endsWith('MultiRemoteDriver')
}
