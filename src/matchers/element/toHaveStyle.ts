import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeArray, WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareStyle,
    enhanceError,
    waitUntil,
} from '../../utils.js'
import { fillSingleExpectedForElementArray } from '../../util/elementsUtil.js'
import type { AssertionResult, StringOptions } from '../../publicTypes/options.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import { withStringOptions } from '../../util/expectedWithStringOptions.js'

/** Each CSS value is a string value, as in `toHaveText` */
type StyleRecord = { [key: string]: MaybeOneOf<string | RegExp | AsymmetricMatcher<string>> }

async function condition(el: WebdriverIO.Element, style: StyleRecord | undefined, options: StringOptions): Promise<CompareResult<Record<string, unknown> | undefined>> {
    if (style === undefined) {
        return { success: false, actual: undefined }
    }

    return compareStyle(el, style, options)
}

/**
 * Element $()
 */
export async function toHaveStyle(
    received: WdioElementMaybePromise,
    expectedValue: StyleRecord,
    options?: StringOptions
): Promise<AssertionResult>

/**
 * Elements $$()
 */
export async function toHaveStyle(
    received: WdioElementsMaybePromise,
    expectedValue: MaybeArray<StyleRecord>,
    options?: StringOptions
): Promise<AssertionResult>

/**
 * Multi-remote $() or $$(): one style for every instance, or one style per instance with `expect.multiRemote()`
 * (a plain object is always a literal style)
 */
export async function toHaveStyle(
    received: WdioMultiRemoteElements,
    expectedValue: MaybeArray<StyleRecord> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<StyleRecord>>,
    options?: StringOptions
): Promise<AssertionResult>

export async function toHaveStyle(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArray<StyleRecord> | ExpectWebdriverIO.MultiRemotePartialMatcher<MaybeArray<StyleRecord>>,
    options: StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { expectation = 'style', verb = 'have', isNot, matcherName = 'toHaveStyle' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    // Apply the string options to `expect.oneOf()`, also in the values of a style
    const expectedWithOptions = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const { success: pass, actual: actualStyle, subject: el, context: { isSome, matchingIndexes } = {}, expected: expectedValues, verdict, compared } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedWithOptions,
                // TODO try to make the type work without casting expectedValues to StyleRecord | undefined
                singleElementCompare: (element, expectedValues) => condition(element, expectedValues as StyleRecord | undefined, options),
                context: { isNot, iteration },
                strictConfiguration: { allowObjectExpectedValue: true }
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expected = expectedValues ?? fillSingleExpectedForElementArray(el, expectedWithOptions)
    const message = enhanceError(el, withStringOptions(expected, verdict, options, actualStyle), actualStyle, { isNot, isSome, matchingIndexes, stringOptions: options, compared }, verb, expectation, '', options)

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
