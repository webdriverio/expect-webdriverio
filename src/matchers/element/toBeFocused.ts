import { waitUntil, enhanceErrorBe } from '../../utils'

export function toBeFocused(el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'focused', verb = 'be' } = this

    return browser.call(async () => {
        el = await el
        const pass = await waitUntil(async () => el.isFocused(), isNot, options)
        const message = enhanceErrorBe(el, pass, isNot, verb, expectation, options)

        return {
            pass,
            message: () => message
        }
    })
}
