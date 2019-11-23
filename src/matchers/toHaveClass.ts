import { waitUntil, enhanceError, getSelectors, isNotText } from '../utils'

export function toHaveClass(el: WebdriverIO.Element, className: string, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot

    let attribute = 'class'
    let value = className
    const { ignoreCase = false, trim = false, containing = false } = options

    return browser.call(async () => {
        el = await el
        let attr
        const pass = await waitUntil(async () => {
            attr = await el.getAttribute(attribute)
            if (attr === null) {
                return false
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

            const classes = attr.split(' ')

            return classes.includes(value)
        }, isNot, options)
        const missing = typeof value === 'string' ? '' : `is ${isNotText(pass, 'is missing', 'exists')}`
        const matching = `"${attr}" ${isNotText(pass, '!')}~ "${value}"`
        const message = enhanceError(`Element's "${getSelectors(el)}" attribute ${attribute}: ${missing || matching}`, options)

        return {
            pass,
            message: () => message
        }
    })
}
