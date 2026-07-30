import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toHaveUrl(
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | AsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'url', verb = 'have', isNot, matcherName = 'toHaveUrl' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { success: pass, actual } = await waitUntil(
        async () => {
            const actual = await browser.getUrl()

            const compareResult = compareText(actual, expectedValue, options)

            return { actual, success: compareResult.success, subject: browser }
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError('window', expectedValue, actual, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: () => message
    }

    await options.afterAssertion?.({
        matcherName,
        expectedValue,
        options,
        result
    })

    return result
}
