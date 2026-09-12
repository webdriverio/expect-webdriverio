import { waitUntil, enhanceError, compareTextOrOneOf } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeBrowserCommand } from '../../util/executeBrowserCommand.js'

/**
 * Browser
 */
export async function toHaveUrl(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser,
    expectedValue: MaybeOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Multi-Remote Browser
 */
export async function toHaveUrl(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.MultiRemoteBrowser,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveUrl(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'url', verb = 'have', isNot, matcherName = 'toHaveUrl' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { success: pass, actual, subject, expected } = await waitUntil(
        async () => {
            return await executeBrowserCommand({
                browser,
                expectedValue,
                compare: (
                    browser, expectedValue: string | RegExp | AsymmetricMatcher<string> | undefined
                ) => compareUrl(browser, expectedValue, options),
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(subject, expected, actual, { isNot, browserTargetType: 'window' }, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: () => message
    }

    await options.afterAssertion?.({
        matcherName,
        expectedValue,
        options,
        result
    })

    return result
}

const compareUrl = async (
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | AsymmetricMatcher<string> | undefined,
    options: ExpectWebdriverIO.StringOptions
): Promise<CompareResult<string>> => {
    const actual = await browser.getUrl()
    return compareTextOrOneOf(actual, expectedValue, options)
}
