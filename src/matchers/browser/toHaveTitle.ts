import { waitUntil, enhanceError, compareText } from '../../utils'

export function toHaveTitle(browser: WebdriverIO.BrowserObject, title: string, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'title', verb = 'have' } = this

    return browser.call(async () => {
        let actual
        const pass = await waitUntil(async () => {
            actual = await browser.getUrl()

            return compareText(actual, title, options)
        }, isNot, options)

        const message = enhanceError('title', title, actual, isNot, verb, expectation, '', options)

        return {
            pass,
            message: () => message
        }
    })
}
