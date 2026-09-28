import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import { wrapExpectedWithArray } from '../../util/elementsUtil.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { validateNumberMatcherArray } from '../../util/numberOptionsUtil.js'
import {
    enhanceError,
    waitUntil,
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, expectedNumber: NumberMatcher | undefined): Promise<CompareResult<number | null>> {
    const actualHeight = await el.getSize('height')

    return {
        success: expectedNumber?.asymmetricMatch(actualHeight) ?? false,
        actual: actualHeight
    }
}

/**
 * Element $()
 */
export async function toHaveHeight(
    received: WdioElementMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Elements $$()
 */
export async function toHaveHeight(
    received: WdioElementsMaybePromise,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberMatcher>,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Multi-remote $() or $$(): one expected value for every instance, or one per instance
 */
export async function toHaveHeight(
    received: WdioMultiRemoteElements,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberMatcher> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<number | ExpectWebdriverIO.NumberMatcher>>,
    options?: ExpectWebdriverIO.CommandOptions
):Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveHeight(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberMatcher> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<number | ExpectWebdriverIO.NumberMatcher>>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'height', verb = 'have', isNot, matcherName = 'toHaveHeight' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const expectedNumber = validateNumberMatcherArray(expectedValue)

    const { success: pass, actual: actualHeight, subject: elements, context: { isSome } = {}, expected } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedNumber,
                singleElementCompare: (element, expectedNumber: NumberMatcher | undefined) => condition(element, expectedNumber),
                context: { isNot, iteration },
                strictConfiguration: { allowArrayWithSingleElement: false }
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expectedValues = expected ?? wrapExpectedWithArray(elements, actualHeight, expectedNumber)
    const message = enhanceError(
        elements,
        expectedValues,
        actualHeight,
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
