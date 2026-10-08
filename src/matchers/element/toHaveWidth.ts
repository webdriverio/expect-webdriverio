import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import { wrapExpectedWithArray } from '../../util/elementsUtil.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { validateNumberMatcherArray, type NumberMatcher } from '../../util/numberOptionsUtil.js'
import {
    enhanceError,
    waitUntil,
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, expectedNumber: NumberMatcher | undefined) {
    const actualWidth = await el.getSize('width')

    return {
        success: expectedNumber?.asymmetricMatch(actualWidth) ?? false,
        actual: actualWidth
    }
}

/**
 * Element $()
 */
export async function toHaveWidth(
    received: WdioElementMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
):Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Elements $$()
 */
export async function toHaveWidth(
    received: WdioElementsMaybePromise,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberMatcher>,
    options?: ExpectWebdriverIO.CommandOptions
):Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Multi-remote $() or $$(): one expected value for every instance, or one per instance
 */
export async function toHaveWidth(
    received: WdioMultiRemoteElements,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberMatcher> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<number | ExpectWebdriverIO.NumberMatcher>>,
    options?: ExpectWebdriverIO.CommandOptions
):Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveWidth(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberMatcher> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<number | ExpectWebdriverIO.NumberMatcher>>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
):Promise<ExpectWebdriverIO.AssertionResult> {
    const { expectation = 'width', verb = 'have', isNot, matcherName = 'toHaveWidth' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const expectedNumber = validateNumberMatcherArray(expectedValue)

    const { success: pass, actual: actualWidth, subject: elements, context: { isSome } = {}, expected } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedNumber,
                singleElementCompare: (element, expectedNumber: NumberMatcher | undefined) => condition(element, expectedNumber),
                context: { isNot, iteration },
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expectedValues = expected ?? wrapExpectedWithArray(elements, actualWidth, expectedNumber)
    const message = enhanceError(
        elements,
        expectedValues,
        actualWidth,
        { isNot, isSome },
        verb,
        expectation,
        '',
        options,
    )

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName,
        expectedValue,
        options,
        result
    })

    return result
}
