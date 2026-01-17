
import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareText,
    compareTextWithArray,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import { defaultMultipleElementsIterationStrategy, executeCommand } from '../../util/executeCommand.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'

async function singleElementCompare(el: WebdriverIO.Element, html: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>, options: ExpectWebdriverIO.HTMLOptions) {
    const actualHTML = await el.getHTML(options)
    if (Array.isArray(html)) {
        return compareTextWithArray(actualHTML, html, options)
    }
    return compareText(actualHTML, html, options)
}

async function multipleElementsStrategyCompare(el: WebdriverIO.Element, html: string | RegExp | WdioAsymmetricMatcher<string>, options: ExpectWebdriverIO.HTMLOptions) {
    const actualHTML = await el.getHTML(options)
    return compareText(actualHTML, html, options)
}

export async function toHaveHTML(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.HTMLOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'HTML', verb = 'have', isNot, matcherName = 'toHaveHTML' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let elements
    let actualHTML

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received,
                (element) => singleElementCompare(element, expectedValue, options),
                (elements) => defaultMultipleElementsIterationStrategy(elements, expectedValue, (el, html) => multipleElementsStrategyCompare(el, html, options))
            )
            elements = result.elementOrArray
            actualHTML = result.valueOrArray

            return result
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expectedValues = wrapExpectedWithArray(elements, actualHTML, expectedValue)
    const message = enhanceError(elements, expectedValues, actualHTML, this, verb, expectation, '', options)

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
