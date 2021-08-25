import type { Mock } from 'webdriverio'

import { waitUntil, enhanceError, compareNumbers } from '../../utils'
import { runExpect } from '../../util/expectAdapter'
import { numberError } from '../../util/formatMessage'

export function toBeRequestedTimesFn(received: Mock, expected: number| ExpectWebdriverIO.NumberOptions = {}, options: ExpectWebdriverIO.StringOptions = {}): any {
    const isNot = this.isNot || false
    const { expectation = `called${typeof expected === 'number' ? ' ' + expected : '' } time${expected !== 1 ? 's' : ''}`, verb = 'be' } = this
    
    // type check
    let numberOptions: ExpectWebdriverIO.NumberOptions;
    if (typeof expected === 'number') {
        numberOptions = { eq: expected } as ExpectWebdriverIO.NumberOptions
    } else if (typeof expected === 'object') {
        numberOptions = expected
    }

    return browser.call(async () => {
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
    })
}

export function toBeRequestedTimes(...args: any): any {
    return runExpect.call(this, toBeRequestedTimesFn, args)
}

