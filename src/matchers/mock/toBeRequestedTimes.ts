import { waitUntil, enhanceError } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import { validateNumberMatcher } from '../../util/numberOptionsUtil.js'
import { awaitMocks, isInstanceMocks } from '../../util/multiRemoteUtils.js'
import { formatMultiRemoteInstanceNames, labelMultiRemoteValues } from '../../util/formatMessage.js'
import type { WdioMatcherContext, WdioMultiRemoteMockMaybePromise } from '../../types.js'

export async function toBeRequestedTimes(
    received: WebdriverIO.Mock,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Multi-remote mocks (`multiRemoteBrowser.mock()`): every instance's mock must be called the expected number of times
 */
export async function toBeRequestedTimes(
    received: WdioMultiRemoteMockMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toBeRequestedTimes(
    this: WdioMatcherContext,
    received: WebdriverIO.Mock | WdioMultiRemoteMockMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
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

    const expectedNumber = validateNumberMatcher(expectedValue)

    const mocks = await awaitMocks(received)
    let message: string
    let pass: boolean

    if (isInstanceMocks(mocks)) {
        const { names, mocks: instanceMocks } = mocks
        const result = await waitUntil(
            async () => {
                const actual = Object.fromEntries(instanceMocks.map((mock, index) => [names[index], mock.calls.length]))
                const matches = (name: string) => expectedNumber.asymmetricMatch(actual[name])
                // Strict on every instance: with `.not`, no instance may match (`success` is inverted by `waitUntil`)
                const success = isNot ? names.some(matches) : names.every(matches)
                return { success, subject: instanceMocks, actual }
            },
            isNot,
            { wait: options.wait, interval: options.interval }
        )
        pass = result.success
        const expected = Object.fromEntries(names.map((name) => [name, expectedNumber]))
        message = enhanceError(`${formatMultiRemoteInstanceNames(names)} mocks`, labelMultiRemoteValues(expected), labelMultiRemoteValues(result.actual), this, verb, expectation, '', options)
    } else {
        const mock = mocks
        const result = await waitUntil(
            async () => {
                const actual = mock.calls.length
                return { success: expectedNumber.asymmetricMatch(actual), subject: mock, actual }
            },
            isNot,
            { wait: options.wait, interval: options.interval }
        )
        pass = result.success
        message = enhanceError('mock', expectedNumber, result.actual, this, verb, expectation, '', options)
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
