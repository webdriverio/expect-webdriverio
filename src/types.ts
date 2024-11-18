import type { ExpectationResult, MatcherContext } from 'expect'
import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio'

export type WdioElementMaybePromise =
    WebdriverIO.Element |
    ChainablePromiseElement

export type WdioElementsMaybePromise =
    WebdriverIO.ElementArray |
    ChainablePromiseArray

export type RawMatcherFn<Context extends MatcherContext = MatcherContext> = {
    (this: Context, actual: unknown, ...expected: unknown[]): ExpectationResult;
}
