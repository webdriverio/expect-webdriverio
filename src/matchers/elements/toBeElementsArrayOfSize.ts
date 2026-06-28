import { waitUntil, enhanceError, compareNumbers, numberError } from '../../utils.js'
import { refetchElements } from '../../util/refetchElements.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElements, WdioElementsMaybePromise } from '../../types.js'
import { validateNumberOptions } from '../../util/numberOptionsUtil.js'

export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberOptions,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'elements array of size', verb = 'be' } = this
    const matcherName = 'toBeElementsArrayOfSize'

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const  { numberMatcher: numberOptions, numberCommandOptions } = validateNumberOptions(expectedValue)

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
        elements = await refetchElements(elements, numberCommandOptions?.wait ?? options.wait, true)
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
        matcherName,
        expectedValue,
        options,
        result
    })

    return result
}
