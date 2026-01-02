import { compareText, waitUntilResult } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeArray } from '../../util/multiRemoteUtil.js'
import {  getInstancesWithExpected } from '../../util/multiRemoteUtil.js'
import { formatFailureMessage } from '../../util/formatMessage.js'

type ExpectedValueType = string | RegExp | WdioAsymmetricMatcher<string>

export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browsers: WebdriverIO.MultiRemoteBrowser,
    expectedValues: MaybeArray<ExpectedValueType>,
    options?: ExpectWebdriverIO.StringOptions,
): Promise<ExpectWebdriverIO.AssertionResult>
export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser,
    expectedValue: ExpectedValueType,
    options?: ExpectWebdriverIO.StringOptions,
): Promise<ExpectWebdriverIO.AssertionResult>
export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    expectedValue: MaybeArray<ExpectedValueType>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS,
) {
    const { expectation = 'title', verb = 'have', isNot } = this
    const context = { expectation, verb, isNot, isMultiRemote: browser.isMultiremote }

    await options.beforeAssertion?.({
        matcherName: 'toHaveTitle',
        expectedValue,
        options,
    })

    const browsers = getInstancesWithExpected(browser, expectedValue)

    const conditions = Object.entries(browsers).map(([instance, { browser, expectedValue: expected }]) => async () => {
        const actual = await browser.getTitle()

        const result = compareText(actual, expected as ExpectedValueType, options)
        result.instance = instance
        return result
    })

    const conditionsResults = await waitUntilResult(
        conditions,
        isNot,
        options,
    )

    const message = formatFailureMessage('window', conditionsResults.results, context, '', options)
    const assertionResult: ExpectWebdriverIO.AssertionResult = {
        pass: conditionsResults.pass,
        message: () => message,
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveTitle',
        expectedValue,
        options,
        result: assertionResult,
    })

    return assertionResult
}
