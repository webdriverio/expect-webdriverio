import { waitUntil, enhanceError, } from '../../utils.js'
import { refetchElements } from '../../util/refetchElements.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementsMaybePromise } from '../../types.js'
import { validateNumberAndExtractOptions } from '../../util/numberOptionsUtil.js'
import { awaitElementArray } from '../../util/elementsUtil.js'

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

    const pass = await waitUntil(
        async () => {
            if (!elements) {
                return false
            }

            // Verify if size match first before refetching elements
            const isPassing = expectedNumber.match(elements.length)
            if (isPassing) {
                return isPassing
            }

            // TODO should we do this on other matchers??
            elements = await refetchElements(elements, commandOptions.wait, true)
            return false
        },
        isNot,
        { wait: commandOptions.wait, interval: commandOptions.interval }
    )

    // TODO By using `(await received).push(elements[index])` we could update Promises of arrays, should we support that?
    if (Array.isArray(received) && pass && originalLength !== undefined && elements) {
        for (let index = originalLength; index < elements.length; index++) {
            received.push(elements[index])
        }
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
