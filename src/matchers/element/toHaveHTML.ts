import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareTextOrOneOf,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import type { MaybeSomeWdioElementOrArrayMaybePromise } from '../../types.js'
import type { AssertionResult } from 'expect-webdriverio'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'

async function singleElementCompare(el: WebdriverIO.Element, html: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined, options: ExpectWebdriverIO.HTMLOptions): Promise<CompareResult<string>> {
    const actualHTML = await el.getHTML(options)
    return compareTextOrOneOf(actualHTML, html, options)
}

export async function toHaveHTML(
    received: MaybeSomeWdioElementOrArrayMaybePromise,
    expectedValue: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.HTMLOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { expectation = 'HTML', verb = 'have', isNot, matcherName = 'toHaveHTML' } = this

    expectedValue = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { success: pass, actual: actualHTML, subject: elements, context: { isSome } = {} } = await waitUntil(
        async (iteration) => {
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, expectedValue: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined) => singleElementCompare(element, expectedValue, options),
                context: { isNot, iteration },
                strategy: 'NewStrictMultipleElements',
                // TODO: Replace (without breaking the API) array by oneOf/anyOf as will we should put in place for multiple elements
                strictConfiguration: { allowArrayWithSingleElement: true }
            })
            return result
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expectedValues = wrapExpectedWithArray(elements, actualHTML, expectedValue)
    const message = enhanceError(elements, expectedValues, actualHTML, { isNot, isSome }, verb, expectation, '', options)

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
