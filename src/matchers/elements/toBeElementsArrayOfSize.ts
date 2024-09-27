import { waitUntil, enhanceError, compareNumbers, numberError } from '../../utils.js'
import { refetchElements } from '../../util/refetchElements.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementsMaybePromise } from '../../types.js'

export async function toBeElementsArrayOfSize(
    received: WdioElementsMaybePromise,
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

    // type check
    let numberOptions: ExpectWebdriverIO.NumberOptions;
    if (typeof expectedValue === 'number') {
        numberOptions = { eq: expectedValue } as ExpectWebdriverIO.NumberOptions
    } else if (!expectedValue || (typeof expectedValue.eq !== 'number' && typeof expectedValue.gte !== 'number' && typeof expectedValue.lte !== 'number')) {
        throw new Error('Invalid params passed to toBeElementsArrayOfSize.')
    } else {
        numberOptions = expectedValue
    }

    let elements = await received as WebdriverIO.ElementArray
    const originalLength = elements.length;
    const pass = await waitUntil(async () => {
        /**
         * check numbers first before refetching elements
         */
        const isPassing = compareNumbers(elements.length, numberOptions)
        if (isPassing) {
            return isPassing
        }
        elements = await refetchElements(elements, numberOptions.wait, true)
        return false
    }, isNot, {...numberOptions, ...options})

    if (Array.isArray(received) && pass) {
        received.length = 0;
        received.push(...elements);
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
