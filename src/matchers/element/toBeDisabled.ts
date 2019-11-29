import { waitUntil, enhanceErrorBe } from '../../utils'

export function toBeDisabled(el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'disabled', verb = 'be' } = this

    return browser.call(async () => {
        el = await el
        const pass = await waitUntil(async () => !await el.isEnabled(), isNot, options)
        const message = enhanceErrorBe(el, pass, isNot, verb, expectation, options)

        return {
            pass,
            message: () => message
        }
    })
}
