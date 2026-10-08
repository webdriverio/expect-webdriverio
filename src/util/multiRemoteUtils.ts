import { isAsymmetricMatcher } from '../utils.js'
import type { WdioBrowsingContext, WdioMultiRemoteMockMaybePromise } from '../types.js'
import { getWdioKind } from './wdioKind.js'

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
export const getElementsPerInstance = (elements: WebdriverIO.MultiRemoteElementArray | readonly WebdriverIO.MultiRemoteElement[], instances: string[]): MultiRemoteValues<WebdriverIO.Element[]> => {
    // The items of a `MultiRemoteElementArray` are `MultiRemoteElement` at runtime
    const multiRemoteElements = elements as unknown as ArrayLike<WebdriverIO.MultiRemoteElement>
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
        return element.getInstance(name)
    } catch {
        return undefined
    }
}

/** A `WebdriverIO.Mock` of one browser */
export const isMock = (obj: unknown): obj is WebdriverIO.Mock => {
    return getWdioKind(obj) === 'mock' && !hasMultiRemoteFlag(obj)
}

/** A multi-remote `mock()`: a `MultiRemoteMock`, which is not an array and has no `calls` */
export const isMultiRemoteMock = (obj: unknown): obj is WebdriverIO.MultiRemoteMock => {
    return getWdioKind(obj) === 'mock' && hasMultiRemoteFlag(obj)
}

/** The mock of each instance of a `MultiRemoteMock`, with the instance names, in its order (also after `select()`) */
export type InstanceMocks = { names: string[], mocks: WebdriverIO.Mock[] }

/**
 * The received mock of a network matcher, awaiting a not-awaited `mock()`. A `MultiRemoteMock` gives its mocks, one per instance.
 * An array is rejected: since WebdriverIO v10, a multi-remote `mock()` is a `MultiRemoteMock`.
 */
export const awaitMocks = async (received: WebdriverIO.Mock | WdioMultiRemoteMockMaybePromise): Promise<WebdriverIO.Mock | InstanceMocks> => {
    const awaited = received instanceof Promise ? await received : received
    if (isMultiRemoteMock(awaited)) {
        return { names: [...awaited.instances], mocks: awaited.instances.map((name) => awaited.getInstance(name)) }
    }
    if (Array.isArray(awaited)) {
        throw new Error('Expected a mock or a multi-remote mock, received an array')
    }
    return awaited
}

export const isInstanceMocks = (mocks: WebdriverIO.Mock | InstanceMocks): mocks is InstanceMocks => {
    return !isMock(mocks) && Array.isArray((mocks as InstanceMocks).mocks)
}

/**
 * Reads the property without `in`: the `@wdio/globals` browser is a Proxy of a class with only a `get` trap.
 */
export const hasMultiRemoteFlag = (obj: unknown): boolean =>
    (obj as { isMultiRemote?: unknown } | null | undefined)?.isMultiRemote === true

export const isMultiRemoteBrowser = (browser: WebdriverIO.Browser | WebdriverIO.BrowsingContext | WebdriverIO.MultiRemoteBrowser): browser is WebdriverIO.MultiRemoteBrowser =>
    getWdioKind(browser) === 'browser' && hasMultiRemoteFlag(browser)

/**
 * A browser, multi-remote or not, or a browsing context (a tab, a window or a frame), which is a browser subject of one browser
 */
export const isBrowser = (obj: unknown): obj is WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser => {
    const kind = getWdioKind(obj)
    return kind === 'browser' || kind === 'browsing-context'
}

/** A browsing context: a tab, a window or a frame, with its own commands, but no session command such as `setPermissions` */
export const isBrowsingContext = (obj: unknown): obj is WdioBrowsingContext => getWdioKind(obj) === 'browsing-context'
