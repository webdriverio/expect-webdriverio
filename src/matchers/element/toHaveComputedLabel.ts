import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareTextOrArray,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function singleElementCompare(
    element: WebdriverIO.Element,
    label: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.HTMLOptions
) {
    const actualLabel = await element.getComputedLabel()
    const pass = compareTextOrArray(actualLabel, label, options)

    return {
        result: pass,
        value: actualLabel
    }
}

export async function toHaveComputedLabel(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
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
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>>) => singleElementCompare(element, expectedValue, options),
                isNot
            })
            el = result.subject
            actualLabel = result.actual

            return result.success
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
