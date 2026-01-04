import type { ExpectationResult, MatcherContext } from 'expect'
import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio'

export type WdioElementMaybePromise =
    WebdriverIO.Element |
    ChainablePromiseElement

export type WdioElements = WebdriverIO.ElementArray | WebdriverIO.Element[]

export type WdioElementsMaybePromise =
    WdioElements |
    ChainablePromiseArray

export type RawMatcherFn<Context extends MatcherContext = MatcherContext> = {
    (this: Context, actual: unknown, ...expected: unknown[]): ExpectationResult;
}

export type WdioMatchersObject = Map<string, RawMatcherFn>
