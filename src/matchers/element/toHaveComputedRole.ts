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
    role: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | undefined,
    options: ExpectWebdriverIO.HTMLOptions
) {
    const actualRole = await element.getComputedRole()
    return compareTextOrArray(actualRole, role, options)
}

export async function toHaveComputedRole(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
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
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | undefined) => singleElementCompare(element, expectedValue, options),
                isNot
            })
            el = result.subject
            actualRole = result.actual

            return result.success
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
