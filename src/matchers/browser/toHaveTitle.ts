import { waitUntil, enhanceError, compareTextOrOneOf } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type {  CompareResult } from '../../util/executeCommand.js'
import { executeBrowserCommand } from '../../util/executeBrowserCommand.js'

export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser,
    expectedValue: MaybeOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.MultiRemoteBrowser,
    expectedValue: MaybeArrayOrMultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    expectedValue: MaybeArrayOrMultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'title', verb = 'have', isNot, matcherName = 'toHaveTitle' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { actual, success, subject, expected } = await waitUntil(
        async () => {
            return await executeBrowserCommand({
                browser,
                expectedValue,
                compare: (
                    browser, expectedValue: string | RegExp | AsymmetricMatcher<string> | undefined
                ) => compareTitle(browser, expectedValue, options),
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(subject, expected, actual, { isNot }, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass: success,
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

const compareTitle = async (
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | AsymmetricMatcher<string> | undefined,
    options: ExpectWebdriverIO.StringOptions
): Promise<CompareResult<string>> => {
    const actual = await browser.getTitle()
    return compareTextOrOneOf(actual, expectedValue, options)
}
