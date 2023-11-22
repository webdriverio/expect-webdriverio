import { waitUntil, enhanceError, compareNumbers, numberError, updateElementsArray } from '../../utils.js'
import { refetchElements } from '../../util/refetchElements.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toBeElementsArrayOfSize(
    received: WebdriverIO.ElementArray,
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

    let elements = await received
    const arrLength = elements.length

    const pass = await waitUntil(async () => {
        elements = await refetchElements(elements, numberOptions.wait, true)
        return compareNumbers(elements.length, numberOptions)
    }, isNot, {...numberOptions, ...options})

    updateElementsArray(pass, received, elements, true)

    const error = numberError(numberOptions)
    const message = enhanceError(elements, error, arrLength, this, verb, expectation, '', numberOptions)

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
