import { waitUntil, enhanceError } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import { validateNumberAndExtractOptions } from '../../util/numberOptionsUtil.js'

export async function toBeRequestedTimes(
    received: WebdriverIO.Mock,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * @deprecated since 5.7.1, will remove in 6.0.0. Use `NumberMatcher` & `CommandOptions` as seperate parameters instead.
 */
export async function toBeRequestedTimes(
    received: WebdriverIO.Mock,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
):Promise<ExpectWebdriverIO.AssertionResult>
export async function toBeRequestedTimes(
    received: WebdriverIO.Mock,
    expectedValue: number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
): Promise<ExpectWebdriverIO.AssertionResult> {
    const { expectation = `called${typeof expectedValue === 'number' ? ' ' + expectedValue : '' } time${expectedValue !== 1 ? 's' : ''}`, verb = 'be', isNot = false } = this

    await options.beforeAssertion?.({
        matcherName: 'toBeRequestedTimes',
        expectedValue,
        options,
    })

    const { numberMatcher: expectedNumber, commandOptions } = validateNumberAndExtractOptions(expectedValue, options)

    let actual
    const pass = await waitUntil(async () => {
        actual = received.calls.length
        return expectedNumber.match(actual)
    },
    isNot,
    { wait: commandOptions.wait, interval: commandOptions.interval })

    const message = enhanceError('mock', expectedNumber, actual, this, verb, expectation, '', commandOptions)

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
