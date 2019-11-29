import { waitUntil, enhanceErrorBe } from '../../utils'

export function toExist(el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'exist', verb = '' } = this

    return browser.call(async () => {
        el = await el
        const pass = await waitUntil(async () => el.isExisting(), isNot, options)
        const message = enhanceErrorBe(el, pass, isNot, verb, expectation, options)

        return {
            pass,
            message: () => message
        }
    })
}

export const toBeExisting = toExist
export const toBePresent = toExist
