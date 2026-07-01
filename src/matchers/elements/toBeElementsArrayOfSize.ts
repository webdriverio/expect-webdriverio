import { waitUntil, enhanceError } from '../../utils.js'
import { refetchElements } from '../../util/refetchElements.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElements, WdioElementsMaybePromise } from '../../types.js'
import { validateNumberOptions as extractNumberAndOptions } from '../../util/numberOptionsUtil.js'

export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * @deprecated since version 5.7.0. Use `toBeElementsArrayOfSize` with NumberMatcher instead. This matcher will be removed in version 6.0.0.
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
    const matcherName = 'toBeElementsArrayOfSize'
    const { expectation = 'elements array of size', verb = 'be', isNot } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const  { numberMatcher, commandOptions } = extractNumberAndOptions(expectedValue, options)

    let elements = await received as WdioElements
    const originalLength = elements.length
    const pass = await waitUntil(
        async () => {
            /**
             * check numbers first before refetching elements
             */
            const isPassing = numberMatcher.match(elements.length)
            if (isPassing) {
                return isPassing
            }
            elements = await refetchElements(elements, commandOptions.wait, true)
            return false
        },
        isNot,
        { wait: commandOptions.wait, interval: commandOptions.interval })

    if (Array.isArray(received) && pass) {
        for (let index = originalLength; index < elements.length; index++) {
            received.push(elements[index])
        }
    }

    const message = enhanceError(elements, numberMatcher, originalLength, this, verb, expectation, '', commandOptions)

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
