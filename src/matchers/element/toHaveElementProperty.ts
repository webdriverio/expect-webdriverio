import {
    waitUntil,
    enhanceError,
    compareText,
    executeCommand,
    wrapExpectedWithArray,
    updateElementsArray,
} from '../../utils'

async function condition(
    el: WebdriverIO.Element,
    property: string,
    value?: any,
    options: ExpectWebdriverIO.StringOptions = {}
): Promise<any> {
    const { asString = false } = options

    let prop = await el.getProperty(property)
    if (prop === null || prop === undefined) {
        return { result: false, value: prop }
    }

    if (value === null) {
        return { result: true, value: prop }
    }

    if (!(value instanceof RegExp) && (typeof value !== 'string' || (typeof prop !== 'string' && !asString))) {
        return { result: prop === value, value: prop }
    }

    prop = prop.toString()

    return compareText(prop, value, options)
}

export function toHaveElementProperty(
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    property: string,
    value?: string | RegExp,
    options: ExpectWebdriverIO.StringOptions = {}
): any {
    const isNot = this.isNot
    const { expectation = 'property', verb = 'have' } = this

    return browser.call(async () => {
        let el = await received
        let prop: any
        const pass = await waitUntil(
            async () => {
                const result = await executeCommand.call(this, el, condition, options, [property, value])
                el = result.el
                prop = result.values

                return result.success
            },
            isNot,
            options
        )

        updateElementsArray(pass, received, el)

        let message: string
        if (value === undefined) {
            message = enhanceError(el, !isNot, pass, this, verb, expectation, property, options)
        } else {
            const expected = wrapExpectedWithArray(el, prop, value)
            message = enhanceError(el, expected, prop, this, verb, expectation, property, options)
        }

        return {
            pass,
            message: (): string => message,
        }
    })
}
