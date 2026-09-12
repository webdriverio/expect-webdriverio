import { waitUntil, enhanceError, compareTextOrOneOf } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import { expect } from '../../index.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeBrowserCommand } from '../../util/executeBrowserCommand.js'

/**
 * @deprecated since v6.0.0, use expect.anything() instead of undefined as expected value, will be removed in v8.0.0
 */
export async function toHaveLocalStorageItem(
    browser: WebdriverIO.Browser,
    key: string,
    expectedValue: undefined,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Browser
 */
export async function toHaveLocalStorageItem(
    browser: WebdriverIO.Browser,
    key: string,
    expectedValue?: string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Multi-Remote Browser
 */
export async function toHaveLocalStorageItem(
    browser: WebdriverIO.MultiRemoteBrowser,
    key: string,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveLocalStorageItem(
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    key: string,
    expectedValue?: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<ExpectWebdriverIO.AssertionResult> {
    const { expectation = 'localStorage item', verb = 'have', isNot, matcherName = 'toHaveLocalStorageItem' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: expectedValue ? [key, expectedValue] : key,
        options,
    })

    const paramsCount = arguments.length
    let expected: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything>
    if (expectedValue === undefined) {
        if (paramsCount > 2) {
            console.warn('[DEPRECATION] Using toHaveLocalStorageItem with undefined is deprecated in favor of expect.anything().')
        }
        expected = expect.anything()
    } else {
        expected = expectedValue
    }

    const { actual, success: pass, subject, expected: expectedValues } = await waitUntil(
        async () => {
            return await executeBrowserCommand({
                browser,
                expectedValue: expected,
                compare: (
                    browser, expectedValue: string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything | undefined
                ) => compareStorageItem(browser, key, expectedValue, options),
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(
        subject,
        expectedValues,
        actual,
        this,
        verb,
        expectation,
        key,
        options
    )
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: () => message
    }
    await options.afterAssertion?.({
        matcherName,
        expectedValue: expectedValue ? [key, expectedValue] : key,
        options,
        result
    })
    return result
}

const compareStorageItem = async (
    browser: WebdriverIO.Browser,
    key: string,
    expected: string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything | undefined,
    options: ExpectWebdriverIO.StringOptions
): Promise<CompareResult<string | null>> => {
    const actual = await browser.execute(
        (storageKey) => {
            return localStorage.getItem(storageKey)
        }, key)

    // no localStorage item found
    if (actual === null) {
        return { actual, success: false }
    }

    const compareResult = compareTextOrOneOf(actual, expected, options)

    return { actual, success: compareResult.success }
}
