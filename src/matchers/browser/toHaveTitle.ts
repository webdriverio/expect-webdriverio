import { waitUntil, enhanceError, compareText, compareTextWithArray } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toHaveTitle(
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | WdioAsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'title', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveTitle',
        expectedValue,
        options,
    })

    let actual
    const pass = await waitUntil(async () => {
        const result = await browser.getTitle()
        actual = result

        if (Array.isArray(result)) {
            const results = result.map((item) => {
                return Array.isArray(expectedValue)
                    ? compareTextWithArray(item, expectedValue, options).result
                    : compareText(item, expectedValue, options).result
            })

            return results.every((res) => res)
        }

        return compareText(result, expectedValue, options).result
    }, isNot, options)

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
