import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import {
    compareText,
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
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

export async function toHaveAttributeAndValue(received: WdioElementMaybePromise, attribute: string, value: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS) {
    const isNot = this.isNot
    const { expectation = 'attribute', verb = 'have' } = this

    let el = await received
    let attr
    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, conditionAttrAndValue, options, [attribute, value, options])
        el = result.el as WebdriverIO.Element
        attr = result.values

        return result.success
    }, isNot, options)

    const expected = wrapExpectedWithArray(el, attr, value)
    const message = enhanceError(el, expected, attr, this, verb, expectation, attribute, options)

    return {
        pass,
        message: (): string => message
    } as ExpectWebdriverIO.AssertionResult
}

async function toHaveAttributeFn(received: WdioElementMaybePromise, attribute: string) {
    const isNot = this.isNot
    const { expectation = 'attribute', verb = 'have' } = this

    let el = await received

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, conditionAttr, {}, [attribute])
        el = result.el as WebdriverIO.Element

        return result.success
    }, isNot, {})

    const message = enhanceError(el, !isNot, pass, this, verb, expectation, attribute, {})

    return {
        pass,
        message: (): string => message
    }
}

export async function toHaveAttribute(
    received: WdioElementMaybePromise,
    attribute: string,
    value?: string | RegExp | ExpectWebdriverIO.PartialMatcher,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    await options.beforeAssertion?.({
        matcherName: 'toHaveAttribute',
        expectedValue: [attribute, value],
        options,
    })

    const result = typeof value !== 'undefined'
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

export const toHaveAttr = toHaveAttribute
