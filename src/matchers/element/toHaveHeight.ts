import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, WdioElementOrArrayMaybePromise, WdioElements } from '../../types.js'
import { wrapExpectedWithArray } from '../../util/elementsUtil.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { validateNumberArrayAndExtractOptions, matchNumber } from '../../util/numberOptionsUtil.js'
import {
    enhanceError,
    waitUntil,
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, expectedNumber: MaybeArray<NumberMatcher> | undefined) {
    const actualHeight = await el.getSize('height')

    return {
        result: matchNumber(actualHeight, expectedNumber),
        value: actualHeight
    }
}

export async function toHaveHeight(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberMatcher>,
    options?: ExpectWebdriverIO.CommandOptions
):Promise<ExpectWebdriverIO.AssertionResult>

/**
 * deprecated since 5.7.1, remove in 6.0.0. Use `toHaveHeight(received, NumberMatcher, options)` instead.
 */
export async function toHaveHeight(
    received: WdioElementMaybePromise,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveHeight(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'height', verb = 'have', isNot, isSome, matcherName = 'toHaveHeight' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { numberMatcher: expectedNumber, commandOptions } = validateNumberArrayAndExtractOptions(expectedValue, options)

    let elements: WebdriverIO.Element | WdioElements | unknown
    let actualHeight: string | number | (string | number | undefined)[] | undefined

    const pass = await waitUntil(
        async () => {
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedNumber,
                singleElementCompare: (element, expectedNumber: MaybeArray<NumberMatcher> | undefined) => condition(element, expectedNumber),
                modifiers: { isNot, isSome },
            })

            elements = result.subject
            actualHeight = result.actual

            return result.success
        },
        isNot,
        { wait: commandOptions.wait, interval: commandOptions.interval }
    )

    const expectedValues = wrapExpectedWithArray(elements, actualHeight, expectedNumber)
    const message = enhanceError(
        elements,
        expectedValues,
        actualHeight,
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
