import { waitUntil, enhanceError, compareNumbers, numberError } from '../../utils.js'
import { refetchElements } from '../../util/refetchElements.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise, WdioElements } from '../../types.js'
import { validateNumberOptions } from '../../util/numberOptionsUtil.js'

export async function toBeElementsArrayOfSize(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberOptions,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'elements array of size', verb = 'be' } = this

    await options.beforeAssertion?.({
        matcherName: 'toBeElementsArrayOfSize',
        expectedValue,
        options,
    })

    const numberOptions = validateNumberOptions(expectedValue)

    // Why not await in the waitUntil and use it to refetch in case of failure?
    let elements = await received as WdioElements
    const originalLength = elements.length

    const pass = await waitUntil(async () => {
        /**
         * check numbers first before refetching elements
         */
        const isPassing = compareNumbers(elements.length, numberOptions)
        if (isPassing) {
            return isPassing
        }

        // TODO analyse this refetch purpose if needed in more places or just pas false to have waitUntil to refetch with the await inside waitUntil
        elements = await refetchElements(elements, numberOptions.wait, true)
        return false
    }, isNot, { ...numberOptions, ...options })

    if (Array.isArray(received) && pass) {
        for (let index = originalLength; index < elements.length; index++) {
            received.push(elements[index])
        }
    }

    const error = numberError(numberOptions)
    const message = enhanceError(elements, error, originalLength, this, verb, expectation, '', numberOptions)

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toBeElementsArrayOfSize',
        expectedValue,
        options,
        result
    })

    return result
}
