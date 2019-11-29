import { waitUntil, enhanceError, compareText } from '../../utils'

export function toHaveAttribute(el: WebdriverIO.Element, attribute: string, value?: string, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'attribute', verb = 'have' } = this

    return browser.call(async () => {
        el = await el
        let attr
        const pass = await waitUntil(async () => {
            attr = await el.getAttribute(attribute)
            if (typeof attr !== 'string') {
                return false
            }

            if (typeof value !== 'string') {
                return true
            }

            return compareText(attr, value, options)
        }, isNot, options)

        const message = typeof value === 'string' ?
            enhanceError(el, value, attr || '', isNot, verb, expectation, attribute, options) :
            enhanceError(el, !isNot, pass, isNot, verb, expectation, attribute, options)

        return {
            pass,
            message: () => message
        }
    })
}

export const toHaveAttr = toHaveAttribute
