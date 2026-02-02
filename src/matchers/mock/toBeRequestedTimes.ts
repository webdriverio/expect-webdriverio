import { waitUntil, enhanceError } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import { isNumber, validateNumberOptions } from '../../util/numberOptionsUtil.js'

export async function toBeRequestedTimes(
    received: WebdriverIO.Mock,
    expectedValue: number | ExpectWebdriverIO.NumberOptions = {},
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const {
        expectation = `called${isNumber(expectedValue) ? ' ' + expectedValue : '' } time${expectedValue !== 1 ? 's' : ''}`, verb = 'be',
        isNot, matcherName = 'toBeRequestedTimes'
    } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const  { numberMatcher, numberCommandOptions } = validateNumberOptions(expectedValue)

    let actual
    const pass = await waitUntil(
        async () => {
            actual = received.calls.length
            return numberMatcher.equals(actual)
        },
        isNot,
        { wait: numberCommandOptions?.wait ?? options.wait, interval: numberCommandOptions?.interval ?? options.interval }
    )

    const message = enhanceError('mock', numberMatcher, actual, this, verb, expectation, '', { ...numberCommandOptions, ...options })

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName,
        expectedValue,
        options,
        result
    })

    return result
}
