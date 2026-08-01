import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromise, WdioElementsMaybePromise } from '../../types.js'
import { wrapExpectedWithArray } from '../../util/elementsUtil.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { validateNumberArrayAndExtractOptions, type NumberMatcher } from '../../util/numberOptionsUtil.js'
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
 * deprecated since 5.7.1, remove in 6.0.0. Use `toHaveWidth(received, NumberMatcher, options)` instead.
 */
export async function toHaveWidth(
    received: WdioElementMaybePromise,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveWidth(
    received: MaybeSomeWdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberMatcher> | ExpectWebdriverIO.NumberOptions,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
):Promise<ExpectWebdriverIO.AssertionResult> {
    const { expectation = 'width', verb = 'have', isNot, matcherName = 'toHaveWidth' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { numberMatcher: expectedNumber, commandOptions } = validateNumberArrayAndExtractOptions(expectedValue, options)

    const { success: pass, actual: actualWidth, subject: elements } = await waitUntil(
        async () => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedNumber,
                singleElementCompare: (element, expectedNumber: NumberMatcher | undefined) => condition(element, expectedNumber),
                isNot,
                strategy: 'NewStrictMultipleElements',
                strictConfiguration: { allowArrayWithSingleElement: false }
            })
        },
        isNot,
        { wait: commandOptions.wait, interval: commandOptions.interval }
    )

    const expectedValues = wrapExpectedWithArray(elements, actualWidth, expectedNumber)
    const message = enhanceError(
        elements,
        expectedValues,
        actualWidth,
        this,
        verb,
        expectation,
        '',
        commandOptions,
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
