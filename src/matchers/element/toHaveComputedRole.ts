import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareTextOrOneOf,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import { withStringOptions } from '../../util/expectedWithStringOptions.js'

async function singleElementCompare(
    element: WebdriverIO.Element,
    role: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined,
    options: ExpectWebdriverIO.StringOptions
) {
    const actualRole = await element.getComputedRole()
    return compareTextOrOneOf(actualRole, role, options)
}

export async function toHaveComputedRole(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'computed role', verb = 'have', isNot, matcherName = 'toHaveComputedRole' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    expectedValue = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const { success: pass, actual: actualRole, subject: el, context: { isSome, matchingIndexes } = {}, expected, verdict, compared } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                supportsArrayContaining: true,
                expectedValues: expectedValue,
                singleElementCompare: (element, expectedValue: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined) => singleElementCompare(element, expectedValue, options),
                context: { isNot, iteration },
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(
        el,
        withStringOptions(expected ?? wrapExpectedWithArray(el, actualRole, expectedValue), verdict, options, actualRole),
        actualRole,
        { isNot, isSome, matchingIndexes, stringOptions: options, compared },
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
