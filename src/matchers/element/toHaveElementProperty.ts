import type { AssertionResult } from 'expect-webdriverio'
import { equals } from '../../jasmineUtils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElementArray, WdioMultiRemoteElements } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { expect } from 'expect'
import {
    compareText,
    enhanceError,
    isAsymmetricMatcher,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import { isOneOfMatcher } from '../asymmetrics/oneOf.js'

async function condition(
    el: WebdriverIO.Element,
    property: string,
    expectedValue: MaybeOneOf<string | number | RegExp | AsymmetricMatcher<string>> | null | undefined, // TODO: review if an array of expected values should be supported for this matcher similarly as other matchers
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<CompareResult<unknown>> {
    const { asString = false } = options

    const propertyValue = await el.getProperty(property)

    if (propertyValue === null || propertyValue === undefined || (!(expectedValue instanceof RegExp) && typeof propertyValue !== 'string' && !asString)) {
        if (isAsymmetricMatcher(expectedValue)) {
            return { success: equals(propertyValue, expectedValue), actual: propertyValue }
        }
        return { success: propertyValue === expectedValue, actual: propertyValue }
    } else if (isOneOfMatcher(expectedValue)) {
        return { success: expectedValue.asymmetricMatch(propertyValue), actual: propertyValue }
    }

    // To review the cast to be more type safe but for now let's keep the existing behavior to ensure no regression
    return compareText(propertyValue.toString(), expectedValue as string | RegExp | AsymmetricMatcher<string> | null | undefined, options)
}

/**
 * Elements $() or elements $$()
 * When called with an expected property name to verify if the property exists on a collection of elements.
 * Same as `toHaveElementProperty(el, property, expect.anything())`.
 */
export async function toHaveElementProperty(
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    property: string,
): Promise<AssertionResult>

/**
 * Elements $$()
 * When called with an expected property name and value on a collection of elements.
 */
export async function toHaveElementProperty(
    received: WdioElementsMaybePromise,
    property: string,
    value: Exclude<MaybeArrayOrOneOf<string | number | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher | null>, null>,
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
/**
 * Multi-Remote Element $() API: one value for every instance, or one per instance with `expect.multiRemote()`
 * (a plain object is a literal property value)
 */
export async function toHaveElementProperty(
    received: WebdriverIO.MultiRemoteElement,
    property: string,
    value: SingleOrMultiRemoteMatcher<string | number | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher | null>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Elements $$() API: one value (or one per element) for every instance, or one per instance with
 * `expect.multiRemote()` (a plain object is a literal property value)
 */
export async function toHaveElementProperty(
    received: WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray,
    property: string,
    value: MaybeArrayOrOneOf<string | number | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher | null> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArrayOrOneOf<string | number | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher | null>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Elements $() or $$()
 */
export async function toHaveElementProperty(
    received: WdioMultiRemoteElements,
    property: string,
    value: SingleOrMultiRemoteMatcher<string | number | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher | null>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

export async function toHaveElementProperty(
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    property: string,
    value?: MaybeArrayOrOneOf<string | number | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher | null> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArrayOrOneOf<string | number | RegExp | AsymmetricMatcher<string> | WdioAnythingAsymmetricMatcher | null>> | undefined,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    // A property value can itself be an object, so a plain object is a literal unless the caller knows better (e.g. `toHaveValue`)
    const { expectation = 'property', verb = 'have', isNot, matcherName = 'toHaveElementProperty', allowObjectExpectedValue = true } = this

    if (value === undefined || value === null) {
        value = expect.anything()
    }

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: [property, value],
        options,
    })

    value = buildWdioAsymmetricMatchersWithOptions(value, options)

    const { success: pass, actual: actualProppertyValue, subject: elements, context: { isSome } = {}, expected: expectedValues } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                supportsArrayContaining: true,
                expectedValues: value,
                singleElementCompare: (element, expectedValue: MaybeOneOf<string | number | RegExp | AsymmetricMatcher<string>> | null | undefined) => {
                    return condition(element, property, expectedValue, options)
                },
                context: { isNot, iteration },
                strictConfiguration: { allowArrayWithSingleElement: false, allowObjectExpectedValue }
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expected = expectedValues ?? wrapExpectedWithArray(elements, actualProppertyValue, value)
    const message = enhanceError(elements, expected, actualProppertyValue, { isNot, isSome }, verb, expectation, property, options)

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
