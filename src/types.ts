import type { ExpectationResult, MatcherContext } from 'expect'
import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio'
import type { SomeElementsWrapper } from './matchers/modifiers/some.js'

export type WdioElementMaybePromise =
    WebdriverIO.Element |
    ChainablePromiseElement

export type WdioElements = WebdriverIO.ElementArray | WebdriverIO.Element[]

export type WdioElementsMaybePromise =
    WdioElements |
    ChainablePromiseArray | Promise<WebdriverIO.Element[]> | Promise<WebdriverIO.ElementArray>

export type WdioElementOrArrayMaybePromise =
    WdioElementMaybePromise | WdioElementsMaybePromise

export type MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements =
    MaybeSome<WdioElementMaybePromise | WdioElementsMaybePromise | WdioMultiRemoteElements>

export type WdioMultiRemoteElements = WebdriverIO.MultiRemoteElement | WdioMultiRemoteElementArray

/**
 * A multi-remote `$$()`: its parent is the multi-remote browser (or its `select()` subset) or a multi-remote element,
 * which has the instances that `$$()` queried, in the same order, also when no element was found.
 * TODO(#2255) WebdriverIO v9: use the WebdriverIO v10 `MultiRemoteElementArray` type instead
 */
export type WdioMultiRemoteElementArray = WebdriverIO.ElementArray
    & { parent: WebdriverIO.MultiRemoteBrowser | WebdriverIO.MultiRemoteElement }
    & { isMultiRemote: true }

/** WebdriverIO v10 multi-remote `mock()`: a `MultiRemoteMock` with one mock per instance name, not in the v9 types */
// TODO(#2255) WebdriverIO v9: use the WebdriverIO v10 `MultiRemoteMock` type instead
export type WdioMultiRemoteMock = { isMultiRemote: true, instances: readonly string[], getInstance(name: string): WebdriverIO.Mock }

/** Multi-remote `mock()`: one mock per instance, as an array (WebdriverIO v9) or a `MultiRemoteMock` (v10) */
// TODO(#2255) WebdriverIO v9: remove the `WebdriverIO.Mock[]` of the v9 `mock()`
export type WdioMultiRemoteMocks = WebdriverIO.Mock[] | WdioMultiRemoteMock | Promise<WebdriverIO.Mock[] | WdioMultiRemoteMock>

/** The `this` of a matcher: the public context, and the internal options that some matchers set */
export type WdioMatcherContext = ExpectWebdriverIO.MatcherContext & {
    /** An empty element set passes instead of failing (e.g. `.not.toExist()`) */
    allowEmptyElements?: boolean
    /** Browser Runner: the stack line of the `toMatchInlineSnapshot()` call in the browser */
    errorStack?: string
    /** `toHaveElementProperty`: the expected value can be a plain object (false for `toHaveValue`) */
    allowObjectExpectedValue?: boolean
    /** The `expect` library context has more properties (`utils`, `equals`, `promise`, ...) */
    [key: string]: unknown
}

export type RawMatcherFn<Context extends MatcherContext = MatcherContext> = {
    (this: Context, actual: unknown, ...expected: unknown[]): ExpectationResult;
}

export type MaybeArray<T> = T | T[]
export type MaybeArrayOrMultiRemoteValuesWithArray<T> = MaybeArray<T> | MultiRemoteValuesWithArray<T>
export type MultiRemoteValuesWithArray<T> = MultiRemoteValues<T | T[]>
export type MultiRemoteValues<T> = Record<string, T>
export type MaybeSome<T> = T | SomeElementsWrapper<T>
