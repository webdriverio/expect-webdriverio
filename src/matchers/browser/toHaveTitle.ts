import { waitUntil, enhanceError, compareText } from '../../utils.js'

export async function toHaveTitle(browser: WebdriverIO.Browser, title: string | RegExp, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'title', verb = 'have' } = this

    let actual
    const pass = await waitUntil(async () => {
        actual = await browser.getTitle()

        return compareText(actual, title, options).result
    }, isNot, options)

    const message = enhanceError('window', title, actual, this, verb, expectation, '', options)

    return {
        pass,
        message: () => message
    }
}
