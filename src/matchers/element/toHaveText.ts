import { waitUntil, enhanceError, compareText } from '../../utils'

export function toHaveText(el: WebdriverIO.Element, text: string, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'text', verb = 'have' } = this

    return browser.call(async () => {
        el = await el
        let actualText
        const pass = await waitUntil(async () => {
            actualText = await el.getText()

            return compareText(actualText, text, options)
        }, isNot, options)

        const message = enhanceError(el, text, actualText, isNot, verb, expectation, '', options)

        return {
            pass,
            message: () => message
        }
    })
}
