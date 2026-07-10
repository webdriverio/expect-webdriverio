import type { AsyncAssertionResult } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, WdioElementOrArrayMaybePromise } from '../../types.js'
import { defaultMultipleElementsIterationStrategy, executeCommand } from '../../util/executeCommand.js'
import {
    compareText,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import { isStringOptions } from '../../util/commandOptionsUtils.js'

async function conditionAttributeIsPresent(el: WebdriverIO.Element, attribute: string) {
    const attributeValue = await el.getAttribute(attribute)
    if (typeof attributeValue !== 'string') {
        return { result: false, value: attributeValue }
    }
    return { result: true, value: attributeValue }

}

async function conditionAttributeValueMatchWithExpected(el: WebdriverIO.Element, attribute: string, expectedValue: string | RegExp | AsymmetricMatcher<string>, options: ExpectWebdriverIO.StringOptions) {
    const attributeValue = await el.getAttribute(attribute)
    if (typeof attributeValue !== 'string') {
        return { result: false, value: attributeValue }
    }

    return compareText(attributeValue, expectedValue, options)
}

export async function toHaveAttributeAndValue(received: WdioElementOrArrayMaybePromise, attribute: string, expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>>, options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS) {
    const { expectation = 'attribute', verb = 'have', isNot } = this

    let el
    let attr
    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received,
                undefined,
                (elements) => defaultMultipleElementsIterationStrategy(elements, expectedValue, (element, expected) => conditionAttributeValueMatchWithExpected(element, attribute, expected, options))
            )

            el = result.elementOrArray
            attr = result.valueOrArray

            return result
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expected = wrapExpectedWithArray(el, attr, expectedValue)
    const message = enhanceError(el, expected, attr, this, verb, expectation, attribute, options)

    return {
        pass,
        message: (): string => message
    }
}

async function toHaveAttributeFn(received: WdioElementOrArrayMaybePromise, attribute: string, options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS) {
    const { expectation = 'attribute', verb = 'have', isNot } = this

    let el
    let actualAttributeValue

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(
                received,
                undefined,
                (elements) => defaultMultipleElementsIterationStrategy(elements, attribute, (el) => conditionAttributeIsPresent(el, attribute))
            )

            el = result.elementOrArray

            return result
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )
    const expected = 'to have a defined value'
    const actual = `value ${actualAttributeValue}`
    const message = enhanceError(el, expected, actual, this, verb, expectation, attribute, options)

    return {
        pass,
        message: (): string => message
    }
}

/**
 * deprecated since 5.7.1, remove in v6.0.0. Passing explicit `undefined` as a value is deprecated. Omit the third argument entirely or use `toHaveAttribute(el, attribute, options)`.
 */
export async function toHaveAttribute(
    received: WdioElementMaybePromise,
    attribute: string,
    value: undefined,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AsyncAssertionResult>

/**
 * When called with only the attribute name (and optional configuration options).
 */
export async function toHaveAttribute(
    received: WdioElementOrArrayMaybePromise,
    attribute: string,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AsyncAssertionResult>

/**
 * When called with an expected attribute name and value.
 */
export async function toHaveAttribute(
    received: WdioElementOrArrayMaybePromise,
    attribute: string,
    value: string | RegExp | AsymmetricMatcher<string>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AsyncAssertionResult>

export async function toHaveAttribute(
    received: WdioElementOrArrayMaybePromise,
    attribute: string,
    valueOrOptions?: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | ExpectWebdriverIO.StringOptions,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AsyncAssertionResult> {
    const matcherName = 'toHaveAttribute'

    let value: string | RegExp | AsymmetricMatcher<string> | undefined
    if (isStringOptions(valueOrOptions)) {
        options = valueOrOptions
        value = undefined
    } else {
        value = valueOrOptions as string | RegExp | AsymmetricMatcher<string>
    }

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: [attribute, value],
        options,
    })

    const result = value !== undefined
        // Name and value is passed in e.g. el.toHaveAttribute('attr', 'value', (opts))
        ? await toHaveAttributeAndValue.call(this, received, attribute, value, options)
        // Only name is passed in e.g. el.toHaveAttribute('attr')
        : await toHaveAttributeFn.call(this, received, attribute, options)

    await options.afterAssertion?.({
        matcherName,
        expectedValue: [attribute, value],
        options,
        result
    })

    return result
}

/**
 * @deprecated since 5.7.0 Use `toHaveAttribute`
 */
export const toHaveAttr = toHaveAttribute
