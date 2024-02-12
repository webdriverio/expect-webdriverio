import type { ExpectationResult, MatcherContext } from 'expect'

export type WdioElementMaybePromise =
    WebdriverIO.Element | WebdriverIO.ElementArray |
    Promise<WebdriverIO.Element> | Promise<WebdriverIO.ElementArray>

export type RawMatcherFn<Context extends MatcherContext = MatcherContext> = {
    (this: Context, actual: any, ...expected: Array<any>): ExpectationResult;
}
