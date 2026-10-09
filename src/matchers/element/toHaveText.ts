import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareTextOrOneOf,
    enhanceError,
    waitUntil,
} from '../../utils.js'
import { isListMatcher } from '../../util/asymmetricMatcherUtil.js'
import type { MaybeArray, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { fillSingleExpectedForElementArray } from '../../util/elementsUtil.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import { withStringOptions } from '../../util/expectedWithStringOptions.js'

async function compareElement(el: WebdriverIO.Element, expectedText: MaybeArray<string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.OneOfPartialMatcher<string>> | undefined, options: ExpectWebdriverIO.StringOptions): Promise<CompareResult<string>> {
    const actualText = await el.getText()

    return compareTextOrOneOf(actualText, expectedText, options)
}

export async function toHaveText(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | ExpectWebdriverIO.OneOfPartialMatcher<string>
        | MultiRemoteValues<MaybeArray<string | RegExp | AsymmetricMatcher<string>> | ExpectWebdriverIO.OneOfPartialMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'text', verb = 'have', isNot, matcherName = 'toHaveText' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    expectedValue = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const { success: pass, actual: actualText, subject, context: { isSome, matchingIndexes } = {}, expected, verdict } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                supportsArrayContaining: 'arrayOnly',
                singleElementCompare: (element, values: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | ExpectWebdriverIO.OneOfPartialMatcher<string> | undefined) => {
                    return compareElement(element, values, options)
                },
                context: { isNot, iteration },
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    if (isListMatcher(expectedValue) && actualText === undefined) {
        throw new Error('toHaveText with a list matcher (arrayContaining, arrayWithExactContents or arrayOf) requires an array of elements')
    }

    const finalExpected = expected ?? fillSingleExpectedForElementArray(subject, expectedValue)
    const message = enhanceError(subject, withStringOptions(finalExpected, verdict, options), actualText, { isNot, isSome, matchingIndexes }, verb, expectation, '', options)
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
