import { toBeRequestedTimes } from './toBeRequestedTimes.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export function toBeRequested(received: WebdriverIO.Mock | WebdriverIO.Mock[] | Promise<WebdriverIO.Mock[]>, options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS) {
    // Same implementation for a mock or multi-remote mocks, the overloads only split them for the public typing
    return toBeRequestedTimes.call({ ...(this || {}), expectation: 'called' }, received as WebdriverIO.Mock, { gte: 1 }, options)
}
