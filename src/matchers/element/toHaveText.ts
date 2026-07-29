import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareTextOrArray,
    enhanceError,
    getFeatureFlagValue,
    waitUntil,
} from '../../utils.js'
import type { MaybeArray, WdioElementOrArrayMaybePromise } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { fillSingleExpectedForElementArray } from '../../util/elementsUtil.js'
import { injectOptionIntoWdioAsymmetricMatchers } from '../asymmetrics/asymmetricsUtils.js'
import type { OneOfMatcher } from '../asymmetrics/oneOf.js'

async function compareElement(el: WebdriverIO.Element, expectedText: MaybeArray<string | RegExp | AsymmetricMatcher<string> | OneOfMatcher> | undefined, options: ExpectWebdriverIO.StringOptions): Promise<CompareResult<string>> {
    const actualText = await el.getText()

    return compareTextOrArray(actualText, expectedText, options)
}

export async function toHaveText(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | OneOfMatcher,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'text', verb = 'have', isNot, matcherName = 'toHaveText' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    injectOptionIntoWdioAsymmetricMatchers(expectedValue, options)

    let actualText: string | string[] | undefined
    let subject: unknown = received
    const isNewStrictCompare = getFeatureFlagValue(options, 'useToHaveTextStrictMultiElementsCompareStrategy')
    const pass = await waitUntil(
        async () => {
            const commandResult = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, values: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | OneOfMatcher | undefined) => {
                    return compareElement(element, values, options)
                },
                isNot,
                strategy: isNewStrictCompare ? 'NewStrictMultipleElements' : 'LegacyLooseMultipleElements',
                // TODO: Replace (without breaking the API) array by oneOf/anyOf as will we should put in place for multiple elements
                strictConfiguration: { allowArrayWithSingleElement: true }
            })
            subject = commandResult.subject
            actualText = commandResult.actual

            return commandResult.success
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expected = fillSingleExpectedForElementArray(subject, expectedValue)
    const message = enhanceError(subject, expected, actualText, this, verb, expectation, '', options)
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
