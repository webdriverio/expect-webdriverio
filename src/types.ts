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

export type WdioMultiRemoteElements = WebdriverIO.MultiRemoteElement | WebdriverIO.MultiRemoteElementArray

/** A WebdriverIO v10 browsing context (a tab, a window or a frame), with fields that its public type does not declare in 10.0.1 */
export type WdioBrowsingContext = WebdriverIO.BrowsingContext & { browser: WebdriverIO.Browser, isFrame: boolean, url: string }

/** Multi-remote `mock()`, awaited or not */
export type WdioMultiRemoteMockMaybePromise = WebdriverIO.MultiRemoteMock | Promise<WebdriverIO.MultiRemoteMock>

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
