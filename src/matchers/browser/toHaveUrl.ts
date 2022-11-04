import { waitUntil, enhanceError, compareText } from '../../utils.js'

export async function toHaveUrl(browser: WebdriverIO.Browser, url: string | RegExp, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'url', verb = 'have' } = this

    let actual
    const pass = await waitUntil(async () => {
        actual = await browser.getUrl()

        return compareText(actual, url, options).result
    }, isNot, options)

    const message = enhanceError('window', url, actual, this, verb, expectation, '', options)

    return {
        pass,
        message: (): string => message
    }
}
