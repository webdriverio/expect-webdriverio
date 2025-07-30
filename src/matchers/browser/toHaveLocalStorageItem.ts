import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toHaveLocalStorageItem(
    browser: WebdriverIO.Browser,
    key: string,
    expectedValue?: string | RegExp | ExpectWebdriverIO.PartialMatcher,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'localStorage item', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveLocalStorageItem',
        expectedValue: expectedValue ? [key, expectedValue] : key,
        options,
    })
    let actual
    const pass = await waitUntil(async () => {
        actual = await browser.execute((storageKey) => {
            return localStorage.getItem(storageKey)
        }, key)
        // if no expected value is provided, we just check if the item exists
        if (expectedValue === undefined) {
            return actual !== null
        }
        // no localStorage item found
        if (actual === null) {
            return false
        }
        return compareText(actual, expectedValue, options).result
    }, isNot, options)
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
        matcherName: 'toHaveLocalStorageItem',
        expectedValue: expectedValue ? [key, expectedValue] : key,
        options,
        result
    })
    return result
}