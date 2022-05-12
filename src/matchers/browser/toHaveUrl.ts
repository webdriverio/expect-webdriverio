import { waitUntil, enhanceError, compareText } from '../../utils'

export function toHaveUrl(browser: WebdriverIO.Browser, url: string | RegExp, options: ExpectWebdriverIO.StringOptions = {}): any {
    const isNot = this.isNot
    const { expectation = 'url', verb = 'have' } = this

    return browser.call(async () => {
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
    })
}
