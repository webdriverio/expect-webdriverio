import { toBeRequestedTimes } from './toBeRequestedTimes.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioMatcherContext, WdioMultiRemoteMockMaybePromise } from '../../types.js'
import type { CommandOptions } from '../../publicTypes/options.js'

export function toBeRequested(this: WdioMatcherContext | void, received: WebdriverIO.Mock | WdioMultiRemoteMockMaybePromise, options: CommandOptions = DEFAULT_OPTIONS) {
    // Same implementation for a mock or multi-remote mocks, the overloads only split them for the public typing
    return toBeRequestedTimes.call({ matcherName: 'toBeRequested', ...(this || {}), expectation: 'called' }, received as WdioMultiRemoteMockMaybePromise, { gte: 1 }, options)
}
