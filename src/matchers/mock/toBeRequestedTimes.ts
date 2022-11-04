import type { Mock } from 'webdriverio'

import { waitUntil, enhanceError, compareNumbers } from '../../utils.js'
import { numberError } from '../../util/formatMessage.js'

export async function toBeRequestedTimes(received: Mock, expected: number| ExpectWebdriverIO.NumberOptions = {}, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot || false
    const { expectation = `called${typeof expected === 'number' ? ' ' + expected : '' } time${expected !== 1 ? 's' : ''}`, verb = 'be' } = this

    // type check
    const numberOptions: ExpectWebdriverIO.NumberOptions = typeof expected === 'number'
        ? { eq: expected } as ExpectWebdriverIO.NumberOptions
        : expected || {}

    let actual
    const pass = await waitUntil(async () => {
        actual = received.calls.length
        return compareNumbers(actual, numberOptions)
    }, isNot, {...numberOptions, ...options})

    const error = numberError(numberOptions)
    const message = enhanceError('mock', error, actual, this, verb, expectation, '', numberOptions)

    return {
        pass,
        message: (): string => message
    }
}
