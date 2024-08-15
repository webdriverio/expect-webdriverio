import { toBeRequestedTimes } from './toBeRequestedTimes.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export function toBeRequested(received: WebdriverIO.Mock, options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS): any {
    return toBeRequestedTimes.call({ ...(this || {}), expectation: 'called' }, received, { gte: 1 }, options)
}
