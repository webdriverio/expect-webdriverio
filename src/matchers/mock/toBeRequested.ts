import { toBeRequestedTimes } from './toBeRequestedTimes.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioMatcherContext } from '../../types.js'

export function toBeRequested(this: WdioMatcherContext | void, received: WebdriverIO.Mock | WebdriverIO.Mock[] | Promise<WebdriverIO.Mock[]>, options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS) {
    // Same implementation for a mock or multi-remote mocks, the overloads only split them for the public typing
    return toBeRequestedTimes.call({ matcherName: 'toBeRequested', ...(this || {}), expectation: 'called' }, received as WebdriverIO.Mock[], { gte: 1 }, options)
}
