import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareTextOrOneOf,
    enhanceError,
    waitUntil,
} from '../../utils.js'
import { fillSingleExpectedForElementArray } from '../../util/elementsUtil.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import { buildWdioAsymmetricMatchersWithOptions } from '../asymmetrics/asymmetricsUtils.js'
import { withStringOptions } from '../../util/expectedWithStringOptions.js'
import type { AssertionResult, HTMLOptions } from '../../publicTypes/options.js'

async function singleElementCompare(el: WebdriverIO.Element, html: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined, options: HTMLOptions): Promise<CompareResult<string>> {
    const actualHTML = await el.getHTML(options)
    return compareTextOrOneOf(actualHTML, html, options)
}

export async function toHaveHTML(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: HTMLOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { expectation = 'HTML', verb = 'have', isNot, matcherName = 'toHaveHTML' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const expectedWithOptions = buildWdioAsymmetricMatchersWithOptions(expectedValue, options)

    const { success: pass, actual: actualHTML, subject: elements, context: { isSome, matchingIndexes } = {}, expected, verdict, compared } = await waitUntil(
        async (iteration) => {
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                supportsArrayContaining: 'arrayOnly',
                matcherName,
                expectedValues: expectedWithOptions,
                singleElementCompare: (element, expectedValue: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>> | undefined) => singleElementCompare(element, expectedValue, options),
                context: { isNot, iteration },
            })
            return result
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expectedValues = expected ?? fillSingleExpectedForElementArray(elements, expectedWithOptions)
    const message = enhanceError(elements, withStringOptions(expectedValues, verdict, options, actualHTML), actualHTML, { isNot, isSome, matchingIndexes, stringOptions: options, compared }, verb, expectation, '', options)

    const result: AssertionResult = {
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
