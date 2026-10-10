import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareTextOrOneOf,
    enhanceError,
    isAsymmetricMatcher,
    waitUntil,
} from '../../utils.js'
import { fillSingleExpectedForElementArray } from '../../util/elementsUtil.js'
import { expect } from 'expect'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import { withStringOptions } from '../../util/expectedWithStringOptions.js'
import type { AssertionResult, StringOptions } from '../../publicTypes/options.js'

async function conditionAttributeValueMatchWithExpected(el: WebdriverIO.Element, attribute: string, expectedValue: MaybeOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined, options: StringOptions): Promise<CompareResult<string | null>> {
    const attributeValue = await el.getAttribute(attribute)

    if (typeof attributeValue !== 'string' || expectedValue === undefined || expectedValue === null) {
        if (isAsymmetricMatcher(expectedValue)) {
            return { success: expectedValue.asymmetricMatch(attributeValue), actual: attributeValue }
        }
        return { success: attributeValue === expectedValue, actual: attributeValue }
    }

    // As the other string matchers: `expect.oneOf()` applies its own options, and the message shows the actual value as is
    return compareTextOrOneOf(attributeValue, expectedValue, options)
}

export async function toHaveAttributeAndValue(this: WdioMatcherContext, received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements | WdioMultiRemoteElements, attribute: string, expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>, options: StringOptions = DEFAULT_OPTIONS) {
    const { expectation = 'attribute', verb = 'have', isNot, matcherName = 'toHaveAttribute' } = this

    expectedValue = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const { success: pass, actual: attr, subject: el, context: { isSome, matchingIndexes } = {}, expected: expectedValues, verdict, compared } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                supportsArrayContaining: 'arrayOnly',
                matcherName,
                expectedValues: expectedValue,
                singleElementCompare: (element, values: string | RegExp | AsymmetricMatcher<string> | undefined) => {
                    return conditionAttributeValueMatchWithExpected(element, attribute, values, options)
                },
                context: { isNot, iteration },
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expected = expectedValues ?? fillSingleExpectedForElementArray(el, expectedValue)
    const message = enhanceError(el, withStringOptions(expected, verdict, options, attr), attr, { isNot, isSome, matchingIndexes, stringOptions: options, compared }, verb, expectation, attribute, options)

    return {
        pass,
        message: (): string => message
    }
}

/**
 * When called with only the attribute name. For options, use `toHaveAttribute(el, attribute, expect.anything(), options)`.
 */
export async function toHaveAttribute(
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
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
    options?: StringOptions
): Promise<AssertionResult>

/**
 * When called with an expected attribute name and value.
 */
export async function toHaveAttribute(
    received: WdioElementsMaybePromise,
    attribute: string,
    value: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>,
    options?: StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Element $() API
 * When called with an expected attribute name and value, shared or one per instance.
 */
export async function toHaveAttribute(
    received: WebdriverIO.MultiRemoteElement,
    attribute: string,
    value: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>,
    options?: StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Elements $$() API
 * When called with an expected attribute name and value, shared or one per instance, each maybe one per element.
 */
export async function toHaveAttribute(
    received: WebdriverIO.MultiRemoteElementArray,
    attribute: string,
    value: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>,
    options?: StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Element $() or Elements $$()
 */
export async function toHaveAttribute(
    received: WdioMultiRemoteElements,
    attribute: string,
    value: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>,
    options?: StringOptions
): Promise<AssertionResult>

export async function toHaveAttribute(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements | WdioMultiRemoteElements,
    attribute: string,
    value?: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher>,
    options: StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { matcherName = 'toHaveAttribute' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: [attribute, value],
        options,
    })

    const expectedValue = value ?? expect.anything()

    const result = await toHaveAttributeAndValue.call({ ...this, matcherName }, received, attribute, expectedValue, options)

    await options.afterAssertion?.({
        matcherName,
        expectedValue: [attribute, value],
        options,
        result
    })

    return result
}
