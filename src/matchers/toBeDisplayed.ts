import { waitUntil, enhanceError, getSelectors, isNotText } from '../utils'

export function $toBeDisplayed(el: WebdriverIO.Element, options = {}) {
    const isNot = this.isNot

    return browser.call(async () => {
        el = await el
        const pass = await waitUntil(async () => el.isDisplayed(), isNot, options)
        const message = enhanceError(`Element "${getSelectors(el)}" is ${isNotText(pass, 'not')}displayed.`, options)

        return {
            pass,
            message: () => message
        }
    })
}
