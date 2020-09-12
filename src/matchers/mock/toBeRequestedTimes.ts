import { waitUntil, enhanceError, compareNumbers } from '../../utils'
import { runExpect } from '../../util/expectAdapter'
import { numberError } from '../../util/formatMessage'

export function toBeRequestedTimesFn(received: WebdriverIO.Mock, times: number | ExpectWebdriverIO.NumberOptions = {}, options: ExpectWebdriverIO.NumberOptions = {}): any {
    const isNot = this.isNot || false
    const { expectation = `called${typeof times === 'number' ? ' ' + times : '' } time${times !== 1 ? 's' : ''}`, verb = 'be' } = this

    // type check
    if (typeof times === 'number') {
        options.eq = times
    } else if (typeof times === 'object') {
        options = { ...options, ...times }
    }

    const eq = options.eq
    const gte = options.gte || 1
    const lte = options.lte || 0

    return browser.call(async () => {
        let actual

        const pass = await waitUntil(async () => {
            actual = received.calls.length
            return compareNumbers(actual, gte, lte, eq)
        }, isNot, { ...options, wait: isNot ? 0 : options.wait })

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

