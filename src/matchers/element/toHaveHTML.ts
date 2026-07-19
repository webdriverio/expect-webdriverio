import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareTextOrArray,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import type { MaybeArray, WdioElementOrArrayMaybePromise } from '../../types.js'

async function singleElementCompare(el: WebdriverIO.Element, html: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | undefined, options: ExpectWebdriverIO.HTMLOptions): Promise<CompareResult<string>> {
    const actualHTML = await el.getHTML(options)
    return compareTextOrArray(actualHTML, html, options)
}

export async function toHaveHTML(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
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
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | undefined) => singleElementCompare(element, expectedValue, options),
                isNot
            })
            elements = result.subject
            actualHTML = result.actual

            return result.success
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
