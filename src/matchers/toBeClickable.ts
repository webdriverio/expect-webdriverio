import { waitUntil, enhanceError, getSelectors, isNotText } from '../utils'

export function toBeClickable(el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions = {}) {
    const isNot = this.isNot

    return browser.call(async () => {
        el = await el
        const pass = await waitUntil(async () => el.isClickable(), isNot, options)
        const message = enhanceError(`Element "${getSelectors(el)}" is ${isNotText(pass, 'not ')}clickable.`, options)

        return {
            pass,
            message: () => message
        }
    })
}
