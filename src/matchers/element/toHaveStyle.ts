import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeArray, WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise } from '../../types.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareStyle,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, style: { [key: string]: string; } | undefined, options: ExpectWebdriverIO.StringOptions): Promise<CompareResult<{ [key: string]: string | undefined; } | undefined>> {
    if (style === undefined) {
        return { success: false, actual: undefined }
    }

    return compareStyle(el, style, options)
}

/**
 * Element $()
 */
export async function toHaveStyle(
    received: WdioElementMaybePromise,
    expectedValue: { [key: string]: string; },
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Elements $$()
 */
export async function toHaveStyle(
    received: WdioElementsMaybePromise,
    expectedValue: MaybeArray<{ [key: string]: string; }>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveStyle(
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArray<{ [key: string]: string; }>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<ExpectWebdriverIO.AssertionResult> {
    const { expectation = 'style', verb = 'have', isNot, matcherName = 'toHaveStyle' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { success: pass, actual: actualStyle, subject: el, context: { isSome } = {}, expected: expectedValues } = await waitUntil(
        async (iteration) => {
            return await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                // TODO try to make the type work without casting expectedValues to { [key: string]: string; } | undefined
                singleElementCompare: (element, expectedValues) => condition(element, expectedValues as { [key: string]: string; } | undefined, options),
                context: { isNot, iteration },
                strategy: 'NewStrictMultipleElements',
                strictConfiguration: { allowArrayWithSingleElement: false }
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expected = expectedValues ?? wrapExpectedWithArray(el, actualStyle, expectedValue)
    const message = enhanceError(el, expected, actualStyle, { isNot, isSome }, verb, expectation, '', options)

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
