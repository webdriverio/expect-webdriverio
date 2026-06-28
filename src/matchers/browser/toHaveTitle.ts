import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toHaveTitle(
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | AsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'title', verb = 'have', matcherName = 'toHaveTitle', isNot } = this

    await options.beforeAssertion?.({
        matcherName: matcherName,
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
        options
    )

    const message = enhanceError('window', expectedValue, actual, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: () => message
    }

    await options.afterAssertion?.({
        matcherName: matcherName,
        expectedValue,
        options,
        result
    })

    return result
}
