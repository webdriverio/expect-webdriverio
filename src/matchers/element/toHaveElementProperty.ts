import type { AsyncAssertionResult } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import { isStringOptions } from '../../util/commandOptionsUtils.js'
import {
    compareText,
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(
    el: WebdriverIO.Element,
    property: string,
    expectedValue: unknown,
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

    return compareText(propertyValue.toString(), expectedValue as string | RegExp | AsymmetricMatcher<string>, options)
}

/**
 * @deprecated since 5.7.1 Passing explicit `undefined` as a value is deprecated. Omit the third argument entirely or use `toHaveElementProperty(el, property, options)`.
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
    received: WdioElementMaybePromise,
    property: string,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AsyncAssertionResult>

/**
 * When called with an expected property name and value.
 */
export async function toHaveElementProperty(
    received: WdioElementMaybePromise,
    property: string,
    value: string | number | RegExp | AsymmetricMatcher<string>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AsyncAssertionResult>

export async function toHaveElementProperty(
    received: WdioElementMaybePromise,
    property: string,
    valueOrOptions?: string | number | RegExp | AsymmetricMatcher<string> | null | ExpectWebdriverIO.StringOptions,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AsyncAssertionResult> {
    let value: string | number | RegExp | AsymmetricMatcher<string> | null | undefined

    // Determine if the third argument is actually options or the expected value
    if (isStringOptions(valueOrOptions)) {
        options = valueOrOptions
        value = undefined
    } else {
        value = valueOrOptions as string | number | RegExp | AsymmetricMatcher<string> | null
    }

    const matcherName = 'toHaveElementProperty'
    const isNot = this.isNot
    const { expectation = 'property', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: [property, value],
        options,
    })

    let el = await received?.getElement()
    let prop: unknown
    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [property, value])
            el = result.el as WebdriverIO.Element
            prop = result.values

            return result.success
        },
        isNot,
        options
    )

    let message: string
    if (value === undefined) {
        message = enhanceError(el, !isNot, pass, this, verb, expectation, property, options)
    } else {
        const expected = wrapExpectedWithArray(el, prop, value)
        message = enhanceError(el, expected, prop, this, verb, expectation, property, options)
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
