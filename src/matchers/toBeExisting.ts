import { waitUntil, enhanceError, getSelectors, isNotText } from '../utils'

export function $toExist(el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions = {}) {
    const isNot = this.isNot

    return browser.call(async () => {
        el = await el
        const pass = await waitUntil(async () => el.isExisting(), isNot, options)
        const message = enhanceError(`Element "${getSelectors(el)}" ${isNotText(pass, "doesn't ")}exist.`, options)

        return {
            pass,
            message: () => message
        }
    })
}

export const $toBeExisting = $toExist
export const $toBePresent = $toExist
