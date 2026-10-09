import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import { fillSingleExpectedForElementArray } from '../../util/elementsUtil.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { validateNumberMatcherArray, type NumberMatcher } from '../../util/numberOptionsUtil.js'
import {
    enhanceError,
    waitUntil,
} from '../../utils.js'
import type { AssertionResult, CommandOptions, NumberMatcher as PublicNumberMatcher } from '../../publicTypes/options.js'

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
    expectedValue: number | PublicNumberMatcher,
    options?: CommandOptions
):Promise<AssertionResult>

/**
 * Elements $$()
 */
export async function toHaveWidth(
    received: WdioElementsMaybePromise,
    expectedValue: MaybeArray<number | PublicNumberMatcher>,
    options?: CommandOptions
):Promise<AssertionResult>

/**
 * Multi-remote $() or $$(): one expected value for every instance, or one per instance
 */
export async function toHaveWidth(
    received: WdioMultiRemoteElements,
    expectedValue: MaybeArray<number | PublicNumberMatcher> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<number | PublicNumberMatcher>>,
    options?: CommandOptions
):Promise<AssertionResult>

export async function toHaveWidth(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArray<number | PublicNumberMatcher> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<number | PublicNumberMatcher>>,
    options: CommandOptions = DEFAULT_OPTIONS
):Promise<AssertionResult> {
    const { expectation = 'width', verb = 'have', isNot, matcherName = 'toHaveWidth' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const expectedNumber = validateNumberMatcherArray(expectedValue)

    const { success: pass, actual: actualWidth, subject: elements, context: { isSome, matchingIndexes } = {}, expected } = await waitUntil(
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

    const expectedValues = expected ?? fillSingleExpectedForElementArray(elements, expectedNumber)
    const message = enhanceError(
        elements,
        expectedValues,
        actualWidth,
        { isNot, isSome, matchingIndexes },
        verb,
        expectation,
        '',
        options,
    )

    const result: AssertionResult = {
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
