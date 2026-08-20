import { waitUntil, enhanceError, isAsymmetricMatcher, compareTextOrOneOf } from '../../utils.js'
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
                ) => compareBrowserTitle(browser, expectedValue, options),
                multiRemoteCompare: (
                    multiRemoteBrowser, expectedValue: Array<string | RegExp | AsymmetricMatcher<string>> | undefined
                ) => compareMultiRemoteTitles(multiRemoteBrowser, expectedValue, options)
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

const compareBrowserTitle = async (
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | AsymmetricMatcher<string> | undefined,
    options: ExpectWebdriverIO.StringOptions
): Promise<CompareResult<string>> => {
    const actual = await browser.getTitle()
    return compareTextOrOneOf(actual, expectedValue, options)
}

const compareMultiRemoteTitles = async (
    browser: WebdriverIO.MultiRemoteBrowser,
    expectedValue: Array<string | RegExp | AsymmetricMatcher<string>> | undefined,
    options: ExpectWebdriverIO.StringOptions
) => {
    const actual = await browser.getTitle()
    if (isAsymmetricMatcher(expectedValue)) {
        return { actual, success: expectedValue.asymmetricMatch(actual) }
    } else if (!Array.isArray(expectedValue)) {
        return { actual, success: false }
    }

    const results = actual.map((title, index) => compareTextOrOneOf(title, expectedValue[index], options))
    // TODO move this into executeBrowserCommand to avoid having to do this here
    return { actual, success: results.every(result => result.success) }
}
