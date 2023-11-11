import {
    waitUntil, enhanceError, compareText, executeCommand, wrapExpectedWithArray,
    updateElementsArray
} from '../../utils.js'

async function conditionAttr(el: WebdriverIO.Element, attribute: string) {
    const attr = await el.getAttribute(attribute)
    if (typeof attr !== 'string') {
        return { result: false, value: attr }
    } else {
        return { result: true, value: attr }
    }
}

async function conditionAttrAndValue(el: WebdriverIO.Element, attribute: string, value: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions) {
    const attr = await el.getAttribute(attribute)
    if (typeof attr !== 'string') {
        return { result: false, value: attr }
    }

    return compareText(attr, value, options)
}

export async function toHaveAttributeAndValueFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, attribute: string, value: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'attribute', verb = 'have' } = this

    let el = await received
    let attr
    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, conditionAttrAndValue, options, [attribute, value, options])
        el = result.el
        attr = result.values

        return result.success
    }, isNot, options)

    updateElementsArray(pass, received, el)

    const expected = wrapExpectedWithArray(el, attr, value)
    const message = enhanceError(el, expected, attr, this, verb, expectation, attribute, options)

    return {
        pass,
        message: (): string => message
    }
}

export async function toHaveAttributeFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, attribute: string) {
    const isNot = this.isNot
    const { expectation = 'attribute', verb = 'have' } = this

    let el = await received

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, conditionAttr, {}, [attribute])
        el = result.el

        return result.success
    }, isNot, {})

    updateElementsArray(pass, received, el)

    const message = enhanceError(el, !isNot, pass, this, verb, expectation, attribute, {})

    return {
        pass,
        message: (): string => message
    }
}

export function toHaveAttribute(...args: any): any {
    if(args.length===3 || args.length===4 ) {
        // Name and value is passed in e.g. el.toHaveAttribute('attr', 'value', (opts))
        return toHaveAttributeAndValueFn.call(this, ...args)
    } else {
        // Only name is passed in e.g. el.toHaveAttribute('attr')
        return toHaveAttributeFn.call(this, ...args)
    }
}

export const toHaveAttr = toHaveAttribute
