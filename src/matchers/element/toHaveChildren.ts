import type { AssertionResult } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, WdioElementOrArrayMaybePromise, WdioElementsMaybePromise } from '../../types.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { isEmptyOrLegacyNumberOptions, validateNumberArrayAndExtractOptions } from '../../util/numberOptionsUtil.js'
import {
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, expectedValue: NumberMatcher | undefined) {
    const children = await el.$$('./*').getElements()

    if (expectedValue === undefined) {
        return { result: false, value: children?.length }
    }

    return {
        result: expectedValue?.asymmetricMatch(children?.length) ?? false,
        value: children?.length
    }
}

/**
 * Verifies that the element(s) has children.
 * Same as `expect(el).toHaveChildren({ gte: 1 })` or `expect(el).toHaveChildren({ gte: 1 }, options)`.
 */
export async function toHaveChildren(
    received: WdioElementOrArrayMaybePromise,
): Promise<AssertionResult>

/**
 * @deprecated since 6.0.0, remove in v10.0.0.
 * Passing explicit `undefined` or `{}` as a value is deprecated.
 * Omit the second argument entirely or use `toHaveChildren(el, { gte: 1 }, options)`.
 */
export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValue: undefined, // {} also deprecated but we cannot use it as a type because it would match any object
    options?: ExpectWebdriverIO.CommandOptions
): Promise<AssertionResult>

/**
 * Element $() API
 * When called with an expected child count or number matcher.
 */
export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<AssertionResult>

/**
 * Eleement $$() API
 * When called with an expected child count or number matcher.
 */
export async function toHaveChildren(
    received: WdioElementsMaybePromise,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberMatcher>,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<AssertionResult>

/**
 * @deprecated since 6.0.0, remove in v10.0.0.
 * NumberOptions is no longer supported. Use `expect(el).toHaveChildren(numberMatcher, options)` instead.
 * Instead of `expect(el).toHaveChildren({ wait: 1 })` use `expect(el).toHaveChildren({ gte: 1 }, { wait: 1 })`.
 */
export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<AssertionResult>

export async function toHaveChildren(
    received: WdioElementOrArrayMaybePromise,
    expectedValueOrOptions?: MaybeArray<number | ExpectWebdriverIO.NumberMatcher> | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.CommandOptions,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { expectation = 'children', verb = 'have', isNot, matcherName = 'toHaveChildren' } = this

    const paramsCount = arguments.length

    if (paramsCount > 1 && (expectedValueOrOptions === undefined || isEmptyOrLegacyNumberOptions(expectedValueOrOptions))) {
        console.warn('Passing NumberOptions as the second argument to toHaveChildren is deprecated. Use a NumberMatcher instead. For example, `expect(el).toHaveChildren({ gte: 1 }, options)`')
    }

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: expectedValueOrOptions,
        options,
    })

    const { numberMatcher: expectedNumber, commandOptions } = validateNumberArrayAndExtractOptions(expectedValueOrOptions, options, { supportDefaultAsGteThen1: true })

    let subject
    let children
    const pass = await waitUntil(
        async () => {
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedNumber,
                singleElementCompare: (element, expectedValue: NumberMatcher | undefined) => condition(element, expectedValue),
                isNot
            })

            subject = result.subject
            children = result.actual

            return result.success
        },
        isNot,
        { wait: commandOptions.wait, interval: commandOptions.interval }
    )

    const expectedArray = wrapExpectedWithArray(subject, children, expectedNumber)
    const message = enhanceError(subject, expectedArray, children, this, verb, expectation, '', commandOptions)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName,
        expectedValue: expectedValueOrOptions,
        options,
        result
    })

    return result
}
