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
    role: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.HTMLOptions
) {
    const actualRole = await el.getComputedRole()
    if (Array.isArray(role)) {
        return compareTextWithArray(actualRole, role, options)
    }
    return compareText(actualRole, role, options)
}

async function multipleElementsStrategyCompare(
    el: WebdriverIO.Element,
    role: string | RegExp | WdioAsymmetricMatcher<string>,
    options: ExpectWebdriverIO.HTMLOptions
) {
    const actualRole = await el.getComputedRole()
    return compareText(actualRole, role, options)
}

export async function toHaveComputedRole(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'computed role', verb = 'have', isNot, matcherName = 'toHaveComputedRole' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let el
    let actualRole

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received,
                (element) => singleElementCompare(element, expectedValue, options),
                async (elements) => defaultMultipleElementsIterationStrategy(elements,
                    expectedValue,
                    (element, expected) => multipleElementsStrategyCompare(element, expected, options)
                )
            )
            el = result.elementOrArray
            actualRole = result.valueOrArray

            return result
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(
        el,
        wrapExpectedWithArray(el, actualRole, expectedValue),
        actualRole,
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
