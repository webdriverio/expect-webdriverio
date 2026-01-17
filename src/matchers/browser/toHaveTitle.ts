import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toHaveTitle(
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | WdioAsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'title', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveTitle',
        expectedValue,
        options,
    })

    let actual
    const pass = await waitUntil(async () => {
        actual = await browser.getTitle()

        return compareText(actual, expectedValue, options).result
    }, options)

    const message = enhanceError('window', expectedValue, actual, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: () => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveTitle',
        expectedValue,
        options,
        result
    })

    return result
}
