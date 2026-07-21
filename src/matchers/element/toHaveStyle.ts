import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeArray, WdioElementMaybePromise, WdioElementOrArrayMaybePromise, WdioElementsMaybePromise } from '../../types.js'
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
        return { result: false, value: undefined }
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
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<{ [key: string]: string; }>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<ExpectWebdriverIO.AssertionResult> {
    const { expectation = 'style', verb = 'have', isNot, matcherName = 'toHaveStyle' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let el
    let actualStyle

    const pass = await waitUntil(
        async () => {
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                // TODO try to make the type work without casting expectedValues to { [key: string]: string; } | undefined
                singleElementCompare: (element, expectedValues) => condition(element, expectedValues as { [key: string]: string; } | undefined, options),
                isNot,
                strategy: 'NewStrictMultipleElements',
                strictConfiguration: { allowArrayWithSingleElement: false }
            })
            el = result.subject
            actualStyle = result.actual

            return result.success
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const expected = wrapExpectedWithArray(el, actualStyle, expectedValue)
    const message = enhanceError(el, expected, actualStyle, this, verb, expectation, '', options)

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
