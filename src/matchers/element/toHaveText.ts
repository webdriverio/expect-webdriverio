import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareText, compareTextWithArray,
    enhanceError,
    waitUntil,
} from '../../utils.js'
import type { MaybeArray, WdioElementOrArrayMaybePromise } from '../../types.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import { fillSingleExpectedForElementArray } from '../../util/elementsUtil.js'

async function compareElement(el: WebdriverIO.Element, expectedText: MaybeArray<string | RegExp | AsymmetricMatcher<string>>, options: ExpectWebdriverIO.StringOptions) {
    const actualText = await el.getText()
    const result = Array.isArray(expectedText) ?
        compareTextWithArray(actualText, expectedText, options).result
        : compareText(actualText, expectedText, options).result

    return {
        value: actualText,
        result
    }
}

export async function toHaveText(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'text', verb = 'have', isNot, matcherName = 'toHaveText' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let actualText: string | string[] | undefined
    let subject: unknown = received
    const isLegacyCompare = !options.featureFlags?.useToHaveTextNewMultiElementsCompareStrategy
    const pass = await waitUntil(
        async () => {
            const commandResult = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, values: MaybeArray<string | RegExp | AsymmetricMatcher<string>>) => {
                    return compareElement(element, values, options)
                },
                isNot,
                strategy: isLegacyCompare ? 'LegacyMultipleElements' : 'NewMultipleElements',
            })
            subject = commandResult.subject
            actualText = commandResult.actual as string | string[] | undefined

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
