import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import { expect } from '../../index.js'

/**
 * @deprecated since v6.0.0, use expect.anything() instead of undefined as expected value, will be removed in v8.0.0
 */
export async function toHaveLocalStorageItem(
    browser: WebdriverIO.Browser,
    key: string,
    expectedValue: undefined,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveLocalStorageItem(
    browser: WebdriverIO.Browser,
    key: string,
    expectedValue?: string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveLocalStorageItem(
    browser: WebdriverIO.Browser,
    key: string,
    expectedValue?: string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.PartialMatcherAnything,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<ExpectWebdriverIO.AssertionResult> {
    const { expectation = 'localStorage item', verb = 'have', isNot, matcherName = 'toHaveLocalStorageItem' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: expectedValue ? [key, expectedValue] : key,
        options,
    })

    const paramsCount = arguments.length
    if (expectedValue === undefined) {
        if (paramsCount > 2) {
            console.warn('[DEPRECATION] Using toHaveLocalStorageItem with undefined is deprecated in favor of expect.anything().')
        }
        expectedValue = expect.anything()
    }

    const { actual, success: pass } = await waitUntil(
        async () => {
            const actual = await browser.execute(
                (storageKey) => {
                    return localStorage.getItem(storageKey)
                }, key)

            // no localStorage item found
            if (actual === null) {
                return { actual, success: false, subject: browser }
            }

            const compareResult = compareText(actual, expectedValue, options)

            return { actual, success: compareResult.success, subject: browser }
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(
        'browser',
        expectedValue !== undefined ? expectedValue : `localStorage item "${key}"`,
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
