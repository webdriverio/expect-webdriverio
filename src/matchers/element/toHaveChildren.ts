import type { AssertionResult } from 'expect-webdriverio'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, WdioElementOrArrayMaybePromise, WdioElementsMaybePromise } from '../../types.js'
import { isStrictlyCommandOptions } from '../../util/commandOptionsUtils.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { validateNumberArrayAndExtractOptions } from '../../util/numberOptionsUtil.js'
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
        result: expectedValue?.match(children?.length) ?? false,
        value: children?.length
    }
}

/**
 * deprecated since 5.7.1, remove in v6.0.0. Passing explicit `undefined` or `{}` as a value is deprecated. Omit the second argument entirely or use `toHaveChildren(el, options)`.
 */
export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValue: undefined, // {} also deprecated but we cannot use it as a type because it would match any object
    options?: ExpectWebdriverIO.CommandOptions
): Promise<AssertionResult>

/**
 * When called with only configuration options (omitting the expected count) where default is gte 1.
 */
export async function toHaveChildren(
    received: WdioElementOrArrayMaybePromise,
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
 * deprecated since 5.7.1, remove in v6.0.0. NumberOptions is no longer supported. Use `toHaveChildren(el, numberMatcher, options)` instead.
 */
export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<AssertionResult>

export async function toHaveChildren(
    received: WdioElementOrArrayMaybePromise,
    expectedValueOrOptions?: MaybeArray<number | ExpectWebdriverIO.NumberMatcher> | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.CommandOptions,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<AssertionResult> {
    const { expectation = 'children', verb = 'have', isNot, matcherName = 'toHaveChildren' } = this

    const hasOnlyTwoArgs = options === undefined
    options = options ?? DEFAULT_OPTIONS

    // Properly support new case `toHaveChildren(commandOptions)` where the second argument is the commandOptions and not a number or NumberMatcher for a clearer API instead of `toHaveChildren(undefined, commandOptions)`.
    if (hasOnlyTwoArgs && isStrictlyCommandOptions(expectedValueOrOptions)) {
        options = expectedValueOrOptions
        expectedValueOrOptions = undefined
    }

    const { numberMatcher: expectedNumber, commandOptions } = validateNumberArrayAndExtractOptions(expectedValueOrOptions, options, { supportDefaultAsGteThen1: true })

    await commandOptions.beforeAssertion?.({
        matcherName,
        expectedValue: expectedValueOrOptions, // Send unaltered value to the hook for backward compatibility
        options,
    })

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

    await commandOptions.afterAssertion?.({
        matcherName,
        expectedValue: expectedValueOrOptions,
        options,
        result
    })

    return result
}
