import { waitUntil, enhanceError } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import { validateNumberMatcher } from '../../util/numberOptionsUtil.js'
import { awaitMocks, getPerInstanceValues, hasSameInstanceNames, isInstanceMocks } from '../../util/multiRemoteUtils.js'
import { formatMultiRemoteInstanceNames, labelMultiRemoteValues } from '../../util/formatMessage.js'
import type { WdioMatcherContext, WdioMultiRemoteMockMaybePromise } from '../../types.js'
import type { AssertionResult, CommandOptions, NumberMatcher as PublicNumberMatcher } from '../../publicTypes/options.js'
import type { MultiRemoteValues } from '../../publicTypes/expectWebdriverIO.js'

export async function toBeRequestedTimes(
    received: WebdriverIO.Mock,
    expectedValue: number | PublicNumberMatcher,
    options?: CommandOptions
): Promise<AssertionResult>

/**
 * Multi-remote mocks (`multiRemoteBrowser.mock()`): every instance's mock must be called the expected number of times,
 * or its own number of times with `expect.multiRemote({ chrome: 1, firefox: 2 })`
 */
export async function toBeRequestedTimes(
    received: WdioMultiRemoteMockMaybePromise,
    expectedValue: number | PublicNumberMatcher | ExpectWebdriverIO.MultiRemotePartialMatcher<number | PublicNumberMatcher>,
    options?: CommandOptions
): Promise<AssertionResult>

export async function toBeRequestedTimes(
    this: WdioMatcherContext,
    received: WebdriverIO.Mock | WdioMultiRemoteMockMaybePromise,
    expectedValue: number | PublicNumberMatcher | ExpectWebdriverIO.MultiRemotePartialMatcher<number | PublicNumberMatcher>,
    options: CommandOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const {
        verb = 'be', isNot, matcherName = 'toBeRequestedTimes',
        expectation = `called${typeof expectedValue === 'number' ? ' ' + expectedValue : '' } time${expectedValue !== 1 ? 's' : ''}`,
    } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    // Per-instance numbers require `expect.multiRemote()`: a plain object is always a `NumberMatcher`
    const perInstanceValues = getPerInstanceValues(expectedValue, { allowObjectExpectedValue: true }) as MultiRemoteValues<number | PublicNumberMatcher> | undefined
    const expectedNumbers = perInstanceValues
        ? Object.fromEntries(Object.entries(perInstanceValues).map(([name, value]) => [name, validateNumberMatcher(value)]))
        : undefined
    const expectedNumber = expectedNumbers ? undefined : validateNumberMatcher(expectedValue as number | PublicNumberMatcher)

    const mocks = await awaitMocks(received)
    let message: string
    let pass: boolean

    if (isInstanceMocks(mocks)) {
        const { names, mocks: instanceMocks } = mocks
        const expected = expectedNumbers ?? Object.fromEntries(names.map((name) => [name, expectedNumber!]))
        // Per-instance values must name exactly the instances: no retry can fix it
        const forceFailure = !!expectedNumbers && !hasSameInstanceNames(expectedNumbers, names)
        const result = await waitUntil(
            async () => {
                const actual = Object.fromEntries(instanceMocks.map((mock, index) => [names[index], mock.calls.length]))
                if (forceFailure) {
                    return { success: !!isNot, subject: instanceMocks, actual, abort: true }
                }
                const matches = (name: string) => expected[name].asymmetricMatch(actual[name])
                // Strict on every instance: with `.not`, no instance may match (`success` is inverted by `waitUntil`)
                const success = isNot ? names.some(matches) : names.every(matches)
                return { success, subject: instanceMocks, actual }
            },
            isNot,
            { wait: options.wait, interval: options.interval }
        )
        pass = result.success
        message = enhanceError(`${formatMultiRemoteInstanceNames(names)} mocks`, labelMultiRemoteValues(expected), labelMultiRemoteValues(result.actual), this, verb, expectation, '', options)
    } else {
        const mock = mocks
        const result = await waitUntil(
            async () => {
                const actual = mock.calls.length
                // Per-instance values can never match a single mock
                if (expectedNumbers) {
                    return { success: !!isNot, subject: mock, actual, abort: true }
                }
                return { success: expectedNumber!.asymmetricMatch(actual), subject: mock, actual }
            },
            isNot,
            { wait: options.wait, interval: options.interval }
        )
        pass = result.success
        message = enhanceError('mock', expectedNumbers ? labelMultiRemoteValues(expectedNumbers) : expectedNumber, result.actual, this, verb, expectation, '', options)
    }

    const result: AssertionResult = {
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
