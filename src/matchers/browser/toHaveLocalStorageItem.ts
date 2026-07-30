import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toHaveLocalStorageItem(
    browser: WebdriverIO.Browser,
    key: string,
    expectedValue?: string | RegExp | AsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'localStorage item', verb = 'have', isNot, matcherName = 'toHaveLocalStorageItem' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: expectedValue ? [key, expectedValue] : key,
        options,
    })
    const { actual, success: pass } = await waitUntil(
        async () => {
            const actual = await browser.execute(
                (storageKey) => {
                    return localStorage.getItem(storageKey)
                }, key)
            // if no expected value is provided, we just check if the item exists
            if (expectedValue === undefined) {
                return { actual, success: actual !== null, subject: browser }
            }
            // no localStorage item found
            if (actual === null) {
                return { actual, success: false, subject: browser }
            }

            const compareResult = compareText(actual, expectedValue, options)

            return { actual, success: compareResult.result, subject: browser }
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
