import { waitUntil, enhanceErrorBe } from '../../utils'

export function toBeSelected(el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'selected', verb = 'be' } = this

    return browser.call(async () => {
        el = await el
        const pass = await waitUntil(async () => el.isSelected(), isNot, options)
        const message = enhanceErrorBe(el, pass, isNot, verb, expectation, options)

        return {
            pass,
            message: () => message
        }
    })
}
export function toBeChecked (el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions) {
    this.expectation = 'checked'
    return toBeSelected(el, options)
}
