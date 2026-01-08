import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'
import { defaultMultipleElementsIterationStrategy, executeCommand } from '../../util/executeCommand.js'
import {
    compareText,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function conditionAttributeIsPresent(el: WebdriverIO.Element, attribute: string) {
    const attributeValue = await el.getAttribute(attribute)
    if (typeof attributeValue !== 'string') {
        return { result: false, value: attributeValue }
    }
    return { result: true, value: attributeValue }

}

async function conditionAttributeValueMatchWithExpected(el: WebdriverIO.Element, attribute: string, expectedValue: string | RegExp | WdioAsymmetricMatcher<string>, options: ExpectWebdriverIO.StringOptions) {
    const attributeValue = await el.getAttribute(attribute)
    if (typeof attributeValue !== 'string') {
        return { result: false, value: attributeValue }
    }

    return compareText(attributeValue, expectedValue, options)
}

export async function toHaveAttributeAndValue(received: WdioElementOrArrayMaybePromise, attribute: string, expectedValue: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>, options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS) {
    const isNot = this.isNot
    const { expectation = 'attribute', verb = 'have' } = this

    let el
    let attr
    const pass = await waitUntil(async () => {
        const result = await executeCommand(received,
            undefined,
            (elements) => defaultMultipleElementsIterationStrategy(elements, expectedValue, (element, expected) => conditionAttributeValueMatchWithExpected(element, attribute, expected, options))
        )

        el = result.elementOrArray
        attr = result.valueOrArray

        return result
    }, isNot,  { wait: options.wait, interval: options.interval })

    const expected = wrapExpectedWithArray(el, attr, expectedValue)
    const message = enhanceError(el, expected, attr, this, verb, expectation, attribute, options)

    return {
        pass,
        message: (): string => message
    } as ExpectWebdriverIO.AssertionResult
}

async function toHaveAttributeFn(received: WdioElementOrArrayMaybePromise, attribute: string, options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS) {
    const isNot = this.isNot
    const { expectation = 'attribute', verb = 'have' } = this

    let el

    const pass = await waitUntil(async () => {
        const result = await executeCommand(
            received,
            undefined,
            (elements) => defaultMultipleElementsIterationStrategy(elements, attribute, (el) => conditionAttributeIsPresent(el, attribute))
        )

        el = result.elementOrArray

        return result
    }, isNot, {
        wait: options.wait,
        interval: options.interval,
    })

    const message = enhanceError(el, !isNot, pass, this, verb, expectation, attribute, options)

    return {
        pass,
        message: (): string => message
    }
}

// TODO: one day it would be better to have overload signature one with value and ExpectWebdriverIO.StringOptions, the other with no value and commnad options
export async function toHaveAttribute(
    received: WdioElementOrArrayMaybePromise,
    attribute: string,
    value?: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    await options.beforeAssertion?.({
        matcherName: 'toHaveAttribute',
        expectedValue: [attribute, value],
        options,
    })

    const result = value !== undefined
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
