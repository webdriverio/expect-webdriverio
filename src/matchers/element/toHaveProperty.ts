import { waitUntil, enhanceError, compareText, executeCommand, getExpected, updateElementsArray } from '../../utils'

export function toHaveProperty(received: WebdriverIO.Element | WebdriverIO.ElementArray, property: string, value?: any, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'property', verb = 'have' } = this

    return browser.call(async () => {
        let el = await received
        let prop: any
        const pass = await waitUntil(async () => {
            const result = await executeCommand(el, condition, options, [property, value])
            el = result.el
            prop = result.values

            return result.success
        }, isNot, options)

        updateElementsArray(pass, received, el)

        let message: string
        if (value === undefined) {
            message = enhanceError(el, !isNot, pass, this, verb, expectation, property, options)
        } else {
            const expected = getExpected(el, prop, value)
            message = enhanceError(el, expected, prop, this, verb, expectation, property, options)
        }

        return {
            pass,
            message: () => message
        }
    })
}

async function condition(el: WebdriverIO.Element, property: string, value?: any, options: ExpectWebdriverIO.StringOptions = {}) {
    const { asString = false } = options

    let prop = await el.getProperty(property)
    if (prop === null || prop === undefined) {
        return { result: false, value: prop }
    }

    if (value === null) {
        return { result: true, value: prop }
    }

    if (typeof value !== 'string' || (typeof prop !== 'string' && !asString)) {
        return { result: prop === value, value: prop }
    }

    prop = prop.toString()

    return {
        result: compareText(prop, value, options),
        value: prop
    }
}
