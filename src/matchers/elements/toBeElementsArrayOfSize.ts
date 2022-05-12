import { waitUntil, enhanceError, compareNumbers, numberError, updateElementsArray } from '../../utils'
import { refetchElements } from '../../util/refetchElements'

export function toBeElementsArrayOfSize(received: WebdriverIO.ElementArray, expected: number | ExpectWebdriverIO.NumberOptions, options: ExpectWebdriverIO.StringOptions = {}): any {
    const isNot = this.isNot
    const { expectation = 'elements array of size', verb = 'be' } = this

    // type check
    let numberOptions: ExpectWebdriverIO.NumberOptions;
    if (typeof expected === 'number') {
        numberOptions = { eq: expected } as ExpectWebdriverIO.NumberOptions
    } else if (!expected || (typeof expected.eq !== 'number' && typeof expected.gte !== 'number' && typeof expected.lte !== 'number')) {
        throw new Error('Invalid params passed to toBeElementsArrayOfSize.')
    } else {
        numberOptions = expected
    }

    return browser.call(async () => {
        let elements = await received
        const arrLength = elements.length

        const pass = await waitUntil(async () => {
            elements = await refetchElements(elements, numberOptions.wait, true)
            return compareNumbers(elements.length, numberOptions)
        }, isNot, {...numberOptions, ...options})

        updateElementsArray(pass, received, elements, true)

        const error = numberError(numberOptions)
        const message = enhanceError(elements, error, arrLength, this, verb, expectation, '', numberOptions)

        return {
            pass,
            message: (): string => message
        }
    })
}
