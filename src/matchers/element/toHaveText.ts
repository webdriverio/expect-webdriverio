import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareTextOrArray,
    enhanceError,
    getFeatureFlagValue,
    isArrayContainingMatcher,
    waitUntil,
} from '../../utils.js'
import type { MaybeArray, MaybeSomeWdioElementOrArrayMaybePromise } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { fillSingleExpectedForElementArray } from '../../util/elementsUtil.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'

async function compareElement(el: WebdriverIO.Element, expectedText: MaybeArray<string | RegExp | AsymmetricMatcher<string> | ExpectWebdriverIO.OneOfPartialMatcher<string>> | undefined, options: ExpectWebdriverIO.StringOptions): Promise<CompareResult<string>> {
    const actualText = await el.getText()

    return compareTextOrArray(actualText, expectedText, options)
}

export async function toHaveText(
    received: MaybeSomeWdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | ExpectWebdriverIO.OneOfPartialMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'text', verb = 'have', isNot, matcherName = 'toHaveText' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    expectedValue = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const isNewStrictCompare = getFeatureFlagValue(options, 'useToHaveTextStrictMultiElementsCompareStrategy')
    const { success: pass, actual: actualText, subject: subject, context: { isSome } = {} } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                supportsArrayContaining: 'arrayOnly',
                singleElementCompare: (element, values: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | ExpectWebdriverIO.OneOfPartialMatcher<string> | undefined) => {
                    return compareElement(element, values, options)
                },
                context: { isNot, iteration },
                strategy: isNewStrictCompare ? 'NewStrictMultipleElements' : 'LegacyLooseMultipleElements',
                strictConfiguration: { allowArrayWithSingleElement: true }
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    if (isArrayContainingMatcher(expectedValue) && actualText === undefined) {
        throw new Error('toHaveText with arrayContaining requires an array of elements')
    }

    const expected = fillSingleExpectedForElementArray(subject, expectedValue)
    const message = enhanceError(subject, expected, actualText, { isNot, isSome }, verb, expectation, '', options)
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
