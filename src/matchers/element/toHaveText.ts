import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareText, compareTextWithArray,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import { executeCommand } from '../../util/executeCommand.js'
import type { MaybeArray, WdioElementOrArrayMaybePromise } from '../../types.js'
import { isElementArrayLike, map } from '../../util/elementsUtil.js'

async function singleElementCompare(el: WebdriverIO.Element, text: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>, options: ExpectWebdriverIO.StringOptions) {
    const actualText = await el.getText()
    const result = Array.isArray(text) ?
        compareTextWithArray(actualText, text, options).result
        : compareText(actualText, text, options).result

    return {
        value: actualText,
        result
    }
}

// Same as singleElementCompare (e.g `$()`) but with a deprecation notice for `compareTextWithArray` removal to have the same behavior across all matchers with `$$()`
async function multipleElementsStrategyCompare(el: WebdriverIO.Element, text: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>, options: ExpectWebdriverIO.StringOptions) {
    const actualText = await el.getText()
    const checkAllValuesMatchCondition = Array.isArray(text) ?
    // @deprecated: using compareTextWithArray for $$() is deprecated and will be removed in future versions since it does not do a strict comparison per element.
        compareTextWithArray(actualText, text, options).result
        : compareText(actualText, text, options).result

    return {
        value: actualText,
        result: checkAllValuesMatchCondition
    }
}

export async function toHaveText(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'text', verb = 'have', isNot, matcherName = 'toHaveText' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let elementOrArray
    let actualText

    const pass = await waitUntil(
        async () => {
            const commandResult = await executeCommand(received,
                undefined,
                async (elements) => {
                    if (isElementArrayLike(elements)) {
                        return map(elements, async (element) => multipleElementsStrategyCompare(element, expectedValue, options))
                    }
                    return [await singleElementCompare(elements, expectedValue, options)]
                }
            )
            elementOrArray = commandResult.elementOrArray
            actualText = commandResult.valueOrArray

            return commandResult
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(elementOrArray, wrapExpectedWithArray(elementOrArray, actualText, expectedValue), actualText, this, verb, expectation, '', options)
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
