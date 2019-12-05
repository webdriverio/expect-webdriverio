import { waitUntil, enhanceError, compareText, executeCommand, getExpected, updateElementsArray } from '../../utils'

export function toHaveAttribute(received: WebdriverIO.Element | WebdriverIO.ElementArray, attribute: string, value?: string, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'attribute', verb = 'have' } = this

    return browser.call(async () => {
        let el = await received
        let attr
        const pass = await waitUntil(async () => {
            const result = await executeCommand(el, condition, options, [attribute, value, options])
            el = result.el
            attr = result.values

            return result.success
        }, isNot, options)

        updateElementsArray(pass, received, el)

        let message: string
        if (typeof value === 'string') {
            const expected = getExpected(el, attr, value)
            message = enhanceError(el, expected, attr, this, verb, expectation, attribute, options)
        } else {
            message = enhanceError(el, !isNot, pass, this, verb, expectation, attribute, options)
        }

        return {
            pass,
            message: () => message
        }
    })
}

export const toHaveAttr = toHaveAttribute

async function condition(el: WebdriverIO.Element, attribute: string, value: string, options: ExpectWebdriverIO.StringOptions) {
    let attr = await el.getAttribute(attribute)
    if (typeof attr !== 'string') {
        return { result: false, value: attr }
    }

    if (typeof value !== 'string') {
        return { result: true, value: attr }
    }

    return {
        result: compareText(attr, value, options),
        value: attr
    }
}
