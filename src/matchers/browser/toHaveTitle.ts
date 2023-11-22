import { waitUntil, enhanceError, compareText } from '../../utils.js'

export async function toHaveTitle(browser: WebdriverIO.Browser, expectedValue: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
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

/**
 * @deprecated
 */
export function toHaveTitleContaining(browser: WebdriverIO.Browser, title: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveTitle.call(this, browser, title, {
        ...options,
        containing: true
    })
}
