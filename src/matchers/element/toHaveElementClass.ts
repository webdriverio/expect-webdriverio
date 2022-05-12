import {
    waitUntil, enhanceError, executeCommand, wrapExpectedWithArray, updateElementsArray
} from '../../utils'

async function condition(el: WebdriverIO.Element, attribute: string, value: string | RegExp, options: ExpectWebdriverIO.StringOptions): Promise<any> {
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
        if (! (value instanceof RegExp)) {
            value = value.toLowerCase()
        }
    }

    const classes = attr.split(' ')

    const valueInClasses = classes.some((t) => {
        return value instanceof RegExp ? !!t.match(value) : containing ? t.includes(value) : t === value
    })
    return {
        value: attr,
        result: valueInClasses
    }
}

export function toHaveElementClass(received: WebdriverIO.Element | WebdriverIO.ElementArray, className: string | RegExp, options: ExpectWebdriverIO.StringOptions = {}): any {
    const isNot = this.isNot
    const { expectation = 'class', verb = 'have' } = this

    const attribute = 'class'

    return browser.call(async () => {
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
    })
}
