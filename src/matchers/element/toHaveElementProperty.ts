import type { AssertionResult } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, WdioElementOrArrayMaybePromise, WdioElementsMaybePromise } from '../../types.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { expect as wdioExpect } from '../../index.js'
import {
    compareText,
    enhanceError,
    isAsymmetricMatcher,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import { OneOfMatcher } from '../asymmetrics/oneOf.js'

async function condition(
    el: WebdriverIO.Element,
    property: string,
    expectedValue: MaybeOneOf<string | number | RegExp | AsymmetricMatcher<string>> | null | undefined, // TODO: review if an array of expected values should be supported for this matcher similarly as other matchers
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { asString = false } = options

    const propertyValue = await el.getProperty(property)

    if (propertyValue === null || propertyValue === undefined || (!(expectedValue instanceof RegExp) && typeof propertyValue !== 'string' && !asString)) {
        if (isAsymmetricMatcher(expectedValue)) {
            return { result: expectedValue.asymmetricMatch(propertyValue), value: propertyValue }
        }
        return { result: propertyValue === expectedValue, value: propertyValue }
    } else if ( expectedValue instanceof OneOfMatcher) {
        return { result: expectedValue.asymmetricMatch(propertyValue), value: propertyValue }
    }

    // To review the cast to be more type safe but for now let's keep the existing behavior to ensure no regression
    return compareText(propertyValue.toString(), expectedValue as string | RegExp | AsymmetricMatcher<string> | null | undefined, options)
}

/**
 * @deprecated since 6.0.0, remove in v10.0.0.
 * Passing explicit `undefined` or `null` as a value is deprecated.
 * Omit the third argument entirely or use `toHaveElementProperty(el, property, object.anything(), options)`.
 */
export async function toHaveElementProperty(
    received: WdioElementMaybePromise,
    property: string,
    value: undefined | null,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Elements $() or elements $$()
 * When called with an expected property name to verify if the property exists on a collection of elements.
 * Same as `toHaveElementProperty(el, property, expect.anything())`.
 */
export async function toHaveElementProperty(
    received: WdioElementOrArrayMaybePromise,
    property: string,
): Promise<AssertionResult>

/**
 * Elements $$()
 * When called with an expected property name and value on a collection of elements.
 */
export async function toHaveElementProperty(
    received: WdioElementsMaybePromise,
    property: string,
    value: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher> | MaybeArray<number> | null | undefined,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Element
 * When called with an expected property name and value on a single element.
 */
export async function toHaveElementProperty(
    received: WdioElementMaybePromise,
    property: string,
    value: MaybeOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher> | number,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

// Implementation signature broadened to accept union types safely
export async function toHaveElementProperty(
    received: WdioElementOrArrayMaybePromise,
    property: string,
    value?: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher> | MaybeArray<number> | null | undefined,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { expectation = 'property', verb = 'have', isNot, matcherName = 'toHaveElementProperty' } = this
    const paramsCount = arguments.length

    if (value === undefined || value === null) {
        if (paramsCount > 2) {
            // User have passed an explicit undefined or null value, which is deprecated. We will log a warning to inform the user about this deprecation.
            console.warn('Using undefined or null as value for toHaveElementProperty is deprecated and will be removed in v6.0.0. Please omit the third argument entirely or use toHaveElementProperty(el, property, object.anything(), options).')
        }
        value = wdioExpect.anything()
    }

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: [property, value],
        options,
    })

    value = buildWdioAsymmetricMatchersWithOptions(value, options)

    let elements
    let actualProppertyValue: unknown

    const pass = await waitUntil(
        async () => {
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: value,
                singleElementCompare: (element, expectedValue: MaybeOneOf<string | number | RegExp | AsymmetricMatcher<string>> | null | undefined) => {
                    return condition(element, property, expectedValue, options)
                },
                isNot,
                strategy: 'NewStrictMultipleElements',
                strictConfiguration: { allowArrayWithSingleElement: false }
            })
            elements = result.subject
            actualProppertyValue = result.actual

            return result.success
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expected = wrapExpectedWithArray(elements, actualProppertyValue, value)
    const message = enhanceError(elements, expected, actualProppertyValue, this, verb, expectation, property, options)

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName,
        expectedValue: [property, value],
        options,
        result
    })

    return result
}
