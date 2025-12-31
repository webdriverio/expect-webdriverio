import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeArray } from '../../util/multiRemoteUtil.js'
import {  getInstancesWithExpected } from '../../util/multiRemoteUtil.js'
import type { BrowserCompareResult } from '../../util/formatMessage.js'
import { enhanceMultiRemoteError } from '../../util/formatMessage.js'

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

    console.log('toHaveTitle', { expectedValue, isNot, options })

    await options.beforeAssertion?.({
        matcherName: 'toHaveTitle',
        expectedValue,
        options,
    })

    let actual: string | string[] = ''

    const browsers = getInstancesWithExpected(browser, expectedValue)

    const results: Record<string, BrowserCompareResult> = {}
    const conditions = Object.entries(browsers).map(([instance, { browser, expectedValue: expected }]) => async () => {
        actual = await browser.getTitle()

        const result = compareText(actual, expected as ExpectedValueType, options)
        results[instance] = { instance, result }
        return result.result
    })

    const pass = await waitUntil(
        conditions,
        isNot,
        options,
    )

    const message = browser.isMultiremote
        ? enhanceMultiRemoteError('window', Object.values(results), { expectation, verb, isNot }, '', options)
        : enhanceError('window', expectedValue, actual, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: () => message,
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveTitle',
        expectedValue,
        options,
        result,
    })

    return result
}
