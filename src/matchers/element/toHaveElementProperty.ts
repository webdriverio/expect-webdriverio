import type { AsyncAssertionResult } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeArray, WdioElementMaybePromise, WdioElementOrArrayMaybePromise } from '../../types.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { isStringOptions } from '../../util/commandOptionsUtils.js'
import {
    compareText,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import { fillSingleExpectedForElementArray } from '../../util/elementsUtil.js'

async function condition(
    el: WebdriverIO.Element,
    property: string,
    expectedValue: unknown, // TODO: review if an array of expected values should be supported for this matcher similarly as other matchers
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { asString = false } = options

    const propertyValue = await el.getProperty(property)

    // As specified in the w3c spec, cases where property does not exist
    if (propertyValue === null || propertyValue === undefined) {
        return { result: false, value: propertyValue }
    }

    // As specified in the w3c spec, cases where property simply exists
    if (expectedValue === null || expectedValue === undefined) {
        return { result: true, value: propertyValue }
    }

    if (!(expectedValue instanceof RegExp) && typeof propertyValue !== 'string' && !asString) {
        return { result: propertyValue === expectedValue, value: propertyValue }
    }

    // To review the cast to be more type safe but for now let's keep the existing behavior to ensure no regression
    return compareText(propertyValue.toString(), expectedValue as string | RegExp | AsymmetricMatcher<string>, options)
}

/**
 * deprecated since 5.7.1, remove in v6.0.0. Passing explicit `undefined` as a value is deprecated. Omit the third argument entirely or use `toHaveElementProperty(el, property, options)`.
 */
export async function toHaveElementProperty(
    received: WdioElementMaybePromise,
    property: string,
    value: undefined | null,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AsyncAssertionResult>

/**
 * When called with only the property name (and optional configuration options).
 */
export async function toHaveElementProperty(
    received: WdioElementOrArrayMaybePromise,
    property: string,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AsyncAssertionResult>

/**
 * When called with an expected property name and value.
 */
export async function toHaveElementProperty(
    received: WdioElementOrArrayMaybePromise,
    property: string,
    value: MaybeArray<string | number | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AsyncAssertionResult>

export async function toHaveElementProperty(
    received: WdioElementOrArrayMaybePromise,
    property: string,
    valueOrOptions?: MaybeArray<string | number | RegExp | AsymmetricMatcher<string> | null> | ExpectWebdriverIO.StringOptions,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AsyncAssertionResult> {
    const { expectation = 'property', verb = 'have', isNot, isSome, matcherName = 'toHaveElementProperty' } = this
    let value: string | number | RegExp | AsymmetricMatcher<string> | null | undefined

    // Determine if the third argument is actually options or the expected value
    if (isStringOptions(valueOrOptions)) {
        options = valueOrOptions
        value = undefined
    } else {
        value = valueOrOptions as string | number | RegExp | AsymmetricMatcher<string> | null
    }

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: [property, value],
        options,
    })

    let elements
    let actualProppertyValue: unknown
    const pass = await waitUntil(
        async () => {
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: value,
                singleElementCompare: (element, expectedValue: MaybeArray<string | number | RegExp | AsymmetricMatcher<string> | null> | undefined) => condition(element, property, expectedValue, options),
                modifiers: { isNot, isSome },
            })
            elements = result.subject
            actualProppertyValue = result.actual

            return result.success
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    let message: string
    // TODO: review to handle null/undefined inside array of expected values, for now we will just handle the case where the expected value is undefined or null
    if (value === undefined) {
        const expected = fillSingleExpectedForElementArray(elements, '`a defined value`')
        const actual = actualProppertyValue
        message = enhanceError(elements, expected, actual, this, verb, expectation, property, options)
    } else {
        const expected = wrapExpectedWithArray(elements, actualProppertyValue, value)
        message = enhanceError(elements, expected, actualProppertyValue, this, verb, expectation, property, options)
    }

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
