import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type {  StrategyResult } from '../../util/executeCommand.js'
import { executeBrowserCommand } from '../../util/executeBrowserCommand.js'
import { isMultiRemoteValuesMatcher } from '../asymmetrics/multiRemoteValuesMatcher.js'

export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | AsymmetricMatcher<string>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.MultiRemoteBrowser,
    expectedValue: MaybeArrayOrMultiRemoteValues<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    expectedValue: MaybeArrayOrMultiRemoteValues<string | RegExp | AsymmetricMatcher<string>>,
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
                    multiRemoteBrowser, expectedValue: ArrayOrMultiRemoteValues<string | RegExp | AsymmetricMatcher<string>> | undefined
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
): Promise<StrategyResult<string>> => {
    const actual = await browser.getTitle()
    const result = compareText(actual, expectedValue, options)
    return { actual: result.actual, success: result.success, subject: browser }
}

const compareMultiRemoteTitles = async (
    browser: WebdriverIO.MultiRemoteBrowser,
    expectedValue: ArrayOrMultiRemoteValues<string | RegExp | AsymmetricMatcher<string>> | undefined,
    options: ExpectWebdriverIO.StringOptions
) => {
    const actual = await browser.getTitle()

    if (isMultiRemoteValuesMatcher(expectedValue)) {
        expectedValue.setOptions(options)

        const multiRemoteActualValues = expectedValue.buildActual(actual)
        const isMatch = expectedValue.asymmetricMatch(multiRemoteActualValues)
        // TODO need to account for .not
        return { actual: multiRemoteActualValues, success: isMatch, subject: browser }
    } else if (!Array.isArray(expectedValue)) {
        return { actual, success: false, subject: browser }
    }
    const results = actual.map((title, index) => compareText(title, expectedValue[index], options))

    // TODO need to account for .not
    return { actual: results.map(r => r.actual), success: results.every(r => r.success), subject: browser }
}
