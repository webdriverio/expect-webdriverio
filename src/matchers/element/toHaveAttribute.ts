import type { AssertionResult } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromise, WdioElementsMaybePromise } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareText,
    enhanceError,
    isAsymmetricMatcher,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import { expect as wdioExpect } from '../../index.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import { OneOfMatcher } from '../asymmetrics/oneOf.js'

async function conditionAttributeValueMatchWithExpected(el: WebdriverIO.Element, attribute: string, expectedValue: MaybeOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined, options: ExpectWebdriverIO.StringOptions): Promise<CompareResult<string | null>> {
    const attributeValue = await el.getAttribute(attribute)

    if (typeof attributeValue !== 'string' || expectedValue === undefined || expectedValue === null) {
        if (isAsymmetricMatcher(expectedValue)) {
            return { success: expectedValue.asymmetricMatch(attributeValue), actual: attributeValue }
        }
        return { success: attributeValue === expectedValue, actual: attributeValue }
    } else if ( expectedValue instanceof OneOfMatcher) {
        return { success: expectedValue.asymmetricMatch(attributeValue), actual: attributeValue }
    }

    // TODO fix OneOfMatcher typing to not require casting here!
    return compareText(attributeValue, expectedValue as string | RegExp | AsymmetricMatcher<string> | undefined, options)
}

export async function toHaveAttributeAndValue(received: MaybeSomeWdioElementOrArrayMaybePromise, attribute: string, expectedValue: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>, options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS) {
    const { expectation = 'attribute', verb = 'have', isNot } = this

    expectedValue = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const { success: pass, actual: attr, subject: el, context: { isSome } = {} } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, values: string | RegExp | AsymmetricMatcher<string> | undefined) => {
                    return conditionAttributeValueMatchWithExpected(element, attribute, values, options)
                },
                context: { isNot, iteration },
                strategy: 'NewStrictMultipleElements',
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expected = wrapExpectedWithArray(el, attr, expectedValue)
    const message = enhanceError(el, expected, attr, { isNot, isSome }, verb, expectation, attribute, options)

    return {
        pass,
        message: (): string => message
    }
}

/**
 * @deprecated since v6.0.0, remove in v8.0.0. Passing explicit `undefined` as a value is deprecated. Omit the third argument entirely or use `toHaveAttribute(el, attribute, options)`.
 */
export async function toHaveAttribute(
    received: MaybeSomeWdioElementOrArrayMaybePromise,
    attribute: string,
    value: undefined,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * When called with only the attribute name (and optional configuration options).
 */
export async function toHaveAttribute(
    received: MaybeSomeWdioElementOrArrayMaybePromise,
    attribute: string,
): Promise<AssertionResult>

/**
 * Element $() API
 * When called with an expected attribute name and value.
 */
export async function toHaveAttribute(
    received: WdioElementMaybePromise,
    attribute: string,
    value: MaybeOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * When called with an expected attribute name and value.
 */
export async function toHaveAttribute(
    received: WdioElementsMaybePromise,
    attribute: string,
    value: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

export async function toHaveAttribute(
    received: MaybeSomeWdioElementOrArrayMaybePromise,
    attribute: string,
    value?: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const matcherName = 'toHaveAttribute'
    const paramsCount = arguments.length

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: [attribute, value],
        options,
    })

    let expectedValue: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>
    if (value === undefined) {
        if (paramsCount > 2) {
            // User have passed an explicit undefined or null value, which is deprecated. We will log a warning to inform the user about this deprecation.
            console.warn('Using undefined or null as value for toHaveAttribute is deprecated and will be removed in v6.0.0. Please omit the third argument entirely or use toHaveAttribute(el, attribute, wdioExpect.anything(), options).')
        }
        expectedValue = wdioExpect.anything()
    } else {
        expectedValue = value
    }

    const result = await toHaveAttributeAndValue.call(this, received, attribute, expectedValue, options)

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
