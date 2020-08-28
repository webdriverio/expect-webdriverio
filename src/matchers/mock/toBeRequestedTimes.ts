import { waitUntil, enhanceError, compareNumbers } from '../../utils'
import { runExpect } from '../../util/expectAdapter'
import { numberError } from '../../util/formatMessage'

function toBeRequestedTimesFn(received: WebdriverIO.Mock, times: number | ExpectWebdriverIO.NumberOptions = {}, options: ExpectWebdriverIO.CommandOptions = {}): any {
    const isNot = this.isNot || false
    const { expectation = `called${typeof times === 'number' ? ' ' + times : '' } time${times !== 1 ? 's' : ''}`, verb = 'be' } = this

    const eq = typeof times === 'number' ? times : times.eq
    const gte = typeof times === 'number' ? 1 : (times.gte || 1)
    const lte = typeof times === 'number' ? 0 : (times.lte || 0)

    return browser.call(async () => {
        let actual

        const pass = await waitUntil(async () => {
            actual = received.calls.length
            return compareNumbers(actual, gte, lte, eq)
        }, isNot, options)

        const error = numberError(gte, lte, eq)
        const message = enhanceError('mock', error, actual, this, verb, expectation, '', options)

        return {
            pass,
            message: (): string => message
        }
    })
}

export function toBeRequestedTimes(...args: any): any {
    return runExpect.call(this, toBeRequestedTimesFn, args)
}

