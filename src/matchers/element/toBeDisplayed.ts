import { waitUntil, enhanceErrorBe } from '../../utils'

export function toBeDisplayed(el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'displayed', verb = 'be' } = this

    return browser.call(async () => {
        el = await el
        const pass = await waitUntil(async () => el.isDisplayed(), isNot, options)
        const message = enhanceErrorBe(el, pass, isNot, verb, expectation, options)

        return {
            pass,
            message: () => message
        }
    })
}

export function toBeVisible (el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions) {
    this.expectation = 'visible'
    return toBeDisplayed(el, options)
}
