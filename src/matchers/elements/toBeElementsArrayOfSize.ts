import { waitUntil, enhanceError, } from '../../utils.js'
import { refetchElements, syncronizeElements } from '../../util/refetchElements.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementsMaybePromise } from '../../types.js'
import { validateNumberAndExtractOptions } from '../../util/numberOptionsUtil.js'
import { awaitElementArray, isStrictlyElementArray } from '../../util/elementsUtil.js'

export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * deprecated since version 5.7.1. Use `toBeElementsArrayOfSize` with NumberMatcher instead. This matcher will be removed in version 6.0.0.
 */
export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'elements array of size', verb = 'be', isNot, matcherName = 'toBeElementsArrayOfSize' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const  { numberMatcher: expectedNumber, commandOptions } = validateNumberAndExtractOptions(expectedValue, options)

    // eslint-disable-next-line prefer-const
    let { elements, other } = await awaitElementArray(received)
    const originalLength =  elements ? elements.length : undefined

    const { success: pass } = await waitUntil(
        async (iteration) => {
            if (!elements) {
                return { success: false, subject: elements, actual: undefined, abort: true }
            }
            if (iteration > 0) {
                elements = await refetchElements(elements)
            }

            // Verify if size match first before refetching elements
            const isPassing = expectedNumber.asymmetricMatch(elements.length)
            if (isPassing) {
                return { success: isPassing, subject: elements, actual: elements.length }
            }

            return { success: false, subject: elements, actual: elements.length }
        },
        isNot,
        { wait: commandOptions.wait, interval: commandOptions.interval }
    )

    if (pass && originalLength !== undefined && elements !== received && (isStrictlyElementArray(received) || received instanceof Promise) && isStrictlyElementArray(elements)) {
        await syncronizeElements(received, elements)
    }

    const actual = originalLength
    const message = enhanceError(elements ?? other, expectedNumber, actual, this, verb, expectation, '', commandOptions)

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
