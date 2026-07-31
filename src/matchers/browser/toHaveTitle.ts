import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toHaveTitle(
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | AsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'title', verb = 'have', isNot, matcherName = 'toHaveTitle' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { actual, success } = await waitUntil(
        async () => {
            const actual = await browser.getTitle()

            const compareResult = compareText(actual, expectedValue, options)

            return { actual, success: compareResult.success, subject: browser }
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError('window', expectedValue, actual, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass: success,
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
