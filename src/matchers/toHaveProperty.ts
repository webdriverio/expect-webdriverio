import { waitUntil, enhanceError, getSelectors, isNotText } from '../utils'

export function toHaveProperty(el: WebdriverIO.Element, property: string, value?: any, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot

    const { ignoreCase = false, trim = false, containing = false, asString = false } = options

    return browser.call(async () => {
        el = await el
        let prop
        const pass = await waitUntil(async () => {
            prop = await el.getProperty(property)
            if (prop === null) {
                return false
            }

            if (value === null) {
                return true
            }

            if (typeof value !== 'string' || (typeof prop !== 'string' && !asString)) {
                return prop === value
            }

            prop = prop.toString()

            if (trim) {
                prop = prop.trim()
            }
            if (ignoreCase) {
                prop = prop.toLowerCase()
                value = value.toLowerCase()
            }
            if (containing) {
                return prop.includes(value)
            }
            return prop === value
        }, isNot, options)
        const missing = typeof value !== 'undefined' ? '' : `${isNotText(pass, 'is missing', 'exists')}`
        const matching = `"${prop}" ${isNotText(pass, '!')}${containing ? '~' : '='} "${value}"`
        const message = enhanceError(`Element's "${getSelectors(el)}" property ${property}: ${missing || matching}`, options)

        return {
            pass,
            message: () => message
        }
    })
}
