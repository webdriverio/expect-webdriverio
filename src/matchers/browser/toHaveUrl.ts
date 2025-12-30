import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toHaveUrl(
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | WdioAsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'url', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveUrl',
        expectedValue,
        options,
    })

    let actual
    const pass = await waitUntil(async () => {
        actual = await browser.getUrl()

        return compareText(actual, expectedValue, options).result
    }, options)

    const message = enhanceError('window', expectedValue, actual, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: () => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveUrl',
        expectedValue,
        options,
        result
    })

    return result
}
