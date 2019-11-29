import { waitUntil, enhanceErrorBe } from '../../utils'

export function toBeDisplayedInViewport(el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'displayed in viewport', verb = 'be' } = this

    return browser.call(async () => {
        el = await el
        const pass = await waitUntil(async () => el.isDisplayedInViewport(), isNot, options)
        const message = enhanceErrorBe(el, pass, isNot, verb, expectation, options)

        return {
            pass,
            message: () => message
        }
    })
}

export const toBeVisibleInViewport = toBeDisplayedInViewport
