import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareTextOrOneOf,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import { withStringOptions } from '../../util/expectedWithStringOptions.js'

async function singleElementCompare(
    element: WebdriverIO.Element,
    label: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined,
    options: ExpectWebdriverIO.StringOptions
) {
    const actualLabel = await element.getComputedLabel()
    return compareTextOrOneOf(actualLabel, label, options)

}

export async function toHaveComputedLabel(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'computed label', verb = 'have', isNot, matcherName = 'toHaveComputedLabel' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    expectedValue = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const { success: pass, actual: actualLabel, subject: el, context: { isSome, matchingIndexes } = {}, expected, verdict } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                supportsArrayContaining: true,
                expectedValues: expectedValue,
                singleElementCompare: (element, expectedValue: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined) => singleElementCompare(element, expectedValue, options),
                context: { isNot, iteration },
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(
        el,
        withStringOptions(expected ?? wrapExpectedWithArray(el, actualLabel, expectedValue), verdict, options, actualLabel),
        actualLabel,
        { isNot, isSome, matchingIndexes, stringOptions: options },
        verb,
        expectation,
        '',
        options
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
