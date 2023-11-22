import { waitUntil, enhanceError, compareText } from '../../utils.js'

export async function toHaveUrl(browser: WebdriverIO.Browser, expectedValue: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
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
    }, isNot, options)

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

/**
 * @deprecated
 */
export function toHaveUrlContaining(browser: WebdriverIO.Browser, url: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveUrl.call(this, browser, url, {
        ...options,
        containing: true
    })
}
