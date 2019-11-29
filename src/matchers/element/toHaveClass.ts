import { waitUntil, enhanceError } from '../../utils'

export function toHaveClass(el: WebdriverIO.Element, className: string, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'class', verb = 'have' } = this

    let attribute = 'class'
    let value = className
    const { ignoreCase = false, trim = false, containing = false } = options

    return browser.call(async () => {
        el = await el
        let attr
        const pass = await waitUntil(async () => {
            attr = await el.getAttribute(attribute)
            if (typeof attr !== 'string') {
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

        const message = enhanceError(el, value, attr || '', isNot, verb, expectation, '', options)

        return {
            pass,
            message: () => message
        }
    })
}
