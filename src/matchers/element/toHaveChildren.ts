import type { AssertionResult } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { isEmptyOrLegacyNumberOptions, validateNumberArrayAndExtractOptions } from '../../util/numberOptionsUtil.js'
import {
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, expectedValue: NumberMatcher | undefined): Promise<CompareResult<number | null>> {
    const children = await el.$$('./*').getElements()

    if (expectedValue === undefined) {
        return { success: false, actual: children?.length }
    }

    return {
        success: expectedValue?.asymmetricMatch(children?.length) ?? false,
        actual: children?.length
    }
}

/**
 * Verifies that the element(s) has children.
 * Same as `expect(el).toHaveChildren({ gte: 1 })` or `expect(el).toHaveChildren({ gte: 1 }, options)`.
 */
export async function toHaveChildren(
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
): Promise<AssertionResult>

/**
 * @deprecated since 6.0.0, remove in v8.0.0.
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
 * @deprecated since 6.0.0, remove in v8.0.0.
 * NumberOptions is no longer supported. Use `expect(el).toHaveChildren(numberMatcher, options)` instead.
 * Instead of `expect(el).toHaveChildren({ wait: 1 })` use `expect(el).toHaveChildren({ gte: 1 }, { wait: 1 })`.
 */
export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<AssertionResult>

export async function toHaveChildren(
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValueOrOptions?: MaybeArray<number | ExpectWebdriverIO.NumberMatcher> | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.CommandOptions,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { expectation = 'children', verb = 'have', isNot, matcherName = 'toHaveChildren' } = this

    const paramsCount = arguments.length

    if (paramsCount > 1 && (expectedValueOrOptions === undefined || isEmptyOrLegacyNumberOptions(expectedValueOrOptions))) {
        console.warn('Passing undefined or NumberOptions as the second argument to toHaveChildren is deprecated. Use a NumberMatcher instead. For example, `expect(el).toHaveChildren({ gte: 1 }, options)`')
    }

    await options.beforeAssertion?.({
        matcherName,
        expectedValue: expectedValueOrOptions,
        options,
    })

    const { numberMatcher: expectedNumber, commandOptions } = validateNumberArrayAndExtractOptions(expectedValueOrOptions, options, { supportDefaultAsGteThen1: true })

    const { success: pass, actual: children, subject, context: { isSome } = {}, expected } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedNumber,
                singleElementCompare: (element, expectedValue: NumberMatcher | undefined) => condition(element, expectedValue),
                context: { isNot, iteration },
                strategy: 'NewStrictMultipleElements',
            })
        },
        isNot,
        { wait: commandOptions.wait, interval: commandOptions.interval }
    )

    const expectedArray = expected ?? wrapExpectedWithArray(subject, children, expectedNumber)
    const message = enhanceError(subject, expectedArray, children, { isNot, isSome }, verb, expectation, '', commandOptions)
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
