import type { Mock } from 'webdriverio'

import { toBeRequestedTimes } from './toBeRequestedTimes'
import { runExpect } from '../../util/expectAdapter'

function toBeRequestedFn(received: Mock, options: ExpectWebdriverIO.CommandOptions = {}): any {
    return toBeRequestedTimes.call({ ...(this || {}), expectation: 'called' }, received, { ...options, gte: 1 })
}

export function toBeRequested(...args: any): any {
    return runExpect.call(this, toBeRequestedFn, args)
}

