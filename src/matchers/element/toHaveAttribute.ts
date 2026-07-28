import type { AssertionResult } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, WdioElementOrArrayMaybePromise, WdioElementsMaybePromise } from '../../types.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareText,
    enhanceError,
    isAsymmetricMatcher,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import { expect as wdioExpect } from '../../index.js'
import { buildWdioAsymmetricMatchers } from '../asymmetrics/wdioAsymmetricMatchers.js'

async function conditionAttributeValueMatchWithExpected(el: WebdriverIO.Element, attribute: string, expectedValue: string | RegExp | AsymmetricMatcher<string> | undefined, options: ExpectWebdriverIO.StringOptions) {
    const attributeValue = await el.getAttribute(attribute)

    if (typeof attributeValue !== 'string' || expectedValue === undefined || expectedValue === null) {
        if (isAsymmetricMatcher(expectedValue)) {
            return { result: expectedValue.asymmetricMatch(attributeValue), value: attributeValue }
        }
        return { result: attributeValue === expectedValue, value: attributeValue }
    }

    return compareText(attributeValue, expectedValue, options)
}

export async function toHaveAttributeAndValue(received: WdioElementOrArrayMaybePromise, attribute: string, expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>, options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS) {
    const { expectation = 'attribute', verb = 'have', isNot } = this

    let el
    let attr
    const pass = await waitUntil(
        async () => {
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, values: string | RegExp | AsymmetricMatcher<string> | undefined) => {
                    return conditionAttributeValueMatchWithExpected(element, attribute, values, options)
                },
                isNot
            })

            el = result.subject
            attr = result.actual

            return result.success
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

/**
 * deprecated since 5.7.1, remove in v6.0.0. Passing explicit `undefined` as a value is deprecated. Omit the third argument entirely or use `toHaveAttribute(el, attribute, options)`.
 */
export async function toHaveAttribute(
    received: WdioElementOrArrayMaybePromise,
    attribute: string,
    value: undefined,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * When called with only the attribute name (and optional configuration options).
 */
export async function toHaveAttribute(
    received: WdioElementOrArrayMaybePromise,
    attribute: string,
): Promise<AssertionResult>

/**
 * Element $() API
 * When called with an expected attribute name and value.
 */
export async function toHaveAttribute(
    received: WdioElementMaybePromise,
    attribute: string,
    value: string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * When called with an expected attribute name and value.
 */
export async function toHaveAttribute(
    received: WdioElementsMaybePromise,
    attribute: string,
    value: MaybeArray<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

export async function toHaveAttribute(
    received: WdioElementOrArrayMaybePromise,
    attribute: string,
    value?: MaybeArray<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const matcherName = 'toHaveAttribute'

    value = buildWdioAsymmetricMatchers(value, options)

    const paramsCount = arguments.length

    if (value === undefined) {
        if (paramsCount > 2) {
            // User have passed an explicit undefined or null value, which is deprecated. We will log a warning to inform the user about this deprecation.
            console.warn('Using undefined or null as value for toHaveAttribute is deprecated and will be removed in v6.0.0. Please omit the third argument entirely or use toHaveAttribute(el, attribute, wdioExpect.anything(), options).')
        }
        value = wdioExpect.anything()
    }

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: [attribute, value],
        options,
    })

    const result = await toHaveAttributeAndValue.call(this, received, attribute, value, options)

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
