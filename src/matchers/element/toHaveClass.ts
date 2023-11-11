import { waitUntil, enhanceError, executeCommand, wrapExpectedWithArray, updateElementsArray, compareText } from '../../utils.js'

async function condition(el: WebdriverIO.Element, attribute: string, value: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions) {
    const { ignoreCase = false, trim = false, containing = false } = options

    let attr = await el.getAttribute(attribute)
    if (typeof attr !== 'string') {
        return { result: false }
    }

    if (trim) {
        attr = attr.trim()
    }
    if (ignoreCase) {
        attr = attr.toLowerCase()
        if (typeof value === 'string') {
            value = value.toLowerCase()
        }
    }

    const classes = attr.split(' ')

    const valueInClasses = classes.some((t) => {
        return value instanceof RegExp
            ? !!t.match(value)
            : containing && typeof value === 'string'
                ? t.includes(value)
                : compareText(t, value, options)
    })
    return {
        value: attr,
        result: valueInClasses
    }
}

export function toHaveElementClass(...args: any): any {
    return toHaveClass.call(this || {}, ...args)
}

export async function toHaveClass(received: WebdriverIO.Element | WebdriverIO.ElementArray, className: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'class', verb = 'have' } = this

    const attribute = 'class'

    let el = await received
    let attr

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, options, [attribute, className, options])
        el = result.el
        attr = result.values

        return result.success
    }, isNot, options)

    updateElementsArray(pass, received, el)

    const message = enhanceError(el, wrapExpectedWithArray(el, attr, className), attr, this, verb, expectation, '', options)

    return {
        pass,
        message: () => message
    }
}
