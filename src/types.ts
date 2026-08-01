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

export type MaybeSomeWdioElementOrArrayMaybePromise =
    MaybeSome<WdioElementMaybePromise | WdioElementsMaybePromise>

export type RawMatcherFn<Context extends MatcherContext = MatcherContext> = {
    (this: Context, actual: unknown, ...expected: unknown[]): ExpectationResult;
}

export type MaybeArray<T> = T | T[]
export type MaybeSome<T> = T | SomeElementsWrapper<T>
