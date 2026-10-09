import { waitUntil, enhanceError, compareTextOrOneOf } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeBrowserCommand } from '../../util/executeBrowserCommand.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import { withStringOptions } from '../../util/expectedWithStringOptions.js'
import type { AssertionResult, StringOptions } from '../../publicTypes/options.js'

/**
 * Browser
 */
export async function toHaveUrl(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser | WebdriverIO.BrowsingContext,
    expectedValue: MaybeOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Browser
 */
export async function toHaveUrl(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.MultiRemoteBrowser,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: StringOptions
): Promise<AssertionResult>

export async function toHaveUrl(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser | WebdriverIO.BrowsingContext | WebdriverIO.MultiRemoteBrowser,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'url', verb = 'have', isNot, matcherName = 'toHaveUrl' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    // Apply the string options to `expect.oneOf()`, also when nested in per-instance values
    const expectedWithOptions = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const { success: pass, actual, subject, expected, verdict, compared } = await waitUntil(
        async () => {
            return await executeBrowserCommand({
                browser,
                isNot,
                expectedValue: expectedWithOptions,
                compare: (
                    browser, expectedValue: string | RegExp | AsymmetricMatcher<string> | undefined
                ) => compareUrl(browser, expectedValue, options),
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(subject, withStringOptions(expected, verdict, options, actual), actual, { isNot, browserTargetType: 'window', showContextUrl: false, stringOptions: options, compared }, verb, expectation, '', options)
    const result: AssertionResult = {
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
    browser: WebdriverIO.Browser | WebdriverIO.BrowsingContext,
    expectedValue: string | RegExp | AsymmetricMatcher<string> | undefined,
    options: StringOptions
): Promise<CompareResult<string>> => {
    const actual = await browser.getUrl()
    return compareTextOrOneOf(actual, expectedValue, options)
}
