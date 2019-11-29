import { waitUntil, enhanceError, compareText } from '../../utils'

export function toHaveProperty(el: WebdriverIO.Element, property: string, value?: any, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'property', verb = 'have' } = this

    const { asString = false } = options

    return browser.call(async () => {
        el = await el
        let prop
        const pass = await waitUntil(async () => {
            prop = await el.getProperty(property)
            if (prop === null || prop === undefined) {
                return false
            }

            if (value === null) {
                return true
            }

            if (typeof value !== 'string' || (typeof prop !== 'string' && !asString)) {
                return prop === value
            }

            return compareText(prop.toString(), value, options)
        }, isNot, options)

        const message = typeof value !== 'undefined' ?
            enhanceError(el, value, prop || '', isNot, verb, expectation, property, options) :
            enhanceError(el, !isNot, pass, isNot, verb, expectation, property, options)

        return {
            pass,
            message: () => message
        }
    })
}
