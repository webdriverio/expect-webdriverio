import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareTextOrOneOf,
    enhanceError,
    waitUntil,
} from '../../utils.js'
import { fillSingleExpectedForElementArray } from '../../util/elementsUtil.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import { withStringOptions } from '../../util/expectedWithStringOptions.js'
import type { AssertionResult, StringOptions } from '../../publicTypes/options.js'

async function singleElementCompare(
    element: WebdriverIO.Element,
    label: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined,
    options: StringOptions
) {
    const actualLabel = await element.getComputedLabel()
    return compareTextOrOneOf(actualLabel, label, options)

}

export async function toHaveComputedLabel(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'computed label', verb = 'have', isNot, matcherName = 'toHaveComputedLabel' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const expectedWithOptions = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const { success: pass, actual: actualLabel, subject: el, context: { isSome, matchingIndexes } = {}, expected, verdict, compared } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                supportsArrayContaining: 'arrayOnly',
                matcherName,
                expectedValues: expectedWithOptions,
                singleElementCompare: (element, expectedValue: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined) => singleElementCompare(element, expectedValue, options),
                context: { isNot, iteration },
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(
        el,
        withStringOptions(expected ?? fillSingleExpectedForElementArray(el, expectedWithOptions), verdict, options, actualLabel),
        actualLabel,
        { isNot, isSome, matchingIndexes, stringOptions: options, compared },
        verb,
        expectation,
        '',
        options
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
