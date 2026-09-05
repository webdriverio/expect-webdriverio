import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareTextOrArray,
    enhanceError,
    getFeatureFlagValue,
    isAsymmetricMatcher,
    waitUntil,
} from '../../utils.js'
import type { MaybeArray, MaybeSomeWdioElementOrArrayMaybePromise } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { awaitElementOrArray, fillSingleExpectedForElementArray, isStrictlyElementArray } from '../../util/elementsUtil.js'
import { refreshElementArray } from '../../util/refetchElements.js'
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
    const arrayContaining = isAsymmetricMatcher(expectedValue) && expectedValue.constructor?.name === 'ArrayContaining'
        ? expectedValue
        : undefined

    const isNewStrictCompare = getFeatureFlagValue(options, 'useToHaveTextStrictMultiElementsCompareStrategy')
    const { success: pass, actual: actualText, subject: subject, context: { isSome } = {} } = await waitUntil(
        async (iteration) => {
            if (arrayContaining) {
                const { elements, selector, other } = await awaitElementOrArray(received)
                if (!elements) {
                    return { subject: selector ?? other, actual: undefined, success: !!isNot, abort: true }
                }
                if (iteration > 0 && isStrictlyElementArray(elements)) {
                    await refreshElementArray(elements)
                }

                const settled = await Promise.allSettled(Array.from(elements).map(async (element) => element.getText()))
                const actual = settled.map((result) => {
                    if (result.status === 'rejected') {
                        throw result.reason
                    }
                    return result.value
                })
                return {
                    subject: elements,
                    actual,
                    success: arrayContaining.asymmetricMatch(actual),
                    abort: elements.length === 0 && !isStrictlyElementArray(elements),
                }
            }

            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
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

    if (arrayContaining && actualText === undefined) {
        throw new Error('toHaveText with arrayContaining requires an array of elements')
    }

    const expected = arrayContaining ?? fillSingleExpectedForElementArray(subject, expectedValue)
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
