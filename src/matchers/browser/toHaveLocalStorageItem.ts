import { waitUntil, enhanceError, compareTextOrOneOf } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import { expect } from 'expect'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeBrowserCommand } from '../../util/executeBrowserCommand.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import type { WdioMatcherContext } from '../../types.js'
import { withStringOptions } from '../../util/expectedWithStringOptions.js'
import type { AssertionResult, StringOptions } from '../../publicTypes/options.js'

/**
 * Browser or Multi-Remote Browser: only check that the item exists
 */
export async function toHaveLocalStorageItem(
    browser: WebdriverIO.Browser | WebdriverIO.BrowsingContext | WebdriverIO.MultiRemoteBrowser,
    key: string,
): Promise<AssertionResult>

/**
 * Browser
 */
export async function toHaveLocalStorageItem(
    browser: WebdriverIO.Browser | WebdriverIO.BrowsingContext,
    key: string,
    expectedValue: string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything,
    options?: StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Browser
 */
export async function toHaveLocalStorageItem(
    browser: WebdriverIO.MultiRemoteBrowser,
    key: string,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything>,
    options?: StringOptions
): Promise<AssertionResult>

export async function toHaveLocalStorageItem(
    this: WdioMatcherContext,
    browser: WebdriverIO.Browser | WebdriverIO.BrowsingContext | WebdriverIO.MultiRemoteBrowser,
    key: string,
    expectedValue?: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything>,
    options: StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { expectation = 'localStorage item', verb = 'have', isNot, matcherName = 'toHaveLocalStorageItem' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: expectedValue ? [key, expectedValue] : key,
        options,
    })

    const expected = expectedValue ?? expect.anything()

    // Apply the string options to `expect.oneOf()`, also when nested in per-instance values
    const expectedWithOptions = buildWdioAsymmetricMatchersWithOptions(expected, options)

    const { actual, success: pass, subject, expected: expectedValues, verdict, compared } = await waitUntil(
        async () => {
            return await executeBrowserCommand({
                browser,
                isNot,
                expectedValue: expectedWithOptions,
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
        withStringOptions(expectedValues, verdict, options, actual),
        actual,
        { ...this, stringOptions: options, compared },
        verb,
        expectation,
        key,
        options
    )
    const result: AssertionResult = {
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
    browser: WebdriverIO.Browser | WebdriverIO.BrowsingContext,
    key: string,
    expected: string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything | undefined,
    options: StringOptions
): Promise<CompareResult<string | null>> => {
    const actual = await browser.execute(
        (storageKey) => {
            return localStorage.getItem(storageKey)
        }, key)

    // no localStorage item found
    if (actual === null) {
        return { actual, success: false }
    }

    return compareTextOrOneOf(actual, expected, options)
}
