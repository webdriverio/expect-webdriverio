import { waitUntil, enhanceError, compareNumbers } from '../../utils.js'
import { numberError } from '../../util/formatMessage.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toBeRequestedTimes(
    received: WebdriverIO.Mock,
    expectedValue: number | ExpectWebdriverIO.NumberOptions = {},
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot || false
    const { expectation = `called${typeof expectedValue === 'number' ? ' ' + expectedValue : '' } time${expectedValue !== 1 ? 's' : ''}`, verb = 'be' } = this

    await options.beforeAssertion?.({
        matcherName: 'toBeRequestedTimes',
        expectedValue,
        options,
    })

    // type check
    const numberOptions: ExpectWebdriverIO.NumberOptions = typeof expectedValue === 'number'
        ? { eq: expectedValue } as ExpectWebdriverIO.NumberOptions
        : expectedValue || {}

    let actual
    const pass = await waitUntil(async () => {
        actual = received.calls.length
        return compareNumbers(actual, numberOptions)
    }, isNot, { ...numberOptions, ...options })

    const error = numberError(numberOptions)
    const message = enhanceError('mock', error, actual, this, verb, expectation, '', numberOptions)

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toBeRequestedTimes',
        expectedValue,
        options,
        result
    })

    return result
}
