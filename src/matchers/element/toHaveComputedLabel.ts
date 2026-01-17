import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'
import { defaultMultipleElementsIterationStrategy, executeCommand } from '../../util/executeCommand.js'
import {
    compareText,
    compareTextWithArray,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function singleElementCompare(
    el: WebdriverIO.Element,
    label: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.HTMLOptions
) {
    const actualLabel = await el.getComputedLabel()
    if (Array.isArray(label)) {
        return compareTextWithArray(actualLabel, label, options)
    }
    return compareText(actualLabel, label, options)
}

async function multipleElementsStrategyCompare(
    el: WebdriverIO.Element,
    label: string | RegExp | WdioAsymmetricMatcher<string>,
    options: ExpectWebdriverIO.HTMLOptions
) {
    const actualLabel = await el.getComputedLabel()
    return compareText(actualLabel, label, options)
}

export async function toHaveComputedLabel(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'computed label', verb = 'have', isNot, matcherName = 'toHaveComputedLabel' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let el
    let actualLabel

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received,
                (element) => singleElementCompare(element, expectedValue, options),
                (elements) => defaultMultipleElementsIterationStrategy(elements, expectedValue, (element, label) => multipleElementsStrategyCompare(element, label, options))
            )
            el = result.elementOrArray
            actualLabel = result.valueOrArray

            return result
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(
        el,
        wrapExpectedWithArray(el, actualLabel, expectedValue),
        actualLabel,
        this,
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
