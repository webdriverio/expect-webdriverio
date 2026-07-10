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

    let actual
    const pass = await waitUntil(
        async () => {
            actual = await browser.getTitle()

            return compareText(actual, expectedValue, options).result
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
