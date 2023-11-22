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

export async function toHaveAttributeAndValue(received: WebdriverIO.Element | WebdriverIO.ElementArray, attribute: string, value: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions = {}) {
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
    } as ExpectWebdriverIO.AssertionResult
}

async function toHaveAttributeFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, attribute: string) {
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

export async function toHaveAttribute(
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    attribute: string,
    value: string | RegExp | ExpectWebdriverIO.PartialMatcher,
    options: ExpectWebdriverIO.StringOptions = {}
) {
    await options.beforeAssertion?.({
        matcherName: 'toHaveAttribute',
        expectedValue: [attribute, value],
        options,
    })

    const args = [received, attribute, value, options].filter(Boolean)
    const result = args.length === 3 || args.length === 4
        // Name and value is passed in e.g. el.toHaveAttribute('attr', 'value', (opts))
        ? await toHaveAttributeAndValue.call(this, received, attribute, value, options)
        // Only name is passed in e.g. el.toHaveAttribute('attr')
        : await toHaveAttributeFn.call(this, received, attribute)

    await options.afterAssertion?.({
        matcherName: 'toHaveAttribute',
        expectedValue: [attribute, value],
        options,
        result
    })

    return result
}

export function toHaveAttributeContaining(el: WebdriverIO.Element, attribute: string, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttributeAndValue.call(this, el, attribute, value, {
        ...options,
        containing: true
    })
}

export const toHaveAttrContaining = toHaveAttributeContaining
export const toHaveAttr = toHaveAttribute
