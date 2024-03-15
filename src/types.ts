import type { ExpectationResult, MatcherContext } from 'expect'
import type { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio'

export type WdioElementMaybePromise =
    WebdriverIO.Element |
    ChainablePromiseElement<WebdriverIO.Element>

export type WdioElementsMaybePromise =
    WebdriverIO.ElementArray |
    ChainablePromiseArray<WebdriverIO.Element>

export type RawMatcherFn<Context extends MatcherContext = MatcherContext> = {
    (this: Context, actual: any, ...expected: Array<any>): ExpectationResult;
}
