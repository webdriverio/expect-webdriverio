import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { validateNumberMatcherArray } from '../../util/numberOptionsUtil.js'
import {
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import type { AssertionResult, CommandOptions, NumberMatcher as PublicNumberMatcher } from '../../publicTypes/options.js'

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
 * Element $() API
 * When called with an expected child count or number matcher.
 */
export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValue: number | PublicNumberMatcher,
    options?: CommandOptions
): Promise<AssertionResult>

/**
 * Eleement $$() API
 * When called with an expected child count or number matcher.
 */
export async function toHaveChildren(
    received: WdioElementsMaybePromise,
    expectedValue: MaybeArray<number | PublicNumberMatcher>,
    options?: CommandOptions
): Promise<AssertionResult>

/**
 * Multi-remote $() or $$(): one expected value for every instance, or one per instance
 */
export async function toHaveChildren(
    received: WdioMultiRemoteElements,
    expectedValue: MaybeArray<number | PublicNumberMatcher> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<number | PublicNumberMatcher>>,
    options?: CommandOptions
): Promise<AssertionResult>

export async function toHaveChildren(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue?: MaybeArray<number | PublicNumberMatcher> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<number | PublicNumberMatcher>>,
    options: CommandOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { expectation = 'children', verb = 'have', isNot, matcherName = 'toHaveChildren' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const expectedNumber = validateNumberMatcherArray(expectedValue, { supportDefaultAsGteThen1: true })

    const { success: pass, actual: children, subject, context: { isSome, matchingIndexes } = {}, expected } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedNumber,
                singleElementCompare: (element, expectedValue: NumberMatcher | undefined) => condition(element, expectedValue),
                context: { isNot, iteration },
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expectedArray = expected ?? wrapExpectedWithArray(subject, children, expectedNumber)
    const message = enhanceError(subject, expectedArray, children, { isNot, isSome, matchingIndexes }, verb, expectation, '', options)
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
