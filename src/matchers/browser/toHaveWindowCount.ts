import { DEFAULT_OPTIONS } from '../../constants.js'
import { enhanceError, waitUntil } from '../../utils.js'
import { validateNumberMatcherArray, type NumberMatcher } from '../../util/numberOptionsUtil.js'
import { executeBrowserCommand } from '../../util/executeBrowserCommand.js'
import { isBrowsingContext } from '../../util/multiRemoteUtils.js'
import type { CompareResult } from '../../util/executeCommand.js'
import type { WdioMatcherContext } from '../../types.js'
import type { AssertionResult, CommandOptions } from '../../publicTypes/options.js'
import type { ExpectedOf } from '../../publicTypes/expectWebdriverIO.js'

/**
 * The number of the windows and tabs of the session (`getWindowHandles()`), compared with a `NumberMatcher`, e.g.
 * `toHaveWindowCount(2)` after a link opens a new tab. On a browsing context, it is the count of its session.
 * The expected value is checked first: a wrong one throws, also with `.not`.
 */
export async function toHaveWindowCount(
    this: WdioMatcherContext,
    browser: WebdriverIO.Browser | WebdriverIO.BrowsingContext | WebdriverIO.MultiRemoteBrowser,
    // Internal: the public types (src/publicTypes/) type the value of each matcher
    expectedValue: ExpectedOf<'number'> | ExpectWebdriverIO.MultiRemotePartialMatcher<ExpectedOf<'number'>>,
    options: CommandOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { expectation = 'window count', verb = 'have', isNot, matcherName = 'toHaveWindowCount' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const expectedNumber = validateNumberMatcherArray(expectedValue)

    const { success: pass, actual, subject, expected } = await waitUntil(
        async () => {
            return await executeBrowserCommand({
                browser,
                isNot,
                expectedValue: expectedNumber,
                compare: async (target, value: NumberMatcher | undefined): Promise<CompareResult<number>> => {
                    // A browsing context has no session command: the windows are the ones of its session
                    const session = isBrowsingContext(target) ? target.browser : target
                    const count = (await session.getWindowHandles()).length
                    return { success: value?.asymmetricMatch(count) ?? false, actual: count }
                },
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(subject, expected, actual, { isNot }, verb, expectation, '', options)
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
