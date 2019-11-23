import { waitUntil, enhanceError, getSelectors, isNotText } from '../utils'

export function toHaveText(el: WebdriverIO.Element, text: string, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot

    const { ignoreCase = false, trim = false, containing = false } = options

    return browser.call(async () => {
        el = await el
        let actualText
        const pass = await waitUntil(async () => {
            actualText = await el.getText()
            if (typeof actualText !== 'string') {
                return false
            }

            if (trim) {
                actualText = actualText.trim()
            }
            if (ignoreCase) {
                actualText = actualText.toLowerCase()
                text = text.toLowerCase()
            }
            if (containing) {
                return actualText.includes(text)
            }
            return actualText === text
        }, isNot, options)

        const matching = `"${actualText}" ${isNotText(pass, '!')}${containing ? '~' : '='} "${text}"`
        const message = enhanceError(`Element's "${getSelectors(el)}" text: ${matching}`, options)

        return {
            pass,
            message: () => message
        }
    })
}
