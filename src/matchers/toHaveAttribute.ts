import { waitUntil, enhanceError, getSelectors, isNotText } from '../utils'

export function $toHaveAttribute(el: WebdriverIO.Element, attribute: string, value?: string, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot

    const { ignoreCase = false, trim = false, containing = false } = options

    return browser.call(async () => {
        el = await el
        let attr
        const pass = await waitUntil(async () => {
            attr = await el.getAttribute(attribute)
            if (attr === null) {
                return false
            }

            if (typeof value !== 'string') {
                return true
            }

            if (trim) {
                attr = attr.trim()
            }
            if (ignoreCase) {
                attr = attr.toLowerCase()
                value = value.toLowerCase()
            }
            if (containing) {
                return attr.includes(value)
            }
            return attr === value
        }, isNot, options)
        const missing = typeof value === 'string' ? '' : `is ${isNotText(pass, 'is missing', 'exists')}`
        const matching = `"${attr}" ${isNotText(pass, '!')}${containing ? '~' : '='} "${value}"`
        const message = enhanceError(`Element's "${getSelectors(el)}" attribute ${attribute}: ${missing || matching}`, options)

        return {
            pass,
            message: () => message
        }
    })
}

export const $toHaveAttr = $toHaveAttribute
