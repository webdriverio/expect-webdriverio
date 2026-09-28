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

export type WdioMultiRemoteElements = WebdriverIO.MultiRemoteElement | WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray

/** Multi-remote `$$()` result: WebdriverIO v10 `WebdriverIO.MultiRemoteElementArray`, missing from the v9 types (#2246) */
export type WdioMultiRemoteElementArray = Omit<WebdriverIO.ElementArray, 'parent' | 'getElements'> & {
    parent: WebdriverIO.MultiRemoteBrowser | WebdriverIO.MultiRemoteElement
    isMultiRemote: true
    getElements(): Promise<WdioMultiRemoteElementArray>
}

export type RawMatcherFn<Context extends MatcherContext = MatcherContext> = {
    (this: Context, actual: unknown, ...expected: unknown[]): ExpectationResult;
}

export type MaybeArray<T> = T | T[]
export type MaybeArrayOrMultiRemoteValuesWithArray<T> = MaybeArray<T> | MultiRemoteValuesWithArray<T>
export type MultiRemoteValuesWithArray<T> = MultiRemoteValues<T | T[]>
export type MultiRemoteValues<T> = Record<string, T>
export type MaybeSome<T> = T | SomeElementsWrapper<T>
