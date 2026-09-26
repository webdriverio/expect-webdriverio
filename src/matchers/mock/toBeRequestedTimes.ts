import { waitUntil, enhanceError } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import { validateNumberAndExtractOptions } from '../../util/numberOptionsUtil.js'
import { awaitMocks, getMockInstanceNames, isMockArray } from '../../util/multiRemoteUtils.js'
import { formatMultiRemoteMocks, labelMultiRemoteValues } from '../../util/formatMessage.js'

export async function toBeRequestedTimes(
    received: WebdriverIO.Mock,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Multi-remote mocks (`multiRemoteBrowser.mock()`): every instance's mock must be called the expected number of times
 */
export async function toBeRequestedTimes(
    received: WebdriverIO.Mock[] | Promise<WebdriverIO.Mock[]>,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * @deprecated since v6.0.0, remove in v8.0.0. Use `NumberMatcher` & `CommandOptions` as separate parameters instead.
 */
export async function toBeRequestedTimes(
    received: WebdriverIO.Mock,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
):Promise<ExpectWebdriverIO.AssertionResult>

export async function toBeRequestedTimes(
    received: WebdriverIO.Mock | WebdriverIO.Mock[] | Promise<WebdriverIO.Mock[]>,
    expectedValue: number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
): Promise<ExpectWebdriverIO.AssertionResult> {
    const {
        verb = 'be', isNot, matcherName = 'toBeRequestedTimes',
        expectation = `called${typeof expectedValue === 'number' ? ' ' + expectedValue : '' } time${expectedValue !== 1 ? 's' : ''}`,
    } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { numberMatcher: expectedNumber, commandOptions } = validateNumberAndExtractOptions(expectedValue, options)

    const mocks = await awaitMocks(received)
    let message: string
    let pass: boolean

    if (isMockArray(mocks)) {
        const instanceNames = getMockInstanceNames(mocks)
        const { names } = instanceNames
        // Mocks named by index may not be multi-remote ones, so they keep the plain `Object` label
        const label = (value: unknown) => instanceNames.isNamedByInstance ? labelMultiRemoteValues(value) : value
        const result = await waitUntil(
            async () => {
                const actual = Object.fromEntries(mocks.map((mock, index) => [names[index], mock.calls.length]))
                const matches = (name: string) => expectedNumber.asymmetricMatch(actual[name])
                // Strict on every instance: with `.not`, no instance may match (`success` is inverted by `waitUntil`)
                const success = isNot ? names.some(matches) : names.every(matches)
                return { success, subject: mocks, actual }
            },
            isNot,
            { wait: commandOptions.wait, interval: commandOptions.interval }
        )
        pass = result.success
        const expected = Object.fromEntries(names.map((name) => [name, expectedNumber]))
        message = enhanceError(formatMultiRemoteMocks(instanceNames), label(expected), label(result.actual), this, verb, expectation, '', commandOptions)
    } else {
        const mock = mocks as WebdriverIO.Mock
        const result = await waitUntil(
            async () => {
                const actual = mock.calls.length
                return { success: expectedNumber.asymmetricMatch(actual), subject: mock, actual }
            },
            isNot,
            { wait: commandOptions.wait, interval: commandOptions.interval }
        )
        pass = result.success
        message = enhanceError('mock', expectedNumber, result.actual, this, verb, expectation, '', commandOptions)
    }

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
